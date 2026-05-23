package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.OrderStatus;
import com.ecommerce.backend.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String receiverName;
    private String phoneNumber;
    private String shippingAddress;
    private String city;
    private String postalCode;
    private List<OrderItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal discount;
    private BigDecimal taxAmount;
    private BigDecimal total;
    private String couponCode;
    private LocalDateTime createdAt;
}
