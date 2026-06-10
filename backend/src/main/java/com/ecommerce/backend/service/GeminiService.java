package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.util.ProductRagDocumentBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${google.gemini.api.key}")
    private String apiKey;

    @Value("${google.gemini.url}")
    private String apiUrl;

    @Autowired
    private ProductRagRetrievalService productRagRetrievalService;

    private final RestTemplate restTemplate;

    public GeminiService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(30_000);
        this.restTemplate = new RestTemplate(factory);
    }

    private String formatProductsAsContext(List<Product> products) {
        if (products.isEmpty()) {
            return "Hien tai cua hang khong co san pham phu hop.";
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

    public String getChatResponse(String userMessage) {
        String url = apiUrl + apiKey;

        List<Product> relevantProducts = productRagRetrievalService.retrieveRelevantProducts(userMessage, 5);
        String productContext = formatProductsAsContext(relevantProducts);

        String systemInstruction =
                "Ban la SnapBot, tro ly mua sam thong minh cua SnapCart. " +
                "Chi duoc tra loi dua tren DU LIEU SAN PHAM THUC TE duoc cung cap ben duoi. " +
                "Khong duoc tu them san pham khong co trong kho. " +
                "Neu co gia khuyen mai thi uu tien gia khuyen mai. " +
                "Neu cau hoi khong lien quan den mua sam, hay lich su va ngan gon. " +
                "Tra loi ngan gon, than thien, va luon dung tieng Viet.\n\n" +
                productContext;

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> part = new HashMap<>();

        part.put("text", systemInstruction + "\nKhach hang hoi: " + userMessage);
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
                            return String.valueOf(responseParts.get(0).get("text"));
                        }
                    }
                }

                return "Xin loi, minh chua xu ly duoc yeu cau nay.";
            } catch (Exception e) {
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(1500);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                } else {
                    return "Xin loi, AI dang ban. Ban vui long thu lai sau.";
                }
            }
        }

        return "Xin loi, AI dang ban. Ban vui long thu lai sau.";
    }
}
