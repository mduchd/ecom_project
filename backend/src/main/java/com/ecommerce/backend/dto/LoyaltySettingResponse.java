package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class LoyaltySettingResponse {
    private BigDecimal earnAmountPerPoint;
    private BigDecimal pointValue;
    private Integer maxRedeemPercent;
    private Integer expiryMonths;
    private boolean enabled;
}
