package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderStatusUpdateRequest {
    @NotNull
    private OrderStatus status;
}
