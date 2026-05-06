package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ── GET ALL (với filter category + search) ────────────────────────────
    public List<Product> getAll(String category, String search) {
        boolean hasCategory = category != null && !category.trim().isEmpty();
        boolean hasSearch   = search != null && !search.trim().isEmpty();

        if (hasCategory && hasSearch) {
            return productRepository.searchByKeyword(search).stream()
                    .filter(p -> p.getCategory() != null && p.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        } else if (hasSearch) {
            return productRepository.searchByKeyword(search);
        } else if (hasCategory) {
            return productRepository.findByCategory(category);
        } else {
            return productRepository.findAll();
        }
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────
    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    // ── CREATE ────────────────────────────────────────────────────────────
    public Product create(Product product) {
        product.setId(null);
        return productRepository.save(product);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────
    public Product update(Long id, Product updatedData) {
        Product existing = getById(id); 

        existing.setName(updatedData.getName());
        existing.setDescription(updatedData.getDescription());
        existing.setPrice(updatedData.getPrice());
        existing.setDiscountPrice(updatedData.getDiscountPrice());
        existing.setCategory(updatedData.getCategory());
        existing.setBrand(updatedData.getBrand());
        existing.setStockQuantity(updatedData.getStockQuantity());
        existing.setImageUrl(updatedData.getImageUrl());
        existing.setSpecifications(updatedData.getSpecifications());

        return productRepository.save(existing);
    }

    // ── DELETE ────────────────────────────────────────────────────────────
    public void delete(Long id) {
        getById(id);
        productRepository.deleteById(id);
    }
}