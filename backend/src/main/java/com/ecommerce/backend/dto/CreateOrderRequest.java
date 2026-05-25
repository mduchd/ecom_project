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

    @NotBlank(message = "Vui lòng nhập email.")
    @Email(message = "Email không hợp lệ.")
    private String customerEmail;

    private String customerPhone;

    private String shippingAddress;

    @Valid
    @NotEmpty(message = "Đơn hàng phải có ít nhất một sản phẩm")
    private List<CreateOrderItemRequest> items;

    @NotBlank(message = "Vui lòng chọn phương thức thanh toán.")
    private String paymentMethod;

    private Integer pointsToRedeem = 0;
}
