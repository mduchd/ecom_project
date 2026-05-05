package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    @Value("${google.gemini.api.key}")
    private String apiKey;

    @Value("${google.gemini.url}")
    private String apiUrl;

    @Autowired
    private ProductRepository productRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    // ── Trích xuất từ khóa quan trọng từ câu hỏi của user ─────────────────────
    private List<String> extractKeywords(String userMessage) {
        // Loại bỏ các stop words tiếng Việt phổ biến
        String[] stopWords = {"tôi", "bạn", "có", "không", "và", "hoặc", "là", "của", "cho", "với",
                "này", "đó", "được", "để", "từ", "một", "những", "các", "cái", "muốn",
                "cần", "mua", "tìm", "xem", "hỏi", "về", "giá", "bao", "nhiêu", "rẻ",
                "đắt", "tốt", "ngon", "mạnh", "nhanh", "bền", "đẹp", "nhẹ", "chất"};
        Set<String> stopSet = new HashSet<>(Arrays.asList(stopWords));

        return Arrays.stream(userMessage.toLowerCase().split("\\s+"))
                .filter(word -> word.length() > 2 && !stopSet.contains(word))
                .distinct()
                .collect(Collectors.toList());
    }

    // ── RAG: Lấy sản phẩm liên quan từ Database ────────────────────────────────
    private List<Product> retrieveRelevantProducts(String userMessage) {
        Set<Product> results = new LinkedHashSet<>();
        List<String> keywords = extractKeywords(userMessage);

        for (String keyword : keywords) {
            List<Product> found = productRepository.searchByKeyword(keyword);
            // Chỉ lấy sản phẩm còn hàng
            found.stream()
                 .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() > 0)
                 .forEach(results::add);
            if (results.size() >= 5) break; // Giới hạn tối đa 5 sản phẩm
        }

        // Nếu không tìm thấy sản phẩm cụ thể, trả về 3 sản phẩm nổi bật bất kỳ
        if (results.isEmpty()) {
            productRepository.findByStockQuantityGreaterThan(0)
                    .stream().limit(3).forEach(results::add);
        }

        return new ArrayList<>(results);
    }

    // ── Format thông tin sản phẩm thành chuỗi văn bản cho Prompt ──────────────
    private String formatProductsAsContext(List<Product> products) {
        if (products.isEmpty()) return "Hiện tại cửa hàng không có sản phẩm phù hợp.";

        StringBuilder sb = new StringBuilder();
        sb.append("=== DANH SÁCH SẢN PHẨM TRONG KHO ===\n");
        for (int i = 0; i < products.size(); i++) {
            Product p = products.get(i);
            sb.append(String.format("\n[Sản phẩm %d]\n", i + 1));
            sb.append("Tên: ").append(p.getName()).append("\n");
            sb.append("Danh mục: ").append(p.getCategory()).append("\n");
            sb.append("Thương hiệu: ").append(p.getBrand()).append("\n");
            sb.append("Giá gốc: ").append(String.format("%,.0f VNĐ", p.getPrice())).append("\n");
            if (p.getDiscountPrice() != null) {
                sb.append("Giá khuyến mãi: ").append(String.format("%,.0f VNĐ", p.getDiscountPrice())).append("\n");
            }
            sb.append("Tồn kho: ").append(p.getStockQuantity()).append(" sản phẩm\n");
            if (p.getSpecifications() != null) {
                sb.append("Thông số: ").append(p.getSpecifications()).append("\n");
            }
            if (p.getDescription() != null) {
                sb.append("Mô tả: ").append(p.getDescription()).append("\n");
            }
        }
        sb.append("\n=====================================\n");
        return sb.toString();
    }

    // ── Main chat method ───────────────────────────────────────────────────────
    public String getChatResponse(String userMessage) {
        String url = apiUrl + apiKey;

        // BƯỚC 1 - RETRIEVE: Lấy sản phẩm liên quan từ DB
        List<Product> relevantProducts = retrieveRelevantProducts(userMessage);
        String productContext = formatProductsAsContext(relevantProducts);

        // BƯỚC 2 - AUGMENT: Nhúng dữ liệu sản phẩm thật vào Prompt
        String systemInstruction = "Bạn là SnapBot, trợ lý mua sắm thông minh của cửa hàng SnapCart. " +
                "Hãy tư vấn dựa trên DỮ LIỆU SẢN PHẨM THỰC TẾ được cung cấp bên dưới. " +
                "Chỉ giới thiệu sản phẩm có trong danh sách này, KHÔNG được bịa đặt sản phẩm không có trong kho. " +
                "Khi nêu giá, hãy ưu tiên giá khuyến mãi nếu có. " +
                "Nếu khách hỏi về chủ đề không liên quan đến mua sắm, hãy lịch sự từ chối. " +
                "Trả lời ngắn gọn, thân thiện và luôn dùng tiếng Việt.\n\n" +
                productContext;

        // Chuẩn bị request body cho Gemini API
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

        // BƯỚC 3 - GENERATE: Gọi Gemini API với retry logic
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
                            return (String) responseParts.get(0).get("text");
                        }
                    }
                }
                return "Xin lỗi, mình không thể xử lý yêu cầu lúc này.";

            } catch (Exception e) {
                if (attempt < maxRetries) {
                    try { Thread.sleep(2000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                } else {
                    return "Xin lỗi, AI đang quá bận! Bạn vui lòng thử lại sau giây lát nhé 🙏";
                }
            }
        }
        return "Xin lỗi, AI đang quá bận! Bạn vui lòng thử lại sau giây lát nhé 🙏";
    }
}
