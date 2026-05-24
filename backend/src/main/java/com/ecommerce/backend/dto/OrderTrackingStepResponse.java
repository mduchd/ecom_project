package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class OrderTrackingStepResponse {
    private String key;
    private String label;
    private String description;
    private String state;
    private LocalDateTime timestamp;
}
