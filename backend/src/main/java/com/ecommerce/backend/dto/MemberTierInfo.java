package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.MemberTier;
import com.ecommerce.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class MemberTierInfo {
    private String tier;
    private String tierLabel;
    private BigDecimal deliveredSpend;
    private BigDecimal nextTierThreshold;
    private String nextTierLabel;
    private double pointsMultiplier;

    public static MemberTierInfo from(User user) {
        BigDecimal spend = user.getDeliveredSpend() == null ? BigDecimal.ZERO : user.getDeliveredSpend();
        MemberTier tier = MemberTier.fromSpend(spend);
        MemberTier nextTier = tier.nextTier();
        return new MemberTierInfo(
                tier.name(),
                tier.getLabel(),
                spend,
                tier.getNextTierThreshold(),
                nextTier == null ? null : nextTier.getLabel(),
                tier.getPointsMultiplier()
        );
    }
}
