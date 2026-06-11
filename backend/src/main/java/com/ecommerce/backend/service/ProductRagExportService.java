package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.util.ProductRagDocumentBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductRagExportService {

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.rag.export-path:../docs/products.jsonl}")
    private String exportPath;

    public ProductRagExportService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Path exportToDefaultPath() {
        return exportToPath(Paths.get(exportPath));
    }

    public Path exportToPath(Path outputPath) {
        List<Product> products = productRepository.findAll().stream()
                .sorted(Comparator.comparing(Product::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        Path normalizedPath = outputPath.toAbsolutePath().normalize();
        try {
            Path parent = normalizedPath.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }

            try (BufferedWriter writer = Files.newBufferedWriter(normalizedPath, StandardCharsets.UTF_8)) {
                for (Product product : products) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", product.getId());
                    row.put("name", product.getName());
                    row.put("category", product.getCategory());
                    row.put("brand", product.getBrand());
                    row.put("price", product.getPrice());
                    row.put("discountPrice", product.getDiscountPrice());
                    row.put("stockQuantity", product.getStockQuantity());
                    row.put("document", ProductRagDocumentBuilder.build(product));
                    writer.write(objectMapper.writeValueAsString(row));
                    writer.newLine();
                }
            }

            return normalizedPath;
        } catch (IOException e) {
            throw new RuntimeException("Không thể xuất product docs ra file: " + normalizedPath, e);
        }
    }

    public long countExportableProducts() {
        return productRepository.count();
    }
}
