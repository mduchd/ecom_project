package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String avatar;
    private String phoneNumber;
    private String address;
    private String city;
    private String postalCode;
    private List<String> roles;
    private Integer pointsBalance;
    private boolean pointsLocked;
}
