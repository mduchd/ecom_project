package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AdminOrderStatsResponse;
import com.ecommerce.backend.dto.OrderResponse;
import com.ecommerce.backend.dto.PagedResponse;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminOrderController {
    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<OrderResponse>> getOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        PagedResponse<Order> paged = orderService.getAdminPage(page, size, search, status);
        return ResponseEntity.ok(new PagedResponse<>(
                paged.getContent().stream().map(OrderResponse::from).toList(),
                paged.getTotalElements(),
                paged.getTotalPages(),
                paged.getPage(),
                paged.getSize()
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminOrderStatsResponse> getStats() {
        return ResponseEntity.ok(orderService.getAdminStats());
    }
}
