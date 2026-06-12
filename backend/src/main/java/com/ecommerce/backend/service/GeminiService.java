package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.AIChatResponse;
import com.ecommerce.backend.dto.AIProductSuggestionDto;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.util.ProductRagDocumentBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class GeminiService {
    private static final Pattern MARKDOWN_DECORATORS = Pattern.compile("(\\*\\*|__|`|#+\\s*)");

    @Value("${google.gemini.api.key}")
    private String apiKey;

    @Value("${google.gemini.url}")
    private String apiUrl;

    @Autowired
    private ProductRagRetrievalService productRagRetrievalService;

    @Autowired
    private ProductRepository productRepository;

    private final RestTemplate restTemplate;

    public GeminiService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(30_000);
        this.restTemplate = new RestTemplate(factory);
    }

    private String formatProductsAsContext(List<Product> products) {
        if (products.isEmpty()) {
            return "Hiện tại cửa hàng không có sản phẩm phù hợp.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("=== PRODUCT DOCS FOR RAG ===\n");
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            sb.append("\n[doc ").append(i + 1).append("]\n");
            sb.append(ProductRagDocumentBuilder.build(product));
        }
        sb.append("\n=====================================\n");
        return sb.toString();
    }

    public AIChatResponse getChatResponse(String userMessage) {
        List<Product> relevantProducts = selectSuggestedProducts(userMessage);
        String reply = generateReply(userMessage, relevantProducts);
        List<AIProductSuggestionDto> suggestions = shouldHideProductSuggestions(reply)
                ? List.of()
                : relevantProducts.stream()
                .map(this::toSuggestionDto)
                .toList();

        return new AIChatResponse(reply, suggestions);
    }

    private List<Product> selectSuggestedProducts(String userMessage) {
        if (isHighestPriceQuery(userMessage)) {
            return findExtremePriceProduct(true);
        }
        if (isLowestPriceQuery(userMessage)) {
            return findExtremePriceProduct(false);
        }
        return productRagRetrievalService.retrieveRelevantProducts(userMessage, 5);
    }

    private boolean isHighestPriceQuery(String userMessage) {
        String normalized = normalizeText(userMessage);
        return normalized.contains("dat nhat")
                || normalized.contains("gia cao nhat")
                || normalized.contains("mac nhat");
    }

    private boolean isLowestPriceQuery(String userMessage) {
        String normalized = normalizeText(userMessage);
        return normalized.contains("re nhat")
                || normalized.contains("gia thap nhat")
                || normalized.contains("gia mem nhat");
    }

    private List<Product> findExtremePriceProduct(boolean highest) {
        Comparator<Product> comparator = Comparator.comparing(
                this::resolveDisplayPrice,
                Comparator.nullsLast(Comparator.naturalOrder())
        );

        if (highest) {
            comparator = comparator.reversed();
        }

        return productRepository.findByStockQuantityGreaterThan(0).stream()
                .sorted(comparator)
                .limit(1)
                .toList();
    }

    private java.math.BigDecimal resolveDisplayPrice(Product product) {
        if (product == null) {
            return null;
        }
        if (product.getPrice() != null) {
            return product.getPrice();
        }
        return product.getDiscountPrice();
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        return normalized.toLowerCase(Locale.ROOT);
    }

    private String generateReply(String userMessage, List<Product> relevantProducts) {
        String url = apiUrl + apiKey;
        String productContext = formatProductsAsContext(relevantProducts);

        String systemInstruction =
                "Bạn là SnapBot, trợ lý mua sắm thông minh của SnapCart. " +
                "Chỉ được trả lời dựa trên dữ liệu sản phẩm thực tế được cung cấp bên dưới. " +
                "Không được tự thêm sản phẩm không có trong kho. " +
                "Nếu có giá khuyến mãi thì ưu tiên giá khuyến mãi. " +
                "Nếu câu hỏi không liên quan đến mua sắm, hãy lịch sự và ngắn gọn. " +
                "Trả lời ngắn gọn, thân thiện, luôn dùng tiếng Việt và không dùng markdown, không dùng ký tự **, __, # hay bullet list. " +
                "Nếu có sản phẩm phù hợp, chỉ cần giới thiệu ngắn gọn để frontend hiển thị card sản phẩm riêng.\n\n" +
                productContext;

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> part = new HashMap<>();

        part.put("text", systemInstruction + "\nKhách hàng hỏi: " + userMessage);
        parts.add(part);
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);

        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);

                if (response != null && response.containsKey("candidates")) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<String, Object> candidate = candidates.get(0);
                        Map<String, Object> responseContent = (Map<String, Object>) candidate.get("content");
                        List<Map<String, Object>> responseParts = (List<Map<String, Object>>) responseContent.get("parts");
                        if (!responseParts.isEmpty()) {
                            return sanitizeReply(String.valueOf(responseParts.get(0).get("text")));
                        }
                    }
                }

                return "Xin lỗi, mình chưa xử lý được yêu cầu này.";
            } catch (Exception e) {
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(1500);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                } else {
                    return "Xin lỗi, AI đang bận. Bạn vui lòng thử lại sau.";
                }
            }
        }

        return "Xin lỗi, AI đang bận. Bạn vui lòng thử lại sau.";
    }

    private String sanitizeReply(String reply) {
        if (reply == null || reply.isBlank()) {
            return "Xin lỗi, mình chưa xử lý được yêu cầu này.";
        }

        return MARKDOWN_DECORATORS.matcher(reply)
                .replaceAll("")
                .replace("\r", "")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }

    private boolean shouldHideProductSuggestions(String reply) {
        String normalized = normalizeText(reply);
        return normalized.contains("chi co the giup ban tim kiem thong tin ve san pham")
                || normalized.contains("chi co the ho tro thong tin ve san pham")
                || normalized.contains("khong lien quan den mua sam")
                || normalized.contains("minh chi co the giup ve san pham")
                || normalized.contains("toi chi co the giup ve san pham");
    }

    private AIProductSuggestionDto toSuggestionDto(Product product) {
        return new AIProductSuggestionDto(
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                product.getPrice(),
                product.getDiscountPrice(),
                product.getStockQuantity(),
                product.getBrand(),
                product.getCategory()
        );
    }
}
