package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AdminProductStatsResponse;
import com.ecommerce.backend.dto.PagedResponse;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminProductController {
    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<Product>> getProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sortField,
            @RequestParam(required = false) String sortDir) {
        return ResponseEntity.ok(productService.getAdminPage(page, size, search, category, sortField, sortDir));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminProductStatsResponse> getStats() {
        return ResponseEntity.ok(productService.getAdminStats());
    }
}
