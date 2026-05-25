package com.ecommerce.backend.entity;

import java.math.BigDecimal;

public enum MemberTier {
    BRONZE("Đồng", BigDecimal.ZERO, new BigDecimal("5000000"), 1.0),
    SILVER("Bạc", new BigDecimal("5000000"), new BigDecimal("15000000"), 1.1),
    GOLD("Vàng", new BigDecimal("15000000"), new BigDecimal("30000000"), 1.25),
    DIAMOND("Kim cương", new BigDecimal("30000000"), null, 1.5);

    private final String label;
    private final BigDecimal minSpend;
    private final BigDecimal maxSpend;
    private final double pointsMultiplier;

    MemberTier(String label, BigDecimal minSpend, BigDecimal maxSpend, double pointsMultiplier) {
        this.label = label;
        this.minSpend = minSpend;
        this.maxSpend = maxSpend;
        this.pointsMultiplier = pointsMultiplier;
    }

    public String getLabel() {
        return label;
    }

    public BigDecimal getMinSpend() {
        return minSpend;
    }

    public BigDecimal getMaxSpend() {
        return maxSpend;
    }

    public double getPointsMultiplier() {
        return pointsMultiplier;
    }

    public static MemberTier fromSpend(BigDecimal spend) {
        BigDecimal value = spend == null ? BigDecimal.ZERO : spend;
        if (value.compareTo(DIAMOND.minSpend) >= 0) {
            return DIAMOND;
        }
        if (value.compareTo(GOLD.minSpend) >= 0) {
            return GOLD;
        }
        if (value.compareTo(SILVER.minSpend) >= 0) {
            return SILVER;
        }
        return BRONZE;
    }

    public BigDecimal getNextTierThreshold() {
        return switch (this) {
            case BRONZE -> SILVER.minSpend;
            case SILVER -> GOLD.minSpend;
            case GOLD -> DIAMOND.minSpend;
            case DIAMOND -> null;
        };
    }

    public MemberTier nextTier() {
        return switch (this) {
            case BRONZE -> SILVER;
            case SILVER -> GOLD;
            case GOLD -> DIAMOND;
            case DIAMOND -> null;
        };
    }
}
