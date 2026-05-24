package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class OrderTrackingResponse {
    private String orderCode;
    private String customerEmail;
    private String productSummary;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String status;
    private String statusLabel;
    private LocalDateTime createdAt;
    private String currentMessage;
    private List<OrderTrackingStepResponse> steps;
}
