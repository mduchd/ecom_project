package com.ecommerce.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class OrderConfirmationRequest {
    private String email;
    private String fullName;
    private String orderId;
    private double totalAmount;
    private List<Map<String, Object>> items;
}
