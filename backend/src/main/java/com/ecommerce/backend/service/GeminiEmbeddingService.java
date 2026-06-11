package com.ecommerce.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeminiEmbeddingService {

    @Value("${google.gemini.api.key}")
    private String apiKey;

    @Value("${google.gemini.embedding-url}")
    private String embeddingUrl;

    @Value("${google.gemini.embedding-model}")
    private String embeddingModel;

    private final RestTemplate restTemplate;

    public GeminiEmbeddingService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(20_000);
        this.restTemplate = new RestTemplate(factory);
    }

    public List<Double> embed(String text) {
        String url = embeddingUrl + embeddingModel + ":embedContent?key=" + apiKey;

        Map<String, Object> requestBody = Map.of(
                "content", Map.of(
                        "parts", List.of(Map.of("text", text))
                )
        );

        Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);
        if (response == null || !response.containsKey("embedding")) {
            throw new RuntimeException("Embedding API không trả về embedding.");
        }

        Map<String, Object> embedding = (Map<String, Object>) response.get("embedding");
        Object valuesObj = embedding.get("values");
        if (!(valuesObj instanceof List<?> values)) {
            throw new RuntimeException("Embedding API trả về dữ liệu không hợp lệ.");
        }

        List<Double> vector = new ArrayList<>(values.size());
        for (Object value : values) {
            if (value instanceof Number number) {
                vector.add(number.doubleValue());
            }
        }

        if (vector.isEmpty()) {
            throw new RuntimeException("Embedding vector rỗng.");
        }

        return vector;
    }
}
