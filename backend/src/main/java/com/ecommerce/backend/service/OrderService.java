package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.AdminOrderStatsResponse;
import com.ecommerce.backend.dto.CreateOrderItemRequest;
import com.ecommerce.backend.dto.CreateOrderRequest;
import com.ecommerce.backend.dto.OrderPricing;
import com.ecommerce.backend.dto.OrderTrackingResponse;
import com.ecommerce.backend.dto.OrderTrackingStepResponse;
import com.ecommerce.backend.dto.PagedResponse;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.OrderItem;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.exception.OrderTrackingNotFoundException;
import com.ecommerce.backend.repository.OrderItemRepository;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.util.PageFetch;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private static final String STATUS_PENDING = "Chờ duyệt";
    private static final String STATUS_SHIPPING = "Đang giao";
    private static final String STATUS_DELIVERED = "Đã giao";
    private static final String STATUS_CANCELED = "Đã hủy";
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("399000");
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("30000");
    private static final int CANCEL_TOKEN_MINUTES = 30;
    private static final DateTimeFormatter CODE_TIME = DateTimeFormatter.ofPattern("yyMMddHHmm", Locale.ROOT);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final LoyaltyService loyaltyService;
    private final MemberTierService memberTierService;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        UserRepository userRepository,
                        ProductRepository productRepository,
                        LoyaltyService loyaltyService,
                        MemberTierService memberTierService,
                        EmailService emailService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.loyaltyService = loyaltyService;
        this.memberTierService = memberTierService;
        this.emailService = emailService;
    }

    @Transactional
    public Order create(CreateOrderRequest request, Long userId) {
        User user = userId == null
                ? null
                : userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với id: " + userId));

        Map<Long, Product> productsById = loadProductsById(request.getItems());
        OrderPricing pricing = calculatePricing(request.getItems(), productsById);
        int pointsToRedeem = request.getPointsToRedeem() == null ? 0 : request.getPointsToRedeem();

        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .customerName(request.getCustomerName().trim())
                .customerEmail(request.getCustomerEmail().trim())
                .customerPhone(normalizeOptionalText(request.getCustomerPhone()))
                .shippingAddress(normalizeOptionalText(request.getShippingAddress()))
                .productSummary(pricing.getProductSummary())
                .totalAmount(pricing.getPrePointsTotal())
                .membershipSpendAmount(pricing.getSubtotal())
                .paymentMethod(request.getPaymentMethod().trim().toUpperCase(Locale.ROOT))
                .status(STATUS_PENDING)
                .user(user)
                .pointsRedeemed(0)
                .pointsDiscount(BigDecimal.ZERO)
                .build();

        applyCancelToken(order);

        order = orderRepository.save(order);
        saveOrderItems(order, request.getItems(), productsById);

        if (pointsToRedeem > 0) {
            BigDecimal pointsDiscount = loyaltyService.redeemPoints(user, order, pointsToRedeem, pricing.getSubtotal());
            order.setPointsRedeemed(pointsToRedeem);
            order.setPointsDiscount(pointsDiscount);
            order.setTotalAmount(pricing.getPrePointsTotal().subtract(pointsDiscount).max(BigDecimal.ZERO));
            order = orderRepository.save(order);
        }

        if (!isOnlinePayment(order.getPaymentMethod())) {
            sendOrderConfirmationEmailIfNeeded(order);
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
        existing.setStatus(toStoredStatus(status));

        if (!"DELIVERED".equals(oldStatus) && "DELIVERED".equals(newStatus)) {
            loyaltyService.creditEarnedPoints(existing);
            memberTierService.creditDeliveredSpend(existing);
        }
        if ("CANCELED".equals(newStatus)) {
            loyaltyService.refundRedeemedPoints(existing);
            if ("DELIVERED".equals(oldStatus)) {
                memberTierService.reverseDeliveredSpend(existing);
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
        if (isSameStatus(currentStatus, STATUS_CANCELED)) {
            return existing;
        }
        if (isSameStatus(currentStatus, STATUS_DELIVERED)
                || isSameStatus(currentStatus, STATUS_SHIPPING)) {
            sendOrderConfirmationEmailIfNeeded(existing);
            return existing;
        }

        existing.setStatus(STATUS_SHIPPING);
        existing = orderRepository.save(existing);
        sendOrderConfirmationEmailIfNeeded(existing);
        return existing;
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
                order.getCustomerPhone(),
                order.getShippingAddress(),
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

    private Map<Long, Product> loadProductsById(List<CreateOrderItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Đơn hàng phải có ít nhất một sản phẩm.");
        }

        Set<Long> productIds = new LinkedHashSet<>();
        for (CreateOrderItemRequest item : items) {
            productIds.add(item.getProductId());
        }

        Map<Long, Product> productsById = new HashMap<>();
        productRepository.findAllById(productIds)
                .forEach(product -> productsById.put(product.getId(), product));
        return productsById;
    }

    private OrderPricing calculatePricing(List<CreateOrderItemRequest> items, Map<Long, Product> productsById) {
        BigDecimal subtotal = BigDecimal.ZERO;
        StringBuilder summary = new StringBuilder();

        for (CreateOrderItemRequest item : items) {
            Product product = productsById.get(item.getProductId());
            if (product == null) {
                throw new IllegalArgumentException("Không tìm thấy sản phẩm với id: " + item.getProductId());
            }
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

    private void saveOrderItems(Order order, List<CreateOrderItemRequest> items, Map<Long, Product> productsById) {
        List<OrderItem> orderItems = new ArrayList<>();
        for (CreateOrderItemRequest item : items) {
            Product product = productsById.get(item.getProductId());
            if (product == null) {
                continue;
            }
            BigDecimal lineTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()))
                    .setScale(0, RoundingMode.HALF_UP);
            orderItems.add(OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .unitPrice(product.getPrice())
                    .quantity(item.getQuantity())
                    .lineTotal(lineTotal)
                    .build());
        }
        if (!orderItems.isEmpty()) {
            orderItemRepository.saveAll(orderItems);
        }
    }

    @Transactional
    public void sendOrderConfirmationEmailIfNeeded(Order order) {
        if (order == null || order.getId() == null || order.isConfirmationEmailSent()) {
            return;
        }

        List<OrderItem> orderItems = orderItemRepository.findByOrderIdOrderByIdAsc(order.getId());
        List<Map<String, Object>> emailItems = new ArrayList<>();
        for (OrderItem item : orderItems) {
            Map<String, Object> row = new HashMap<>();
            row.put("name", item.getProductName());
            row.put("quantity", item.getQuantity());
            row.put("price", item.getUnitPrice());
            emailItems.add(row);
        }

        if (emailItems.isEmpty() && order.getProductSummary() != null) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("name", order.getProductSummary());
            fallback.put("quantity", 1);
            fallback.put("price", order.getTotalAmount());
            emailItems.add(fallback);
        }

        try {
            emailService.sendOrderConfirmationEmail(
                    order.getCustomerEmail(),
                    order.getCustomerName(),
                    order.getOrderCode(),
                    order.getTotalAmount().doubleValue(),
                    emailItems
            );
            order.setConfirmationEmailSent(true);
            orderRepository.save(order);
        } catch (RuntimeException ex) {
            logger.warn("Failed to send confirmation email for order {}", order.getOrderCode(), ex);
        }
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

    private String toStoredStatus(String status) {
        return switch (normalizeTrackingStatus(status)) {
            case "PAID" -> "Đã thanh toán";
            case "SHIPPING" -> STATUS_SHIPPING;
            case "DELIVERED" -> STATUS_DELIVERED;
            case "CANCELED" -> STATUS_CANCELED;
            default -> STATUS_PENDING;
        };
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

    @Transactional(readOnly = true)
    public PagedResponse<Order> getAdminPage(int page, int size, String search, String status) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(1, Math.min(size, 100));
        String statusGroup = resolveStatusGroup(status);
        String normalizedSearch = search == null ? "" : search.trim();
        Pageable pageable = PageRequest.of(safePage - 1, safeSize);
        String searchParam = normalizedSearch.isEmpty() ? null : normalizedSearch;
        Page<Order> result = orderRepository.findAdminOrders(statusGroup, searchParam, pageable);
        result = PageFetch.clampRequestedPage(
                result,
                safePage,
                nextPageable -> orderRepository.findAdminOrders(statusGroup, searchParam, nextPageable)
        );
        return PagedResponse.from(result, safePage);
    }

    @Transactional(readOnly = true)
    public AdminOrderStatsResponse getAdminStats() {
        int year = LocalDateTime.now().getYear();
        int currentMonth = LocalDateTime.now().getMonthValue();
        int previousMonth = currentMonth == 1 ? 12 : currentMonth - 1;
        int previousMonthYear = currentMonth == 1 ? year - 1 : year;

        List<BigDecimal> monthlyRevenue = new ArrayList<>(List.of(
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO
        ));
        for (Object[] row : orderRepository.sumDeliveredRevenueByMonth(year)) {
            int month = ((Number) row[0]).intValue();
            BigDecimal amount = (BigDecimal) row[1];
            if (month >= 1 && month <= 12) {
                monthlyRevenue.set(month - 1, amount);
            }
        }

        BigDecimal currentMonthRevenue = monthlyRevenue.get(currentMonth - 1);
        BigDecimal previousMonthRevenue = previousMonthYear == year
                ? monthlyRevenue.get(previousMonth - 1)
                : orderRepository.sumDeliveredRevenueForMonth(previousMonthYear, previousMonth);

        return new AdminOrderStatsResponse(
                orderRepository.count(),
                orderRepository.countAwaitingActionOrders(),
                orderRepository.sumDeliveredRevenue(),
                monthlyRevenue,
                orderRepository.countOrdersByMonth(year, currentMonth),
                orderRepository.countOrdersByMonth(previousMonthYear, previousMonth),
                currentMonthRevenue,
                previousMonthRevenue
        );
    }

    private String resolveStatusGroup(String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status.trim())) {
            return null;
        }
        return normalizeTrackingStatus(status);
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
