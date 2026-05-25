package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AdminUserResponse;
import com.ecommerce.backend.dto.AdminUserStatsResponse;
import com.ecommerce.backend.dto.MemberTierSyncResponse;
import com.ecommerce.backend.dto.PagedResponse;
import com.ecommerce.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminUserController {
    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<AdminUserResponse>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String tier) {
        return ResponseEntity.ok(userService.getAdminPage(page, size, search, role, tier));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminUserStatsResponse> getStats() {
        return ResponseEntity.ok(userService.getAdminStats());
    }

    @PatchMapping("/{userId}/enabled")
    public ResponseEntity<AdminUserResponse> setEnabled(@PathVariable Long userId,
                                                        @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(userService.setEnabled(userId, Boolean.TRUE.equals(body.get("enabled"))));
    }

    @PostMapping("/sync-delivered-spend")
    public ResponseEntity<MemberTierSyncResponse> syncAllDeliveredSpend() {
        return ResponseEntity.ok(userService.syncAllDeliveredSpend());
    }

    @PostMapping("/{userId}/sync-delivered-spend")
    public ResponseEntity<AdminUserResponse> syncDeliveredSpend(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.syncDeliveredSpend(userId));
    }
}
