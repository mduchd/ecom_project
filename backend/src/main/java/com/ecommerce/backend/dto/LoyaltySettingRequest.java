package com.ecommerce.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class LoyaltySettingRequest {
    @NotNull(message = "Số tiền để nhận 1 điểm không được để trống")
    @DecimalMin(value = "1.00", message = "Số tiền để nhận 1 điểm phải lớn hơn 0")
    private BigDecimal earnAmountPerPoint;

    @NotNull(message = "Giá trị 1 điểm không được để trống")
    @DecimalMin(value = "1.00", message = "Giá trị 1 điểm phải lớn hơn 0")
    private BigDecimal pointValue;

    @NotNull(message = "Giới hạn giảm tối đa không được để trống")
    @Min(value = 1, message = "Giới hạn giảm tối đa phải từ 1%")
    @Max(value = 100, message = "Giới hạn giảm tối đa không được vượt quá 100%")
    private Integer maxRedeemPercent;

    @NotNull(message = "Thời hạn điểm không được để trống")
    @Min(value = 1, message = "Thời hạn điểm phải ít nhất 1 tháng")
    private Integer expiryMonths;

    private boolean enabled;
}
