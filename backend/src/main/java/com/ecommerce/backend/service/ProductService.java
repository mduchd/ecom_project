package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.AdminProductStatsResponse;
import com.ecommerce.backend.dto.PagedResponse;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.util.PageFetch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
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

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "name", "price", "discountPrice", "category", "brand", "stockQuantity", "id"
    );

    public PagedResponse<Product> getAdminPage(int page, int size, String search, String category, String sortField, String sortDir) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(1, Math.min(size, 100));
        String normalizedSearch = search == null ? "" : search.trim();
        String normalizedCategory = category == null || category.isBlank() || "All".equalsIgnoreCase(category)
                ? null
                : category.trim();

        Sort sort = buildAdminSort(sortField, sortDir);
        Pageable pageable = PageRequest.of(safePage - 1, safeSize, sort);
        String searchParam = normalizedSearch.isEmpty() ? null : normalizedSearch;
        Page<Product> result = productRepository.findAdminProducts(normalizedCategory, searchParam, pageable);
        result = PageFetch.clampRequestedPage(
                result,
                safePage,
                nextPageable -> productRepository.findAdminProducts(normalizedCategory, searchParam, nextPageable)
        );
        return PagedResponse.from(result, safePage);
    }

    public AdminProductStatsResponse getAdminStats() {
        long total = productRepository.count();
        long inStock = productRepository.countInStockProducts();
        List<String> categories = productRepository.findDistinctCategories();
        return new AdminProductStatsResponse(
                total,
                inStock,
                Math.max(0, total - inStock),
                categories.size(),
                categories
        );
    }

    private Sort buildAdminSort(String sortField, String sortDir) {
        String field = sortField != null && ALLOWED_SORT_FIELDS.contains(sortField) ? sortField : "id";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, field);
    }
}