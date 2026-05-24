package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.CreateOrderRequest;
import com.ecommerce.backend.entity.Order;
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
