package com.ecommerce.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileRequest {
    private String fullName;
    private String avatar;
    private String phoneNumber;
    private String address;
    private String city;
    private String postalCode;
}
