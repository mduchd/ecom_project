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
            return "Hi騾ｶ・ｻ郢ｻ・ｻ t髯ゑｽｯ繝ｻ・｡i c騾ｶ・ｻ繝ｻ・ｭa h繝ｻ繝ｻ・｣・ｰng kh繝ｻ繝ｻ・ｽ・ｴng c繝ｻ繝ｻ・ｽ・ｳ s髯ゑｽｯ繝ｻ・｣n ph髯ゑｽｯ繝ｻ・ｩm ph繝ｻ繝ｻ・ｽ・ｹ h騾ｶ・ｻ繝ｻ・｣p.";
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
                "B髯ゑｽｯ繝ｻ・｡n l繝ｻ繝ｻ・｣・ｰ SnapBot, tr騾ｶ・ｻ繝ｻ・｣ l繝ｻ繝ｻ・ｽ・ｽ mua s髯ゑｽｯ繝ｻ・ｯm th繝ｻ繝ｻ・ｽ・ｴng minh c騾ｶ・ｻ繝ｻ・ｧa SnapCart. " +
                "Ch騾ｶ・ｻ郢晢ｽｻ繝ｻ繝ｻ豌医・・ｰ騾ｶ・ｻ繝ｻ・｣c tr髯ゑｽｯ繝ｻ・｣ l騾ｶ・ｻ隲｡・ｱ d騾ｶ・ｻ繝ｻ・ｱa tr繝ｻ繝ｻ・ｽ・ｪn d騾ｶ・ｻ繝ｻ・ｯ li騾ｶ・ｻ邱包ｽ｡ s髯ゑｽｯ繝ｻ・｣n ph髯ゑｽｯ繝ｻ・ｩm th騾ｶ・ｻ繝ｻ・ｱc t髯ゑｽｯ繝ｻ・ｿ 繝ｻ繝ｻ豌医・・ｰ騾ｶ・ｻ繝ｻ・｣c cung c髯ゑｽｯ繝ｻ・･p b繝ｻ繝ｻ・ｽ・ｪn d繝ｻ繝ｻ・ｽ・ｰ騾ｶ・ｻ陞ｫ繝ｻ " +
                "Kh繝ｻ繝ｻ・ｽ・ｴng 繝ｻ繝ｻ豌医・・ｰ騾ｶ・ｻ繝ｻ・｣c t騾ｶ・ｻ繝ｻ・ｱ th繝ｻ繝ｻ・ｽ・ｪm s髯ゑｽｯ繝ｻ・｣n ph髯ゑｽｯ繝ｻ・ｩm kh繝ｻ繝ｻ・ｽ・ｴng c繝ｻ繝ｻ・ｽ・ｳ trong kho. " +
                "Gia hien tai cua san pham nam o truong price, con discountPrice la gia goc truoc khi giam. " +
                "Khi nhac den gia ban, luon uu tien gia hien tai. " +
                "N髯ゑｽｯ繝ｻ・ｿu c繝ｻ繝ｻ・ｽ・｢u h騾ｶ・ｻ雎ｺ繝ｻkh繝ｻ繝ｻ・ｽ・ｴng li繝ｻ繝ｻ・ｽ・ｪn quan 繝ｻ繝ｻ・ｻ蟷｢・ｽ・ｺ繝ｻ・ｿn mua s髯ゑｽｯ繝ｻ・ｯm, h繝ｻ繝ｻ・ｽ・｣y l騾ｶ・ｻ髫ｴ・ｰh s騾ｶ・ｻ繝ｻ・ｱ v繝ｻ繝ｻ・｣・ｰ ng髯ゑｽｯ繝ｻ・ｯn g騾ｶ・ｻ髢ｧ・ｱ. " +
                "Tr髯ゑｽｯ繝ｻ・｣ l騾ｶ・ｻ隲｡・ｱ ng髯ゑｽｯ繝ｻ・ｯn g騾ｶ・ｻ髢ｧ・ｱ, th繝ｻ繝ｻ・ｽ・｢n thi騾ｶ・ｻ郢ｻ・ｻ, lu繝ｻ繝ｻ・ｽ・ｴn d繝ｻ繝ｻ・ｽ・ｹng ti髯ゑｽｯ繝ｻ・ｿng Vi騾ｶ・ｻ郢ｽ繝ｻv繝ｻ繝ｻ・｣・ｰ kh繝ｻ繝ｻ・ｽ・ｴng d繝ｻ繝ｻ・ｽ・ｹng markdown, kh繝ｻ繝ｻ・ｽ・ｴng d繝ｻ繝ｻ・ｽ・ｹng k繝ｻ繝ｻ・ｽ・ｽ t騾ｶ・ｻ繝ｻ・ｱ **, __, # hay bullet list. " +
                "N髯ゑｽｯ繝ｻ・ｿu c繝ｻ繝ｻ・ｽ・ｳ s髯ゑｽｯ繝ｻ・｣n ph髯ゑｽｯ繝ｻ・ｩm ph繝ｻ繝ｻ・ｽ・ｹ h騾ｶ・ｻ繝ｻ・｣p, ch騾ｶ・ｻ郢晢ｽｻc髯ゑｽｯ繝ｻ・ｧn gi騾ｶ・ｻ陞ｫ繝ｻthi騾ｶ・ｻ邱包ｽ｡ ng髯ゑｽｯ繝ｻ・ｯn g騾ｶ・ｻ髢ｧ・ｱ 繝ｻ繝ｻ・ｻ蟷｢・ｽ・ｻ郢晢ｽｻfrontend hi騾ｶ・ｻ郢昴・th騾ｶ・ｻ郢晢ｽｻcard s髯ゑｽｯ繝ｻ・｣n ph髯ゑｽｯ繝ｻ・ｩm ri繝ｻ繝ｻ・ｽ・ｪng.\n\n" +
                productContext;

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> part = new HashMap<>();

        part.put("text", systemInstruction + "\nKh繝ｻ繝ｻ・ｽ・｡ch h繝ｻ繝ｻ・｣・ｰng h騾ｶ・ｻ雎ｺ繝ｻ " + userMessage);
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

                return "Xin l騾ｶ・ｻ隰ｫ繝ｻ m繝ｻ繝ｻ・ｽ・ｬnh ch繝ｻ繝ｻ・ｽ・ｰa x騾ｶ・ｻ繝ｻ・ｭ l繝ｻ繝ｻ・ｽ・ｽ 繝ｻ繝ｻ豌医・・ｰ騾ｶ・ｻ繝ｻ・｣c y繝ｻ繝ｻ・ｽ・ｪu c髯ゑｽｯ繝ｻ・ｧu n繝ｻ繝ｻ・｣・ｰy.";
            } catch (Exception e) {
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(1500);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                } else {
                    return "Xin l騾ｶ・ｻ隰ｫ繝ｻ AI 繝ｻ繝ｻ魄ｪng b髯ゑｽｯ繝ｻ・ｭn. B髯ゑｽｯ繝ｻ・｡n vui l繝ｻ繝ｻ・ｽ・ｲng th騾ｶ・ｻ繝ｻ・ｭ l髯ゑｽｯ繝ｻ・｡i sau.";
                }
            }
        }

        return "Xin l騾ｶ・ｻ隰ｫ繝ｻ AI 繝ｻ繝ｻ魄ｪng b髯ゑｽｯ繝ｻ・ｭn. B髯ゑｽｯ繝ｻ・｡n vui l繝ｻ繝ｻ・ｽ・ｲng th騾ｶ・ｻ繝ｻ・ｭ l髯ゑｽｯ繝ｻ・｡i sau.";
    }

    private String sanitizeReply(String reply) {
        if (reply == null || reply.isBlank()) {
            return "Xin l騾ｶ・ｻ隰ｫ繝ｻ m繝ｻ繝ｻ・ｽ・ｬnh ch繝ｻ繝ｻ・ｽ・ｰa x騾ｶ・ｻ繝ｻ・ｭ l繝ｻ繝ｻ・ｽ・ｽ 繝ｻ繝ｻ豌医・・ｰ騾ｶ・ｻ繝ｻ・｣c y繝ｻ繝ｻ・ｽ・ｪu c髯ゑｽｯ繝ｻ・ｧu n繝ｻ繝ｻ・｣・ｰy.";
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
