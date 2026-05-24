package com.ecommerce.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateOrderRequest {
    @NotBlank
    private String customerName;

    @NotBlank
    @Email
    private String customerEmail;

    @Valid
    @NotEmpty(message = "Đơn hàng phải có ít nhất một sản phẩm")
    private List<CreateOrderItemRequest> items;

    @NotBlank
    private String paymentMethod;

    private Integer pointsToRedeem = 0;
}
