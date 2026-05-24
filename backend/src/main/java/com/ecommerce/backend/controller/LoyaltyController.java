package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.CheckoutLoyaltySettingsResponse;
import com.ecommerce.backend.entity.LoyaltySetting;
import com.ecommerce.backend.service.LoyaltyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/loyalty")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    public LoyaltyController(LoyaltyService loyaltyService) {
        this.loyaltyService = loyaltyService;
    }

    @GetMapping("/checkout-settings")
    public ResponseEntity<CheckoutLoyaltySettingsResponse> getCheckoutSettings() {
        LoyaltySetting setting = loyaltyService.getSetting();
        return ResponseEntity.ok(new CheckoutLoyaltySettingsResponse(
                setting.getPointValue(),
                setting.getMaxRedeemPercent(),
                setting.isEnabled()
        ));
    }
}
