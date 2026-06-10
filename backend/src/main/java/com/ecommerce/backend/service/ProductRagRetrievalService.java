package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.util.ProductRagDocumentBuilder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;

@Service
public class ProductRagRetrievalService {

    private final ProductRepository productRepository;
    private final GeminiEmbeddingService embeddingService;

    private final Object lock = new Object();
    private volatile List<IndexedProduct> cachedIndex = List.of();
    private volatile String cachedFingerprint = "";
    private volatile boolean lastRefreshFailed = false;

    public ProductRagRetrievalService(ProductRepository productRepository, GeminiEmbeddingService embeddingService) {
        this.productRepository = productRepository;
        this.embeddingService = embeddingService;
    }

    public List<Product> retrieveRelevantProducts(String query, int topK) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        try {
            ensureIndex();
            if (cachedIndex.isEmpty()) {
                return List.of();
            }

            List<Double> queryVector = embeddingService.embed("query: " + query.trim());
            return cachedIndex.stream()
                    .map(indexed -> new ScoredProduct(indexed.product, cosineSimilarity(queryVector, indexed.embedding)))
                    .sorted(Comparator.comparingDouble(ScoredProduct::score).reversed())
                    .filter(scored -> scored.product().getStockQuantity() != null && scored.product().getStockQuantity() > 0)
                    .limit(Math.max(1, topK))
                    .map(ScoredProduct::product)
                    .toList();
        } catch (Exception e) {
            lastRefreshFailed = true;
            return fallbackKeywordSearch(query, topK);
        }
    }

    public boolean isIndexReady() {
        return !cachedIndex.isEmpty() && !lastRefreshFailed;
    }

    public void refreshIndex() {
        synchronized (lock) {
            List<Product> products = productRepository.findAll().stream()
                    .sorted(Comparator.comparing(Product::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                    .toList();

            String fingerprint = fingerprint(products);
            if (Objects.equals(fingerprint, cachedFingerprint) && !cachedIndex.isEmpty()) {
                return;
            }

            List<IndexedProduct> rebuilt = new ArrayList<>(products.size());
            for (Product product : products) {
                String doc = ProductRagDocumentBuilder.build(product);
                List<Double> embedding = embeddingService.embed("passage: " + doc);
                rebuilt.add(new IndexedProduct(product, doc, embedding));
            }

            cachedIndex = List.copyOf(rebuilt);
            cachedFingerprint = fingerprint;
            lastRefreshFailed = false;
        }
    }

    private void ensureIndex() {
        if (cachedIndex.isEmpty() || lastRefreshFailed) {
            refreshIndex();
        } else {
            List<Product> products = productRepository.findAll().stream()
                    .sorted(Comparator.comparing(Product::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                    .toList();
            String fingerprint = fingerprint(products);
            if (!Objects.equals(fingerprint, cachedFingerprint)) {
                refreshIndex();
            }
        }
    }

    private List<Product> fallbackKeywordSearch(String query, int topK) {
        String[] tokens = query.toLowerCase().split("\\s+");
        List<Product> products = productRepository.findByStockQuantityGreaterThan(0);
        return products.stream()
                .filter(product -> matchesAnyToken(product, tokens))
                .limit(Math.max(1, topK))
                .toList();
    }

    private boolean matchesAnyToken(Product product, String[] tokens) {
        String haystack = ProductRagDocumentBuilder.build(product).toLowerCase();
        for (String token : tokens) {
            if (token.length() > 2 && haystack.contains(token)) {
                return true;
            }
        }
        return false;
    }

    private double cosineSimilarity(List<Double> a, List<Double> b) {
        int size = Math.min(a.size(), b.size());
        if (size == 0) {
            return 0.0;
        }

        double dot = 0.0;
        double magA = 0.0;
        double magB = 0.0;
        for (int i = 0; i < size; i++) {
            double x = a.get(i);
            double y = b.get(i);
            dot += x * y;
            magA += x * x;
            magB += y * y;
        }

        if (magA == 0.0 || magB == 0.0) {
            return 0.0;
        }
        return dot / (Math.sqrt(magA) * Math.sqrt(magB));
    }

    private String fingerprint(List<Product> products) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            for (Product product : products) {
                String doc = ProductRagDocumentBuilder.build(product);
                digest.update(doc.getBytes(StandardCharsets.UTF_8));
                digest.update((byte) '\n');
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (Exception e) {
            throw new RuntimeException("Khong tao duoc fingerprint cho product index.", e);
        }
    }

    private record IndexedProduct(Product product, String document, List<Double> embedding) {
    }

    private record ScoredProduct(Product product, double score) {
    }
}
