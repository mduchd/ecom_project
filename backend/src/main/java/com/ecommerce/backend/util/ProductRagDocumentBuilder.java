package com.ecommerce.backend.util;

import com.ecommerce.backend.entity.Product;

import java.math.BigDecimal;
import java.util.Locale;

public final class ProductRagDocumentBuilder {

    private static final int DESCRIPTION_LIMIT = 280;
    private static final int SPEC_LIMIT = 360;

    private ProductRagDocumentBuilder() {
    }

    public static String build(Product product) {
        StringBuilder sb = new StringBuilder();
        sb.append("product_doc_v1\n");
        sb.append("id: ").append(safe(product.getId())).append('\n');
        sb.append("name: ").append(safe(product.getName())).append('\n');
        sb.append("category: ").append(safe(product.getCategory())).append('\n');
        sb.append("brand: ").append(safe(product.getBrand())).append('\n');
        sb.append("current_price_vnd: ").append(formatMoney(product.getPrice())).append('\n');
        sb.append("original_price_vnd: ").append(formatMoney(product.getDiscountPrice())).append('\n');
        sb.append("in_stock: ").append(isInStock(product)).append('\n');
        sb.append("stock_quantity: ").append(safe(product.getStockQuantity())).append('\n');
        sb.append("summary: ").append(limit(normalize(product.getDescription()), DESCRIPTION_LIMIT)).append('\n');
        sb.append("specifications: ").append(limit(normalize(product.getSpecifications()), SPEC_LIMIT)).append('\n');
        sb.append("search_text: ").append(buildSearchText(product)).append('\n');
        return sb.toString();
    }

    public static String buildCompactLabel(Product product) {
        String price = formatMoney(product.getPrice());
        return String.format(Locale.US, "#%s | %s | %s | %s VND | stock=%s",
                safe(product.getId()),
                safe(product.getName()),
                safe(product.getBrand()),
                price,
                safe(product.getStockQuantity()));
    }

    private static boolean isInStock(Product product) {
        return product.getStockQuantity() != null && product.getStockQuantity() > 0;
    }

    private static String buildSearchText(Product product) {
        return normalize(String.join(" ",
                safe(product.getName()),
                safe(product.getCategory()),
                safe(product.getBrand()),
                safe(product.getDescription()),
                safe(product.getSpecifications())
        ));
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\s+", " ").trim();
    }

    private static String limit(String value, int maxLen) {
        if (value == null || value.isEmpty()) {
            return "";
        }
        if (value.length() <= maxLen) {
            return value;
        }
        return value.substring(0, maxLen - 3).trim() + "...";
    }

    private static String safe(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static String formatMoney(BigDecimal value) {
        if (value == null) {
            return "";
        }
        return String.format(Locale.US, "%,.0f", value);
    }
}
