package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.CancelOrderRequest;
import com.ecommerce.backend.dto.CreateOrderRequest;
import com.ecommerce.backend.dto.OrderResponse;
import com.ecommerce.backend.dto.OrderTrackingResponse;
import com.ecommerce.backend.dto.UpdateOrderStatusRequest;
import com.ecommerce.backend.security.services.UserDetailsImpl;
import com.ecommerce.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request,
                                                     @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails == null ? null : userDetails.getId();
        return ResponseEntity.ok(OrderResponse.from(orderService.create(request, userId), true));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders() {
        return ResponseEntity.ok(orderService.getAll().stream().map(OrderResponse::from).toList());
    }

    @GetMapping("/code/{orderCode}")
    public ResponseEntity<OrderResponse> getOrderByCode(@PathVariable String orderCode) {
        return ResponseEntity.ok(OrderResponse.from(orderService.getByOrderCode(orderCode)));
    }

    @GetMapping("/track")
    public ResponseEntity<OrderTrackingResponse> trackOrder(@RequestParam String code, @RequestParam String email) {
        return ResponseEntity.ok(orderService.track(code, email));
    }

    @PostMapping("/cancel")
    public ResponseEntity<OrderResponse> cancelPendingOrder(@Valid @RequestBody CancelOrderRequest request,
                                                            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails == null ? null : userDetails.getId();
        return ResponseEntity.ok(OrderResponse.from(
                orderService.cancelPending(request.getCode(), request.getCancelToken(), userId),
                true
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(OrderResponse.from(orderService.updateStatus(id, request.getStatus())));
    }
}
