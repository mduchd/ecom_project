package com.ecommerce.backend.config;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.Role;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(RoleRepository roleRepository, ProductRepository productRepository) {
        return args -> {
            // Init Roles
            if (roleRepository.findByName("ROLE_USER").isEmpty()) {
                roleRepository.save(new Role(null, "ROLE_USER"));
            }
            if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
                roleRepository.save(new Role(null, "ROLE_ADMIN"));
            }

            // Init Products (chỉ seed nếu DB chưa có sản phẩm)
            if (productRepository.count() == 0) {
                productRepository.saveAll(List.of(
                    new Product(null,
                        "Laptop ASUS ROG Strix G16 Gaming",
                        "Laptop gaming cao cấp với hiệu năng đỉnh cao, màn hình 165Hz, thích hợp cho game thủ chuyên nghiệp.",
                        new BigDecimal("32990000"),
                        new BigDecimal("29990000"),
                        "Laptop", "ASUS", 15,
                        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400",
                        "CPU: Intel Core i9-14900H | RAM: 16GB DDR5 | SSD: 1TB NVMe | GPU: RTX 4070 | Màn hình: 16 inch FHD 165Hz"),

                    new Product(null,
                        "Laptop Dell XPS 15 9530",
                        "Laptop văn phòng cao cấp với thiết kế mỏng nhẹ, màn hình OLED sắc nét, pin trâu bò.",
                        new BigDecimal("45990000"),
                        new BigDecimal("42000000"),
                        "Laptop", "Dell", 8,
                        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
                        "CPU: Intel Core i7-13700H | RAM: 32GB DDR5 | SSD: 512GB NVMe | GPU: RTX 4060 | Màn hình: 15.6 inch OLED 3.5K"),

                    new Product(null,
                        "iPhone 16 Pro Max 256GB",
                        "Flagship smartphone của Apple với camera ProRes 4K, chip A18 Pro mạnh mẽ nhất, thiết kế titanium cao cấp.",
                        new BigDecimal("34990000"),
                        null,
                        "Điện thoại", "Apple", 25,
                        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400",
                        "Chip: A18 Pro | RAM: 8GB | Bộ nhớ: 256GB | Camera: 48MP ProRes | Pin: 4685mAh | Màn hình: 6.9 inch Super Retina XDR"),

                    new Product(null,
                        "Samsung Galaxy S25 Ultra 512GB",
                        "Android flagship cao cấp với bút S Pen tích hợp, camera 200MP, màn hình Dynamic AMOLED 6.8 inch.",
                        new BigDecimal("31990000"),
                        new BigDecimal("28990000"),
                        "Điện thoại", "Samsung", 20,
                        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
                        "Chip: Snapdragon 8 Elite | RAM: 12GB | Bộ nhớ: 512GB | Camera: 200MP | Pin: 5000mAh | Màn hình: 6.8 inch AMOLED 120Hz"),

                    new Product(null,
                        "Tai nghe Sony WH-1000XM6 Chống ồn",
                        "Tai nghe over-ear không dây hàng đầu thị trường với công nghệ chống ồn ANC thế hệ mới, âm thanh Hi-Res.",
                        new BigDecimal("8990000"),
                        new BigDecimal("7490000"),
                        "Âm thanh", "Sony", 30,
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
                        "Kết nối: Bluetooth 5.3 | Pin: 40 giờ | Chống ồn: ANC thế hệ 4 | Codec: LDAC, AAC | Trọng lượng: 250g"),

                    new Product(null,
                        "Chuột Gaming Logitech G Pro X Superlight 2",
                        "Chuột gaming nhẹ nhất thế giới với sensor HERO 2 25K, thiết kế không dây siêu bền.",
                        new BigDecimal("2990000"),
                        new BigDecimal("2490000"),
                        "Phụ kiện Gaming", "Logitech", 50,
                        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
                        "Sensor: HERO 2 25K DPI | Trọng lượng: 60g | Kết nối: LIGHTSPEED Wireless | Pin: 95 giờ | Nút: 5 nút"),

                    new Product(null,
                        "iPad Pro M4 13 inch WiFi 256GB",
                        "Máy tính bảng mạnh mẽ nhất của Apple với chip M4, màn hình Ultra Retina XDR, hỗ trợ Apple Pencil Pro.",
                        new BigDecimal("28990000"),
                        null,
                        "Máy tính bảng", "Apple", 12,
                        "https://images.unsplash.com/photo-1589739900266-43b2843f4c12?w=400",
                        "Chip: Apple M4 | RAM: 8GB | Bộ nhớ: 256GB | Màn hình: 13 inch Ultra Retina XDR OLED | Camera: 12MP | Pin: 10 giờ"),

                    new Product(null,
                        "Bàn phím cơ Keychron Q3 Pro",
                        "Bàn phím cơ TKL không dây cao cấp với switch Gateron G Pro, vỏ nhôm CNC, hỗ trợ hotswap.",
                        new BigDecimal("3490000"),
                        new BigDecimal("2990000"),
                        "Phụ kiện", "Keychron", 35,
                        "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400",
                        "Layout: TKL 80% | Switch: Gateron G Pro Red/Brown/Blue | Kết nối: Bluetooth 5.1 / USB-C | Hotswap: Có | Backlight: RGB")
                ));
                System.out.println("✅ Seeded " + productRepository.count() + " sample products for RAG.");
            }
        };
    }
}
