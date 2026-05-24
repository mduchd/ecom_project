package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AdminLoyaltySummaryResponse;
import com.ecommerce.backend.dto.AdminPointAdjustmentRequest;
import com.ecommerce.backend.dto.LoyaltySettingRequest;
import com.ecommerce.backend.dto.LoyaltySettingResponse;
import com.ecommerce.backend.dto.PointTransactionResponse;
import com.ecommerce.backend.entity.LoyaltySetting;
import com.ecommerce.backend.entity.PointTransaction;
import com.ecommerce.backend.entity.PointTransactionType;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.LoyaltyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/loyalty")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminLoyaltyController {
    private final LoyaltyService loyaltyService;
    private final UserRepository userRepository;

    public AdminLoyaltyController(LoyaltyService loyaltyService, UserRepository userRepository) {
        this.loyaltyService = loyaltyService;
        this.userRepository = userRepository;
    }

    @GetMapping("/settings")
    public ResponseEntity<LoyaltySettingResponse> getSettings() {
        return ResponseEntity.ok(toSettingResponse(loyaltyService.getSetting()));
    }

    @PutMapping("/settings")
    public ResponseEntity<LoyaltySettingResponse> updateSettings(@Valid @RequestBody LoyaltySettingRequest request) {
        LoyaltySetting setting = LoyaltySetting.builder()
                .id(1L)
                .earnAmountPerPoint(request.getEarnAmountPerPoint())
                .pointValue(request.getPointValue())
                .maxRedeemPercent(request.getMaxRedeemPercent())
                .expiryMonths(request.getExpiryMonths())
                .enabled(request.isEnabled())
                .build();
        return ResponseEntity.ok(toSettingResponse(loyaltyService.saveSetting(setting)));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<PointTransactionResponse>> getTransactions() {
        return ResponseEntity.ok(loyaltyService.getTransactions().stream()
                .map(this::toTransactionResponse)
                .toList());
    }

    @PostMapping("/adjustments")
    public ResponseEntity<PointTransactionResponse> adjustPoints(@Valid @RequestBody AdminPointAdjustmentRequest request) {
        PointTransaction transaction = loyaltyService.adjustPoints(
                request.getUserId(),
                request.getIncrease(),
                request.getPoints(),
                request.getReason()
        );
        return ResponseEntity.ok(toTransactionResponse(transaction));
    }

    @PatchMapping("/customers/{userId}/lock")
    public ResponseEntity<Void> lockPoints(@PathVariable Long userId, @RequestBody java.util.Map<String, Boolean> body) {
        loyaltyService.setPointsLocked(userId, Boolean.TRUE.equals(body.get("locked")));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<AdminLoyaltySummaryResponse> getSummary() {
        Long activePoints = userRepository.sumActivePoints();
        long customersWithPoints = userRepository.countUsersWithPoints();
        Long earned = loyaltyService.sumPointsByType(PointTransactionType.EARN);
        Long redeemed = loyaltyService.sumAbsolutePointsByType(PointTransactionType.REDEEM);
        return ResponseEntity.ok(new AdminLoyaltySummaryResponse(customersWithPoints, activePoints, earned, redeemed));
    }

    private LoyaltySettingResponse toSettingResponse(LoyaltySetting setting) {
        return new LoyaltySettingResponse(
                setting.getEarnAmountPerPoint(),
                setting.getPointValue(),
                setting.getMaxRedeemPercent(),
                setting.getExpiryMonths(),
                setting.isEnabled()
        );
    }

    private PointTransactionResponse toTransactionResponse(PointTransaction transaction) {
        return new PointTransactionResponse(
                transaction.getId(),
                transaction.getUser().getId(),
                transaction.getUser().getEmail(),
                transaction.getOrder() == null ? null : transaction.getOrder().getOrderCode(),
                transaction.getType(),
                transaction.getPoints(),
                transaction.getReason(),
                transaction.getCreatedAt(),
                transaction.getExpiresAt()
        );
    }
}
