package com.ecommerce.backend.controller;

import com.ecommerce.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
public class OrderTestController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/test-email")
    public ResponseEntity<?> testOrderEmail(@RequestParam String email) {
        // Tạo danh sách sản phẩm giả lập
        List<Map<String, Object>> items = new ArrayList<>();
        
        Map<String, Object> item1 = new HashMap<>();
        item1.put("name", "iPhone 15 Pro Max - Blue Titanium");
        item1.put("quantity", 1);
        item1.put("price", 1199.00);
        
        Map<String, Object> item2 = new HashMap<>();
        item2.put("name", "Apple Watch Ultra 2 (Trail Loop)");
        item2.put("quantity", 2);
        item2.put("price", 799.00);
        
        items.add(item1);
        items.add(item2);

        double totalAmount = 1199.00 + (799.00 * 2);
        String orderId = String.format("SPC%d", System.currentTimeMillis() % 1000000);

        emailService.sendOrderConfirmationEmail(email, "Khách Hàng Thân Thiết", orderId, totalAmount, items);

        return ResponseEntity.ok(Map.of("message", "Đã gửi Email hóa đơn đặt hàng mẫu thành công tới " + email + "!"));
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmOrder(@RequestBody com.ecommerce.backend.dto.OrderConfirmationRequest request) {
        emailService.sendOrderConfirmationEmail(
                request.getEmail(),
                request.getFullName(),
                request.getOrderId(),
                request.getTotalAmount(),
                request.getItems()
        );
        return ResponseEntity.ok(Map.of("message", "Order confirmation email sent successfully!"));
    }
}
