package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.CreateOrderRequest;
import com.ecommerce.backend.dto.OrderTrackingResponse;
import com.ecommerce.backend.dto.OrderTrackingStepResponse;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.exception.OrderTrackingNotFoundException;
import com.ecommerce.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OrderService {

    private static final String STATUS_PENDING = "Chờ duyệt";
    private static final String STATUS_SHIPPING = "Đang giao";
    private static final String STATUS_DELIVERED = "Đã giao";
    private static final String STATUS_CANCELED = "Đã hủy";
    private static final DateTimeFormatter CODE_TIME = DateTimeFormatter.ofPattern("yyMMddHHmm", Locale.ROOT);

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order create(CreateOrderRequest request) {
        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .customerName(request.getCustomerName().trim())
                .customerEmail(request.getCustomerEmail().trim())
                .productSummary(request.getProductSummary().trim())
                .totalAmount(request.getTotalAmount())
                .paymentMethod(request.getPaymentMethod().trim().toUpperCase(Locale.ROOT))
                .status(STATUS_PENDING)
                .build();

        return orderRepository.save(order);
    }

    public List<Order> getAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order updateStatus(Long id, String status) {
        Order existing = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với id: " + id));
        existing.setStatus(status);
        return orderRepository.save(existing);
    }

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
