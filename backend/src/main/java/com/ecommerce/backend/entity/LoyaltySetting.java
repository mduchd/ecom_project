package com.ecommerce.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "loyalty_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltySetting {
    @Id
    private Long id;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal earnAmountPerPoint;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal pointValue;

    @Column(nullable = false)
    private Integer maxRedeemPercent;

    @Column(nullable = false)
    private Integer expiryMonths;

    @Column(nullable = false)
    private boolean enabled;

    public static LoyaltySetting defaultSetting() {
        return LoyaltySetting.builder()
                .id(1L)
                .earnAmountPerPoint(new BigDecimal("10000.00"))
                .pointValue(new BigDecimal("1000.00"))
                .maxRedeemPercent(30)
                .expiryMonths(12)
                .enabled(true)
                .build();
    }
}
