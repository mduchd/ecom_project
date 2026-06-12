package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Order;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SepayWebhookService {

    private static final Logger logger = LoggerFactory.getLogger(SepayWebhookService.class);
    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("\\bSPC[0-9A-Z]{8,}\\b", Pattern.CASE_INSENSITIVE);

    private final OrderService orderService;
    private final String webhookApiKey;

    public SepayWebhookService(
            OrderService orderService,
            @Value("${app.sepay.webhook-api-key:}") String webhookApiKey
    ) {
        this.orderService = orderService;
        this.webhookApiKey = webhookApiKey == null ? "" : webhookApiKey.trim();
    }

    public SepayWebhookResult handle(String authorizationHeader, String apiKeyHeader, JsonNode payload) {
        logger.info("SePay webhook received: authorizationPresent={}, apiKeyPresent={}, payload={}",
                StringUtils.hasText(authorizationHeader),
                StringUtils.hasText(apiKeyHeader),
                payload);

        if (!isAuthorized(authorizationHeader, apiKeyHeader)) {
            logger.warn("SePay webhook unauthorized.");
            return SepayWebhookResult.unauthorized("Webhook SePay khong hop le: sai API key.");
        }

        if (payload == null || payload.isNull()) {
            logger.warn("SePay webhook ignored: empty payload.");
            return SepayWebhookResult.ignored("Payload rong.");
        }

        BigDecimal amountIn = extractAmountIn(payload);
        if (amountIn != null && amountIn.signum() < 0) {
            logger.warn("SePay webhook ignored: negative amountIn={}", amountIn);
            return SepayWebhookResult.ignored("Giao dich khong tang so du, bo qua.");
        }

        String orderCode = extractOrderCode(payload);
        logger.info("SePay webhook parsed: orderCode={}, amountIn={}", orderCode, amountIn);
        if (!StringUtils.hasText(orderCode)) {
            logger.warn("SePay webhook ignored: order code not found.");
            return SepayWebhookResult.ignored("Khong tim thay ma don hang (SPC...) trong noi dung giao dich.");
        }

        try {
            Order updatedOrder = orderService.markPaidByOrderCode(orderCode.toUpperCase(Locale.ROOT));
            logger.info("SePay webhook processed successfully for orderCode={}, newStatus={}",
                    updatedOrder.getOrderCode(), updatedOrder.getStatus());
            return SepayWebhookResult.processed(
                    updatedOrder.getOrderCode(),
                    updatedOrder.getStatus(),
                    "Da cap nhat trang thai don hang tu webhook SePay."
            );
        } catch (RuntimeException ex) {
            logger.warn("SePay webhook ignored due to processing error for orderCode={}: {}", orderCode, ex.getMessage(), ex);
            return SepayWebhookResult.ignored(ex.getMessage());
        }
    }

    private boolean isAuthorized(String authorizationHeader, String apiKeyHeader) {
        if (!StringUtils.hasText(webhookApiKey)) {
            return true;
        }

        String normalizedAuthorization = normalizeAuthToken(authorizationHeader);
        String normalizedApiKey = normalizeAuthToken(apiKeyHeader);

        return secureEquals(webhookApiKey, normalizedAuthorization)
                || secureEquals(webhookApiKey, normalizedApiKey);
    }

    private String normalizeAuthToken(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        String token = value.trim();
        if (token.regionMatches(true, 0, "Apikey ", 0, 7)) {
            return token.substring(7).trim();
        }
        if (token.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return token.substring(7).trim();
        }
        return token;
    }

    private boolean secureEquals(String left, String right) {
        byte[] leftBytes = left.getBytes(StandardCharsets.UTF_8);
        byte[] rightBytes = right.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(leftBytes, rightBytes);
    }

    private BigDecimal extractAmountIn(JsonNode root) {
        BigDecimal amountIn = findNumericByFieldNames(root, "amountIn", "transferAmount", "amount", "value");
        if (amountIn != null) {
            return amountIn;
        }
        return null;
    }

    private BigDecimal findNumericByFieldNames(JsonNode node, String... fieldNames) {
        if (node == null) {
            return null;
        }

        if (node.isObject()) {
            for (String fieldName : fieldNames) {
                JsonNode candidate = node.get(fieldName);
                BigDecimal parsed = toDecimal(candidate);
                if (parsed != null) {
                    return parsed;
                }
            }

            Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                BigDecimal nested = findNumericByFieldNames(field.getValue(), fieldNames);
                if (nested != null) {
                    return nested;
                }
            }
        }

        if (node.isArray()) {
            for (JsonNode child : node) {
                BigDecimal nested = findNumericByFieldNames(child, fieldNames);
                if (nested != null) {
                    return nested;
                }
            }
        }

        return null;
    }

    private BigDecimal toDecimal(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isNumber()) {
            return node.decimalValue();
        }
        if (node.isTextual()) {
            String text = node.asText().trim().replace(",", "");
            if (!StringUtils.hasText(text)) {
                return null;
            }
            try {
                return new BigDecimal(text);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private String extractOrderCode(JsonNode root) {
        if (root == null) {
            return null;
        }

        if (root.isTextual()) {
            return matchOrderCode(root.asText());
        }

        if (root.isObject()) {
            JsonNode contentNode = firstNonNull(
                    root.get("content"),
                    root.get("description"),
                    root.get("transactionContent"),
                    root.get("transferContent"),
                    root.get("reference"),
                    root.get("code"),
                    root.get("orderCode")
            );
            String fromMainField = extractOrderCode(contentNode);
            if (StringUtils.hasText(fromMainField)) {
                return fromMainField;
            }

            Iterator<Map.Entry<String, JsonNode>> fields = root.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                String nested = extractOrderCode(field.getValue());
                if (StringUtils.hasText(nested)) {
                    return nested;
                }
            }
        }

        if (root.isArray()) {
            for (JsonNode child : root) {
                String nested = extractOrderCode(child);
                if (StringUtils.hasText(nested)) {
                    return nested;
                }
            }
        }

        return null;
    }

    private JsonNode firstNonNull(JsonNode... nodes) {
        for (JsonNode node : nodes) {
            if (node != null && !node.isNull()) {
                return node;
            }
        }
        return null;
    }

    private String matchOrderCode(String text) {
        if (!StringUtils.hasText(text)) {
            return null;
        }
        Matcher matcher = ORDER_CODE_PATTERN.matcher(text.toUpperCase(Locale.ROOT));
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    public record SepayWebhookResult(
            boolean success,
            boolean processed,
            boolean unauthorized,
            String message,
            String orderCode,
            String orderStatus
    ) {
        static SepayWebhookResult processed(String orderCode, String orderStatus, String message) {
            return new SepayWebhookResult(true, true, false, message, orderCode, orderStatus);
        }

        static SepayWebhookResult ignored(String message) {
            return new SepayWebhookResult(true, false, false, message, null, null);
        }

        static SepayWebhookResult unauthorized(String message) {
            return new SepayWebhookResult(false, false, true, message, null, null);
        }
    }
}
