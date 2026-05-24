package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class AdminOrderStatsResponse {
    private long totalOrders;
    private long awaitingActionCount;
    private BigDecimal deliveredRevenue;
    private List<BigDecimal> monthlyRevenue;
    private long currentMonthOrders;
    private long previousMonthOrders;
    private BigDecimal currentMonthRevenue;
    private BigDecimal previousMonthRevenue;
}
