package com.ecommerce.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderQuoteRequest {
    @Valid
    @NotEmpty
    private List<OrderItemRequest> items;

    private String couponCode;
}
