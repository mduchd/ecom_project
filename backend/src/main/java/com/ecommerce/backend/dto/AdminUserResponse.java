package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private List<String> roles;
    private Integer pointsBalance;
    private boolean pointsLocked;
    private boolean enabled;
    private String provider;
    private String memberTier;
    private String memberTierLabel;
    private java.math.BigDecimal deliveredSpend;
}
