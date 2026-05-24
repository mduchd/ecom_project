package com.ecommerce.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    // Inject Cloudinary bean (could be null if configuration is missing)
    @Autowired(required = false)
    private Cloudinary cloudinary;

    // List of premium placeholder image URLs to return if Cloudinary is not configured
    private static final List<String> MOCK_IMAGE_URLS = List.of(
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600", // Smart watch
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", // Headphones
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", // Shoes
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600", // Sunglasses
            "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600", // Sneaker
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600", // Mouse
            "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600"  // Laptop
    );

    private final Random random = new Random();

    /**
     * Upload a file to Cloudinary.
     * If Cloudinary is not configured, returns a mock image URL for simulation.
     *
     * @param file the MultipartFile to upload
     * @return the secure URL of the uploaded image (or a mock URL)
     * @throws IOException if network or I/O error occurs
     */
    public String uploadFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Tệp không được để trống");
        }

        if (cloudinary == null) {
            String mockUrl = MOCK_IMAGE_URLS.get(random.nextInt(MOCK_IMAGE_URLS.size()));
            logger.warn("Cloudinary is not configured. Simulating upload for file: '{}'. Returning mock URL: {}", 
                    file.getOriginalFilename(), mockUrl);
            return mockUrl;
        }

        try {
            logger.info("Uploading file '{}' (size: {} bytes) to Cloudinary...", file.getOriginalFilename(), file.getSize());
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", "snapcart_products"
            ));
            
            String secureUrl = (String) uploadResult.get("secure_url");
            logger.info("File uploaded successfully. Secure URL: {}", secureUrl);
            return secureUrl;
        } catch (Exception e) {
            logger.error("Failed to upload file to Cloudinary: {}", e.getMessage(), e);
            throw new IOException("Failed to upload file to Cloudinary: " + e.getMessage(), e);
        }
    }
}
