package com.ecommerce.backend.service;

import java.util.List;
import java.util.Map;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otp, String type);
    void sendOrderConfirmationEmail(String toEmail, String fullName, String orderId, double totalAmount, List<Map<String, Object>> items);
}
