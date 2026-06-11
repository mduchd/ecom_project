package com.ecommerce.backend.service.impl;

import com.ecommerce.backend.dto.ResendEmailRequest;
import com.ecommerce.backend.service.EmailService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class EmailServiceImpl implements EmailService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${resend.api.key:}")
    private String resendApiKey;

    @Value("${resend.api.url:https://api.resend.com/emails}")
    private String resendApiUrl;

    @Value("${app.mail.from:no-reply@snap-cart.app}")
    private String fromEmail;

    public EmailServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    @Override
    public void sendOtpEmail(String toEmail, String otp, String type) {
        String subject = type.equals("SIGNUP") ? "Snapcart - OTP kích hoạt tài khoản" : "Snapcart - OTP khôi phục mật khẩu";
        String actionTitle = type.equals("SIGNUP") ? "Kích hoạt tài khoản" : "Khôi phục mật khẩu";
        String actionDesc = type.equals("SIGNUP")
                ? "Cảm ơn bạn đã lựa chọn Snapcart. Vui lòng nhập mã OTP bên dưới để kích hoạt tài khoản."
                : "Chúng tôi nhận được yêu cầu khôi phục mật khẩu từ bạn. Hãy sử dụng mã OTP bên dưới.";

        String htmlContent = "<div style=\"font-family: Arial, sans-serif; background:#0b0f19; padding:40px 20px; text-align:center; color:#ffffff;\">"
                + "<div style=\"max-width:500px; margin:0 auto; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:40px; text-align:left;\">"
                + "<h2 style=\"margin:0 0 10px; text-align:center;\">Snapcart</h2>"
                + "<h3 style=\"text-align:center;\">" + actionTitle + "</h3>"
                + "<p style=\"color:#cbd5e1; text-align:center;\">" + actionDesc + "</p>"
                + "<div style=\"margin:30px 0; padding:20px; text-align:center; border:1px solid rgba(59,130,246,0.25); border-radius:16px;\">"
                + "<span style=\"font-size:36px; letter-spacing:8px; color:#60a5fa; font-weight:700;\">" + otp + "</span>"
                + "</div>"
                + "<p style=\"color:#94a3b8; font-size:12px; text-align:center;\">OTP có hiệu lực trong 5 phút.</p>"
                + "</div>"
                + "</div>";

        sendHtmlMessage(toEmail, subject, htmlContent, null, null);
    }

    @Override
    public void sendOrderConfirmationEmail(String toEmail, String fullName, String orderId, double totalAmount, List<Map<String, Object>> items) {
        String subject = "Snapcart - Xác nhận đơn hàng #" + orderId;
        StringBuilder itemsHtml = new StringBuilder();
        for (Map<String, Object> item : items) {
            double price = parseMoney(item.get("price"));
            itemsHtml.append("<tr style=\"border-bottom:1px solid rgba(255,255,255,0.05);\">")
                    .append("<td style=\"padding:12px 0; color:#f1f5f9;\">").append(item.get("name")).append("</td>")
                    .append("<td style=\"padding:12px 0; text-align:center; color:#94a3b8;\">x").append(item.get("quantity")).append("</td>")
                    .append("<td style=\"padding:12px 0; text-align:right; color:#3b82f6; font-weight:600;\">").append(formatVnd(price)).append("</td>")
                    .append("</tr>");
        }

        String htmlContent = "<div style=\"font-family: Arial, sans-serif; background:#0b0f19; padding:40px 20px; color:#ffffff;\">"
                + "<div style=\"max-width:600px; margin:0 auto; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:40px;\">"
                + "<h2 style=\"margin:0 0 10px; text-align:center;\">Snapcart</h2>"
                + "<h3 style=\"margin-top:0; text-align:center;\">Cảm ơn bạn đã đặt hàng, " + fullName + "!</h3>"
                + "<p style=\"color:#cbd5e1;\">Đơn hàng của bạn đã được ghi nhận và đã có hóa đơn PDF đính kèm.</p>"
                + "<p><strong>Mã đơn hàng:</strong> #" + orderId + "</p>"
                + "<table style=\"width:100%; border-collapse:collapse; margin:20px 0;\">"
                + "<thead><tr><th style=\"text-align:left; padding-bottom:10px; color:#94a3b8;\">Sản phẩm</th><th style=\"text-align:center; padding-bottom:10px; color:#94a3b8;\">SL</th><th style=\"text-align:right; padding-bottom:10px; color:#94a3b8;\">Đơn giá</th></tr></thead>"
                + "<tbody>" + itemsHtml + "</tbody>"
                + "</table>"
                + "<div style=\"text-align:right; font-size:20px; font-weight:700; color:#10b981;\">Tổng thanh toán: " + formatVnd(totalAmount) + "</div>"
                + "</div>"
                + "</div>";

        byte[] invoicePdf = null;
        try {
            invoicePdf = createInvoicePdf(fullName, orderId, totalAmount, items);
        } catch (Exception e) {
            System.err.println("WARN: Failed to generate PDF invoice for order " + orderId + ": " + e.getMessage());
        }

        sendHtmlMessage(toEmail, subject, htmlContent, "invoice-" + safeFileName(orderId) + ".pdf", invoicePdf);
    }

    private void sendHtmlMessage(String to, String subject, String htmlBody, String attachmentName, byte[] attachmentBytes) {
        String apiKey = resendApiKey == null ? "" : resendApiKey.trim();
        if (apiKey.isEmpty()) {
            throw new RuntimeException("Resend API key is not configured.");
        }

        try {
            ResendEmailRequest.Attachment attachment = null;
            if (attachmentBytes != null && attachmentBytes.length > 0) {
                attachment = ResendEmailRequest.Attachment.builder()
                        .filename(attachmentName)
                        .content(Base64.getEncoder().encodeToString(attachmentBytes))
                        .build();
            }

            String sender = (fromEmail != null && !fromEmail.trim().isEmpty()) ? fromEmail.trim() : "no-reply@snap-cart.app";
            ResendEmailRequest payload = ResendEmailRequest.builder()
                    .from("Snapcart <" + sender + ">")
                    .to(List.of(to))
                    .subject(subject)
                    .html(htmlBody)
                    .attachments(attachment == null ? null : List.of(attachment))
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(resendApiUrl))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(toJson(payload), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Resend API error (" + response.statusCode() + "): " + response.body());
            }
        } catch (Exception e) {
            throw new RuntimeException("Gửi email thất bại: " + e.getMessage(), e);
        }
    }

    private byte[] createInvoicePdf(String fullName, String orderId, double totalAmount, List<Map<String, Object>> items) throws IOException {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDFont regularFont = loadRegularFont(document);
            PDFont boldFont = loadBoldFont(document);

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                float y = 780f;
                final float left = 50f;

                y = drawText(content, boldFont, 22f, left, y, "SNAPCART");
                y = drawText(content, regularFont, 12f, left, y - 8f, "Hóa đơn xác nhận đơn hàng");

                y -= 18f;
                y = drawLabelValue(content, regularFont, boldFont, left, y, "Mã đơn hàng", "#" + orderId);
                y = drawLabelValue(content, regularFont, boldFont, left, y - 8f, "Khách hàng", fullName);
                y = drawLabelValue(content, regularFont, boldFont, left, y - 8f, "Tổng thanh toán", formatVnd(totalAmount));
                y -= 20f;

                y = drawText(content, boldFont, 13f, left, y, "Danh sách sản phẩm");
                y = drawText(content, regularFont, 10.5f, left, y - 6f, "--------------------------------------------------------------");
                y -= 12f;

                int index = 1;
                for (Map<String, Object> item : items) {
                    if (y < 90f) {
                        break;
                    }
                    String name = String.valueOf(item.getOrDefault("name", ""));
                    int quantity = parseInt(item.get("quantity"));
                    double price = parseMoney(item.get("price"));
                    String row = index + ". " + name + " x" + quantity + " - " + formatVnd(price * quantity);
                    y = drawText(content, regularFont, 10.5f, left, y, row);
                    index++;
                }

                y -= 10f;
                y = drawText(content, regularFont, 10.5f, left, y, "--------------------------------------------------------------");
                y = drawText(content, boldFont, 13f, left, y - 4f, "Tổng cộng: " + formatVnd(totalAmount));
                drawText(content, regularFont, 10.5f, left, 40f, "Hóa đơn này được phát hành tự động bởi hệ thống Snapcart.");
            }

            document.save(output);
            return output.toByteArray();
        }
    }

    private PDFont loadRegularFont(PDDocument document) throws IOException {
        return loadFontOrFallback(document, "/fonts/NotoSans-Regular.ttf", PDType1Font.HELVETICA);
    }

    private PDFont loadBoldFont(PDDocument document) throws IOException {
        return loadFontOrFallback(document, "/fonts/NotoSans-Bold.ttf", PDType1Font.HELVETICA_BOLD);
    }

    private PDFont loadFontOrFallback(PDDocument document, String classpathLocation, PDFont fallback) throws IOException {
        ClassPathResource resource = new ClassPathResource(classpathLocation);
        if (!resource.exists()) {
            return fallback;
        }
        try (InputStream inputStream = resource.getInputStream()) {
            return PDType0Font.load(document, inputStream, true);
        }
    }

    private float drawLabelValue(PDPageContentStream content, PDFont labelFont, PDFont valueFont, float x, float y, String label, String value) throws IOException {
        y = drawText(content, labelFont, 10.5f, x, y, label + ":");
        return drawText(content, valueFont, 10.5f, x + 120f, y + 12f, value);
    }

    private float drawText(PDPageContentStream content, PDFont font, float size, float x, float y, String text) throws IOException {
        content.beginText();
        content.setFont(font, size);
        content.newLineAtOffset(x, y);
        content.showText(text == null ? "" : text);
        content.endText();
        return y - (size + 6f);
    }

    private String formatVnd(double amount) {
        return String.format("%,.0f VND", amount);
    }

    private int parseInt(Object value) {
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception e) {
            return 1;
        }
    }

    private double parseMoney(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception e) {
            return 0d;
        }
    }

    private String safeFileName(String value) {
        if (value == null || value.isBlank()) {
            return "invoice";
        }
        return value.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String toJson(ResendEmailRequest payload) throws JsonProcessingException {
        return objectMapper.writeValueAsString(payload);
    }
}
