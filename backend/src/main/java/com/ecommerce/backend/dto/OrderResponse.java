package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderCode;
    private String customerName;
    private String customerEmail;
    private String productSummary;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String status;
    private LocalDateTime createdAt;
    private Integer pointsRedeemed;
    private BigDecimal pointsDiscount;
    private String cancelToken;

    public static OrderResponse from(Order order) {
        return from(order, false);
    }

    public static OrderResponse from(Order order, boolean includeCancelToken) {
        return new OrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getProductSummary(),
                order.getTotalAmount(),
                order.getPaymentMethod(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getPointsRedeemed(),
                order.getPointsDiscount(),
                includeCancelToken ? order.getCancelToken() : null
        );
    }
}
