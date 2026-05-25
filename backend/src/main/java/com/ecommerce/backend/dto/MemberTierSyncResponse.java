package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberTierSyncResponse {
    private int usersUpdated;
    private int ordersUpdated;
}
