package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AdminProductStatsResponse {
    private long totalProducts;
    private long inStockCount;
    private long outOfStockCount;
    private long categoryCount;
    private List<String> categories;
}
