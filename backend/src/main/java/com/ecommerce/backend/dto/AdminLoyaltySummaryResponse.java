package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminLoyaltySummaryResponse {
    private long customersWithPoints;
    private Integer activePoints;
    private Integer earnedPoints;
    private Integer redeemedPoints;
}
