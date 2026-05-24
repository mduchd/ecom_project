package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otp, String type) {
        String subject = type.equals("SIGNUP") ? "🌟 Kích Hoạt Tài Khoản Snapcart" : "🔑 Khôi Phục Mật Khẩu Snapcart";
        String actionTitle = type.equals("SIGNUP") ? "ĐĂNG KÝ TÀI KHOẢN" : "KHÔI PHỤC MẬT KHẨU";
        String actionDesc = type.equals("SIGNUP") 
            ? "Cảm ơn bạn đã lựa chọn Snapcart. Vui lòng nhập mã OTP bên dưới để kích hoạt tài khoản."
            : "Chúng tôi nhận được yêu cầu khôi phục mật khẩu từ bạn. Hãy sử dụng mã OTP bên dưới.";

        String htmlContent = "<div style=\"font-family: 'Inter', system-ui, sans-serif; background: #0b0f19; padding: 40px 20px; text-align: center; color: #ffffff;\">"
            + "  <div style=\"max-width: 500px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); backdrop-filter: blur(10px); text-align: left;\">"
            + "    <div style=\"text-align: center; margin-bottom: 30px;\">"
            + "      <h2 style=\"background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: 1px;\">Snapcart</h2>"
            + "      <p style=\"color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;\">Premium E-commerce</p>"
            + "    </div>"
            + "    <h3 style=\"color: #f1f5f9; font-size: 18px; margin-top: 0; text-align: center; font-weight: 600;\">" + actionTitle + "</h3>"
            + "    <p style=\"color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center;\">" + actionDesc + "</p>"
            + "    <div style=\"background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 16px; padding: 20px; text-align: center; margin: 30px 0;\">"
            + "      <span style=\"font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #60a5fa;\">" + otp + "</span>"
            + "    </div>"
            + "    <p style=\"color: #64748b; font-size: 12px; text-align: center; margin: 0;\">Mã OTP có hiệu lực trong vòng 5 phút và chỉ sử dụng được 1 lần duy nhất.</p>"
            + "  </div>"
            + "  <div style=\"text-align: center; margin-top: 20px; color: #475569; font-size: 12px;\">© 2026 Snapcart Inc. All rights reserved.</div>"
            + "</div>";

        sendHtmlMessage(toEmail, subject, htmlContent);
    }

    @Override
    public void sendOrderConfirmationEmail(String toEmail, String fullName, String orderId, double totalAmount, List<Map<String, Object>> items) {
        String subject = "🛍️ Xác Nhận Đơn Hàng Thành Công #" + orderId;
        
        StringBuilder itemsHtml = new StringBuilder();
        for (Map<String, Object> item : items) {
            itemsHtml.append("<tr style=\"border-bottom: 1px solid rgba(255,255,255,0.05);\">")
                .append("  <td style=\"padding: 12px 0; color: #f1f5f9;\">").append(item.get("name")).append("</td>")
                .append("  <td style=\"padding: 12px 0; text-align: center; color: #94a3b8;\">x").append(item.get("quantity")).append("</td>")
                .append("  <td style=\"padding: 12px 0; text-align: right; color: #3b82f6; font-weight: 600;\">$").append(String.format("%.2f", item.get("price"))).append("</td>")
                .append("</tr>");
        }

        String htmlContent = "<div style=\"font-family: 'Inter', system-ui, sans-serif; background: #0b0f19; padding: 40px 20px; color: #ffffff;\">"
            + "  <div style=\"max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); backdrop-filter: blur(10px);\">"
            + "    <div style=\"text-align: center; margin-bottom: 30px;\">"
            + "      <h2 style=\"background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin: 0; font-weight: 800;\">Snapcart</h2>"
            + "      <p style=\"color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;\">Hóa đơn điện tử</p>"
            + "    </div>"
            + "    <h3 style=\"color: #f1f5f9; font-size: 18px; margin-top: 0; font-weight: 600;\">Cảm ơn bạn đã đặt hàng, " + fullName + "!</h3>"
            + "    <p style=\"color: #94a3b8; font-size: 14px; line-height: 1.6;\">Đơn hàng của bạn đã được tiếp nhận và đang được đóng gói chuẩn bị giao.</p>"
            + "    <div style=\"margin: 24px 0; border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 15px 0;\">"
            + "      <span style=\"color: #64748b; font-size: 13px;\">Mã đơn hàng:</span>"
            + "      <span style=\"float: right; color: #f1f5f9; font-weight: 600; font-family: monospace;\">#" + orderId + "</span>"
            + "    </div>"
            + "    <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 20px;\">"
            + "      <thead>"
            + "        <tr style=\"border-bottom: 1px solid rgba(255,255,255,0.1);\">"
            + "          <th style=\"text-align: left; padding-bottom: 10px; color: #64748b; font-size: 12px;\">SẢN PHẨM</th>"
            + "          <th style=\"text-align: center; padding-bottom: 10px; color: #64748b; font-size: 12px;\">SL</th>"
            + "          <th style=\"text-align: right; padding-bottom: 10px; color: #64748b; font-size: 12px;\">ĐƠN GIÁ</th>"
            + "        </tr>"
            + "      </thead>"
            + "      <tbody>" + itemsHtml.toString() + "</tbody>"
            + "    </table>"
            + "    <div style=\"background: rgba(255,255,255,0.02); border-radius: 12px; padding: 15px 20px; text-align: right; border: 1px solid rgba(255,255,255,0.04);\">"
            + "      <span style=\"color: #64748b; font-size: 14px; margin-right: 15px;\">Tổng thanh toán:</span>"
            + "      <span style=\"font-size: 20px; font-weight: 800; color: #10b981;\">$" + String.format("%.2f", totalAmount) + "</span>"
            + "    </div>"
            + "  </div>"
            + "  <div style=\"text-align: center; margin-top: 20px; color: #475569; font-size: 12px;\">© 2026 Snapcart Inc. All rights reserved.</div>"
            + "</div>";

        sendHtmlMessage(toEmail, subject, htmlContent);
    }

    private void sendHtmlMessage(String to, String subject, String htmlBody) {
        if (mailSender == null) {
            System.err.println("WARN: Email sender is not configured (missing spring.mail properties). Simulating email send to: " + to + " with subject: " + subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("Snapcart <noreply.snapcart@gmail.com>");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Gửi email thất bại: " + e.getMessage());
        }
    }
}
