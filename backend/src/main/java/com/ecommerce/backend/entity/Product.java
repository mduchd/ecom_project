package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private BigDecimal discountPrice;

    private String category;

    private String brand;

    private Integer stockQuantity;

    private String imageUrl;

    // Thông số kỹ thuật dạng text, ví dụ: "RAM: 16GB | CPU: Intel i7 | SSD: 512GB"
    @Column(columnDefinition = "TEXT")
    private String specifications;
}
