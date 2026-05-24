package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.*;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;

@Service
public class OrderService {
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("399");
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("29");
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public OrderResponse quote(OrderQuoteRequest request) {
        return calculateQuote(request);
    }

    @Transactional
    public OrderResponse createOrder(Long userId, OrderCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với id: " + userId));
        OrderResponse quote = calculateQuote(toQuoteRequest(request));

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setReceiverName(request.getReceiverName());
        order.setPhoneNumber(request.getPhoneNumber());
        order.setShippingAddress(request.getShippingAddress());
        order.setCity(request.getCity());
        order.setPostalCode(request.getPostalCode());
        order.setCouponCode(quote.getCouponCode());
        order.setSubtotal(quote.getSubtotal());
        order.setShippingFee(quote.getShippingFee());
        order.setDiscount(quote.getDiscount());
        order.setTaxAmount(quote.getTaxAmount());
        order.setTotal(quote.getTotal());

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm với id: " + itemRequest.getProductId()));
            if (product.getStockQuantity() == null || product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException("Không đủ hàng cho sản phẩm: " + product.getName());
            }
            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepository.save(product);

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .unitPrice(product.getPrice())
                    .quantity(itemRequest.getQuantity())
                    .lineTotal(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())))
                    .build();
            order.addItem(item);
        }

        return toResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với id: " + userId));
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với id: " + orderId));
        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    private OrderResponse calculateQuote(OrderQuoteRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Đơn hàng phải có ít nhất một sản phẩm");
        }

        List<OrderItemResponse> items = request.getItems().stream()
                .map(this::toQuoteItem)
                .toList();
        BigDecimal subtotal = items.stream()
                .map(OrderItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal shippingFee = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : SHIPPING_FEE;
        String couponCode = normalizeCoupon(request.getCouponCode());
        BigDecimal discount = calculateDiscount(subtotal, couponCode);
        BigDecimal taxAmount = BigDecimal.ZERO;
        BigDecimal total = subtotal.add(shippingFee).subtract(discount);

        return new OrderResponse(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                items,
                subtotal,
                shippingFee,
                discount,
                taxAmount,
                total.max(BigDecimal.ZERO),
                couponCode,
                null);
    }

    private OrderQuoteRequest toQuoteRequest(OrderCreateRequest request) {
        OrderQuoteRequest quoteRequest = new OrderQuoteRequest();
        quoteRequest.setItems(request.getItems());
        quoteRequest.setCouponCode(request.getCouponCode());
        return quoteRequest;
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProduct().getId(),
                        item.getProductName(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getLineTotal()))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getReceiverName(),
                order.getPhoneNumber(),
                order.getShippingAddress(),
                order.getCity(),
                order.getPostalCode(),
                items,
                order.getSubtotal(),
                order.getShippingFee(),
                order.getDiscount(),
                order.getTaxAmount(),
                order.getTotal(),
                order.getCouponCode(),
                order.getCreatedAt());
    }

    private OrderItemResponse toQuoteItem(OrderItemRequest itemRequest) {
        validateQuantity(itemRequest);
        Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm với id: " + itemRequest.getProductId()));
        BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

        return new OrderItemResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                itemRequest.getQuantity(),
                lineTotal);
    }

    private void validateQuantity(OrderItemRequest itemRequest) {
        if (itemRequest.getQuantity() == null || itemRequest.getQuantity() < 1) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }
    }

    private String normalizeCoupon(String couponCode) {
        if (couponCode == null || couponCode.trim().isEmpty()) {
            return null;
        }
        String normalized = couponCode.trim().toUpperCase(Locale.ROOT);
        if (!normalized.equals("SAVE10") && !normalized.equals("TECH20") && !normalized.equals("FLAT50")) {
            throw new IllegalArgumentException("Mã giảm giá không hợp lệ: " + normalized);
        }
        return normalized;
    }

    private BigDecimal calculateDiscount(BigDecimal subtotal, String couponCode) {
        if (couponCode == null || couponCode.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal discount = switch (couponCode) {
            case "SAVE10" -> subtotal.multiply(new BigDecimal("0.10"));
            case "TECH20" -> subtotal.multiply(new BigDecimal("0.20"));
            case "FLAT50" -> new BigDecimal("50");
            default -> throw new IllegalArgumentException("Mã giảm giá không hợp lệ: " + couponCode);
        };
        return discount.min(subtotal).setScale(0, RoundingMode.HALF_UP);
    }
}
