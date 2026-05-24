package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.PointTransactionType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class PointTransactionResponse {
    private Long id;
    private Long userId;
    private String customerEmail;
    private String orderCode;
    private PointTransactionType type;
    private Integer points;
    private String reason;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
