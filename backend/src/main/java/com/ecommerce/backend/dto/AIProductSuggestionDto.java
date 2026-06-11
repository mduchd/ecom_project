package com.ecommerce.backend.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AIProductSuggestionDto {
    private Long id;
    private String name;
    private String imageUrl;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer stockQuantity;
    private String brand;
    private String category;
}
