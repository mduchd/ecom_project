package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, ProductRepositoryCustom {

    // Tìm theo category
    List<Product> findByCategory(String category);

    // Tìm theo brand
    List<Product> findByBrand(String brand);

    // Tìm sản phẩm còn hàng
    List<Product> findByStockQuantityGreaterThan(Integer quantity);

    List<Product> findByStockQuantityGreaterThan(Integer quantity, Pageable pageable);

    // Tìm kiếm full-text theo tên hoặc mô tả hoặc thông số kỹ thuật (cho RAG)
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.specifications) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByKeyword(@Param("keyword") String keyword);

    @Query("""
            SELECT p FROM Product p
            WHERE (:category IS NULL OR :category = '' OR LOWER(p.category) = LOWER(:category))
            AND (:search IS NULL OR :search = '' OR
                 LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                 LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%')) OR
                 LOWER(COALESCE(p.brand, '')) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Product> findAdminProducts(@Param("category") String category, @Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity > 0")
    long countInStockProducts();

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL ORDER BY p.category")
    List<String> findDistinctCategories();
}
