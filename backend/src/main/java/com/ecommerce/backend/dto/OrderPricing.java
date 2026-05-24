package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class OrderPricing {
    private final BigDecimal subtotal;
    private final BigDecimal shipping;
    private final BigDecimal prePointsTotal;
    private final String productSummary;
}
