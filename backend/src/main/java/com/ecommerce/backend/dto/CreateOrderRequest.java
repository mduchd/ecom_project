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
    @NotBlank(message = "Vui lòng nhập họ và tên")
    private String customerName;

    @NotBlank
    @Email
    private String customerEmail;

    @NotBlank(message = "Vui lòng nhập số điện thoại")
    private String customerPhone;

    @NotBlank(message = "Vui lòng nhập địa chỉ giao hàng")
    private String shippingAddress;

    @Valid
    @NotEmpty(message = "Đơn hàng phải có ít nhất một sản phẩm")
    private List<CreateOrderItemRequest> items;

    @NotBlank
    private String paymentMethod;

    private Integer pointsToRedeem = 0;
}
