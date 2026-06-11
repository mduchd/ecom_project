package com.ecommerce.backend.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AIChatResponse {
    private String reply;
    private List<AIProductSuggestionDto> products;
}
