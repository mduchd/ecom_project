package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String orderCode;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerEmail;

    @Column(length = 32)
    private String customerPhone;

    @Column(length = 512)
    private String shippingAddress;

    @Column(nullable = false)
    private String productSummary;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 12, scale = 2, columnDefinition = "DECIMAL(12,2) DEFAULT 0")
    @Builder.Default
    private BigDecimal membershipSpendAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 64)
    private String paymentMethod;

    @Column(nullable = false, length = 32)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private Integer pointsRedeemed = 0;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal pointsDiscount = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private Integer pointsEarned = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean pointsCredited = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean redeemedPointsRefunded = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean earnedPointsReversed = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean membershipSpendCredited = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean membershipSpendReversed = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean confirmationEmailSent = false;

    @Column(length = 64)
    @JsonIgnore
    private String cancelToken;

    @JsonIgnore
    private LocalDateTime cancelTokenExpiresAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public boolean isPointsCredited() {
        return Boolean.TRUE.equals(pointsCredited);
    }

    public boolean isRedeemedPointsRefunded() {
        return Boolean.TRUE.equals(redeemedPointsRefunded);
    }

    public boolean isEarnedPointsReversed() {
        return Boolean.TRUE.equals(earnedPointsReversed);
    }

    public boolean isMembershipSpendCredited() {
        return Boolean.TRUE.equals(membershipSpendCredited);
    }

    public boolean isMembershipSpendReversed() {
        return Boolean.TRUE.equals(membershipSpendReversed);
    }

    public boolean isConfirmationEmailSent() {
        return Boolean.TRUE.equals(confirmationEmailSent);
    }
}
