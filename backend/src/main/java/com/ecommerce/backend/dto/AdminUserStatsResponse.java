package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminUserStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long adminUsers;
    private long lockedPointsUsers;
}
