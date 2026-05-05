package com.ecommerce.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class GeminiService {

    @Value("${google.gemini.api.key}")
    private String apiKey;

    @Value("${google.gemini.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getChatResponse(String userMessage) {
        String url = apiUrl + apiKey;

        // System Instruction to make it a shopping assistant
        String systemInstruction = "Bạn là SnapBot, một trợ lý mua sắm thông minh và nhiệt tình của cửa hàng SnapCart. " +
                "Nhiệm vụ của bạn là tư vấn sản phẩm, giải đáp thắc mắc về đơn hàng và hỗ trợ khách hàng của SnapCart. " +
                "QUY TẮC QUAN TRỌNG: Chỉ trả lời các vấn đề liên quan đến mua sắm, sản phẩm, và dịch vụ của SnapCart. " +
                "Nếu khách hàng hỏi về các chủ đề khác như lập trình (coding), chính trị, toán học, hoặc bất kỳ kiến thức chung nào không liên quan đến mua sắm, " +
                "hãy lịch sự từ chối và nói rằng bạn chỉ có thể hỗ trợ các vấn đề liên quan đến cửa hàng. " +
                "Hãy trả lời ngắn gọn, chuyên nghiệp và luôn dùng tiếng Việt.";

        // Prepare request body for Gemini 1.5
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> part = new HashMap<>();
        
        part.put("text", systemInstruction + "\n\nKhách hàng: " + userMessage);
        parts.add(part);
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);

        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);

                // Extract text from Gemini response structure
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
