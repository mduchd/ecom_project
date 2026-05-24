package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class CheckoutLoyaltySettingsResponse {
    private BigDecimal pointValue;
    private Integer maxRedeemPercent;
    private boolean enabled;
}
