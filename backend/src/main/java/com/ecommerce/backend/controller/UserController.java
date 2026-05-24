package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ChangePasswordRequest;
import com.ecommerce.backend.dto.OrderResponse;
import com.ecommerce.backend.dto.PointTransactionResponse;
import com.ecommerce.backend.dto.UserProfileRequest;
import com.ecommerce.backend.dto.UserProfileResponse;
import com.ecommerce.backend.security.services.UserDetailsImpl;
import com.ecommerce.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMe(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMe(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                        @RequestBody UserProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getId(), request));
    }

    @GetMapping("/me/orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getMyOrders(userDetails.getId()));
    }

    @GetMapping("/me/points/transactions")
    public ResponseEntity<List<PointTransactionResponse>> getMyPointTransactions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getMyPointTransactions(userDetails.getId()));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                               @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userDetails.getId(), request);
        return ResponseEntity.noContent().build();
    }
}
