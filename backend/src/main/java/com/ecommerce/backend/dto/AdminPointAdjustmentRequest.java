package com.ecommerce.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminPointAdjustmentRequest {
    @NotNull
    private Long userId;

    @NotNull
    private Boolean increase;

    @NotNull
    @Min(1)
    private Integer points;

    @NotBlank
    private String reason;
}
