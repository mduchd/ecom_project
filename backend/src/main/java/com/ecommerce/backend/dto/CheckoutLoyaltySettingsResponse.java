package com.ecommerce.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class CheckoutLoyaltySettingsResponse {
    private BigDecimal pointValue;
    private Integer maxRedeemPercent;

    @JsonProperty("enabled")
    private boolean enabled;
}
