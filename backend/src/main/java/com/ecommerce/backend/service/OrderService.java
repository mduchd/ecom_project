package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.CreateOrderItemRequest;
import com.ecommerce.backend.dto.CreateOrderRequest;
import com.ecommerce.backend.dto.OrderPricing;
import com.ecommerce.backend.dto.OrderTrackingResponse;
import com.ecommerce.backend.dto.OrderTrackingStepResponse;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.exception.OrderTrackingNotFoundException;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OrderService {

    private static final String STATUS_PENDING = "Chờ duyệt";
    private static final String STATUS_SHIPPING = "Đang giao";
    private static final String STATUS_DELIVERED = "Đã giao";
    private static final String STATUS_CANCELED = "Đã hủy";
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("399000");
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("30000");
    private static final int CANCEL_TOKEN_MINUTES = 30;
    private static final DateTimeFormatter CODE_TIME = DateTimeFormatter.ofPattern("yyMMddHHmm", Locale.ROOT);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final LoyaltyService loyaltyService;

    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        ProductRepository productRepository,
                        LoyaltyService loyaltyService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.loyaltyService = loyaltyService;
    }

    @Transactional
    public Order create(CreateOrderRequest request, Long userId) {
        User user = userId == null
                ? null
                : userRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với id: " + userId));

        OrderPricing pricing = calculatePricing(request.getItems());
        int pointsToRedeem = request.getPointsToRedeem() == null ? 0 : request.getPointsToRedeem();

        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .customerName(request.getCustomerName().trim())
                .customerEmail(request.getCustomerEmail().trim())
                .productSummary(pricing.getProductSummary())
                .totalAmount(pricing.getPrePointsTotal())
                .paymentMethod(request.getPaymentMethod().trim().toUpperCase(Locale.ROOT))
                .status(STATUS_PENDING)
                .user(user)
                .pointsRedeemed(0)
                .pointsDiscount(BigDecimal.ZERO)
                .build();

        applyCancelToken(order);

        order = orderRepository.save(order);

        if (pointsToRedeem > 0) {
            BigDecimal pointsDiscount = loyaltyService.redeemPoints(user, order, pointsToRedeem, pricing.getSubtotal());
            order.setPointsRedeemed(pointsToRedeem);
            order.setPointsDiscount(pointsDiscount);
            order.setTotalAmount(pricing.getPrePointsTotal().subtract(pointsDiscount).max(BigDecimal.ZERO));
            order = orderRepository.save(order);
        }

        return order;
    }

    @Transactional
    public Order cancelPending(String orderCode, String cancelToken, Long authenticatedUserId) {
        if (orderCode == null || orderCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập mã đơn hàng.");
        }

        Order order = orderRepository
                .findByOrderCodeWithUser(orderCode.trim())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với mã đã cung cấp."));

        if (!STATUS_PENDING.equalsIgnoreCase(order.getStatus().trim())) {
            throw new IllegalArgumentException("Chỉ có thể hủy đơn hàng đang chờ xử lý.");
        }

        if (!isAuthorizedToCancel(order, cancelToken, authenticatedUserId)) {
            throw new IllegalArgumentException("Không có quyền hủy đơn hàng này.");
        }

        order.setStatus(STATUS_CANCELED);
        loyaltyService.refundRedeemedPoints(order);
        return orderRepository.save(order);
    }

    private boolean isAuthorizedToCancel(Order order, String cancelToken, Long authenticatedUserId) {
        if (authenticatedUserId != null
                && order.getUser() != null
                && authenticatedUserId.equals(order.getUser().getId())) {
            return true;
        }

        if (cancelToken == null || cancelToken.isBlank()) {
            return false;
        }

        if (!isOnlinePayment(order.getPaymentMethod())) {
            return false;
        }

        if (order.getCancelToken() == null || !order.getCancelToken().equals(cancelToken.trim())) {
            return false;
        }

        return order.getCancelTokenExpiresAt() != null
                && order.getCancelTokenExpiresAt().isAfter(LocalDateTime.now());
    }

    private void applyCancelToken(Order order) {
        if (isOnlinePayment(order.getPaymentMethod())) {
            order.setCancelToken(UUID.randomUUID().toString());
            order.setCancelTokenExpiresAt(LocalDateTime.now().plusMinutes(CANCEL_TOKEN_MINUTES));
        }
    }

    private boolean isOnlinePayment(String paymentMethod) {
        if (paymentMethod == null) {
            return false;
        }
        String normalized = paymentMethod.trim().toUpperCase(Locale.ROOT);
        return "MOMO".equals(normalized) || "BANK".equals(normalized);
    }

    public List<Order> getAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Order updateStatus(Long id, String status) {
        Order existing = orderRepository.findByIdWithUser(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với id: " + id));
        String oldStatus = normalizeTrackingStatus(existing.getStatus());
        String newStatus = normalizeTrackingStatus(status);
        existing.setStatus(status);

        if (!"DELIVERED".equals(oldStatus) && "DELIVERED".equals(newStatus)) {
            loyaltyService.creditEarnedPoints(existing);
        }
        if ("CANCELED".equals(newStatus)) {
            loyaltyService.refundRedeemedPoints(existing);
            if ("DELIVERED".equals(oldStatus)) {
                loyaltyService.reverseEarnedPoints(existing);
            }
        }

        return orderRepository.save(existing);
    }

    @Transactional
    public Order markPaidByOrderCode(String orderCode) {
        Order existing = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderCode));

        String currentStatus = existing.getStatus();
        if (isSameStatus(currentStatus, STATUS_DELIVERED)
                || isSameStatus(currentStatus, STATUS_SHIPPING)
                || isSameStatus(currentStatus, STATUS_CANCELED)) {
            return existing;
        }

        existing.setStatus(STATUS_SHIPPING);
        return orderRepository.save(existing);
    }

    public Order getByOrderCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + orderCode));
    }

    public OrderTrackingResponse track(String orderCode, String email) {
        if (orderCode == null || orderCode.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập mã đơn hàng và email.");
        }

        Order order = orderRepository
                .findByOrderCodeIgnoreCaseAndCustomerEmailIgnoreCase(orderCode.trim(), email.trim())
                .orElseThrow(() -> new OrderTrackingNotFoundException("Không tìm thấy đơn hàng với thông tin đã cung cấp."));

        String normalized = normalizeTrackingStatus(order.getStatus());

        return new OrderTrackingResponse(
                order.getOrderCode(),
                maskEmail(order.getCustomerEmail()),
                order.getProductSummary(),
                order.getTotalAmount(),
                order.getPaymentMethod(),
                normalized,
                statusLabel(normalized),
                order.getCreatedAt(),
                currentMessage(normalized),
                buildTrackingSteps(normalized, order.getCreatedAt())
        );
    }

    private OrderPricing calculatePricing(List<CreateOrderItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Đơn hàng phải có ít nhất một sản phẩm.");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        StringBuilder summary = new StringBuilder();

        for (CreateOrderItemRequest item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm với id: " + item.getProductId()));

            if (product.getStockQuantity() != null && product.getStockQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Sản phẩm '" + product.getName() + "' không đủ số lượng.");
            }

            BigDecimal unitPrice = product.getPrice();
            if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Giá sản phẩm không hợp lệ: " + product.getName());
            }

            BigDecimal lineTotal = unitPrice
                    .multiply(BigDecimal.valueOf(item.getQuantity()))
                    .setScale(0, RoundingMode.HALF_UP);
            subtotal = subtotal.add(lineTotal);

            if (!summary.isEmpty()) {
                summary.append(", ");
            }
            summary.append(product.getName()).append(" x").append(item.getQuantity());
        }

        subtotal = subtotal.setScale(0, RoundingMode.HALF_UP);
        BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 || subtotal.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : SHIPPING_FEE;
        BigDecimal prePointsTotal = subtotal.add(shipping);

        return new OrderPricing(subtotal, shipping, prePointsTotal, summary.toString());
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "";
        }
        String[] parts = email.split("@", 2);
        String local = parts[0];
        if (local.length() <= 2) {
            return local.charAt(0) + "***@" + parts[1];
        }
        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + parts[1];
    }

    private String normalizeTrackingStatus(String rawStatus) {
        String text = rawStatus == null ? "" : rawStatus.trim().toLowerCase(Locale.ROOT);

        if (text.equals("delivered") || text.contains("da giao") || text.contains("đã giao")) {
            return "DELIVERED";
        }
        if (text.equals("shipped") || text.equals("shipping") || text.contains("dang giao") || text.contains("đang giao")) {
            return "SHIPPING";
        }
        if (text.equals("cancelled") || text.equals("canceled") || text.contains("da huy") || text.contains("đã hủy")) {
            return "CANCELED";
        }
        if (text.equals("paid") || text.contains("da thanh toan") || text.contains("đã thanh toán")) {
            return "PAID";
        }

        return "PENDING";
    }

    private String statusLabel(String status) {
        return switch (status) {
            case "PAID" -> "Đã thanh toán";
            case "SHIPPING" -> "Đang giao";
            case "DELIVERED" -> "Đã giao";
            case "CANCELED" -> "Đã hủy";
            default -> "Chờ xử lý";
        };
    }

    private String currentMessage(String status) {
        return switch (status) {
            case "PAID" -> "Đơn hàng đã thanh toán và đang chờ bàn giao.";
            case "SHIPPING" -> "Đơn hàng đang được giao đến bạn.";
            case "DELIVERED" -> "Đơn hàng đã được giao thành công.";
            case "CANCELED" -> "Đơn hàng đã bị hủy.";
            default -> "Snapcart đã ghi nhận đơn hàng và đang xử lý.";
        };
    }

    private List<OrderTrackingStepResponse> buildTrackingSteps(String status, LocalDateTime createdAt) {
        if ("CANCELED".equals(status)) {
            return List.of(
                    new OrderTrackingStepResponse("PLACED", "Đã đặt hàng", "Snapcart đã ghi nhận đơn hàng.", "DONE", createdAt),
                    new OrderTrackingStepResponse("CANCELED", "Đã hủy", "Đơn hàng đã bị hủy.", "CURRENT", null)
            );
        }

        boolean paidOrBeyond = "PAID".equals(status) || "SHIPPING".equals(status) || "DELIVERED".equals(status);
        boolean shippingOrBeyond = "SHIPPING".equals(status) || "DELIVERED".equals(status);
        boolean delivered = "DELIVERED".equals(status);

        return List.of(
                new OrderTrackingStepResponse("PLACED", "Đã đặt hàng", "Snapcart đã ghi nhận đơn hàng.", "DONE", createdAt),
                new OrderTrackingStepResponse("CONFIRMED", "Đang xử lý", "Đơn hàng đang chờ xác nhận hoặc thanh toán.", paidOrBeyond ? "DONE" : "CURRENT", null),
                new OrderTrackingStepResponse("SHIPPING", "Đang giao", "Đơn hàng đang trên đường giao đến bạn.", delivered ? "DONE" : shippingOrBeyond ? "CURRENT" : "UPCOMING", null),
                new OrderTrackingStepResponse("DELIVERED", "Đã giao", "Đơn hàng đã được giao thành công.", delivered ? "CURRENT" : "UPCOMING", null)
        );
    }

    private String generateOrderCode() {
        String timePart = LocalDateTime.now().format(CODE_TIME);
        int randomPart = ThreadLocalRandom.current().nextInt(100, 1000);
        return "SPC" + timePart + randomPart;
    }

    private boolean isSameStatus(String left, String right) {
        if (left == null || right == null) {
            return false;
        }
        return left.trim().equalsIgnoreCase(right.trim());
    }
}
