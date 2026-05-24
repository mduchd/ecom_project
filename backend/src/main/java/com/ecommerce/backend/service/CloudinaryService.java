package com.ecommerce.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.Set;

@Service
public class CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "webp", "gif"
    );

    @Autowired(required = false)
    private Cloudinary cloudinary;

    @Value("${app.upload.max-file-size:5242880}")
    private long maxFileSizeBytes;

    private static final List<String> MOCK_IMAGE_URLS = List.of(
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
            "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600",
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600",
            "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600"
    );

    private final Random random = new Random();

    public String uploadFile(MultipartFile file) throws IOException {
        validateFile(file);

        if (cloudinary == null) {
            String mockUrl = MOCK_IMAGE_URLS.get(random.nextInt(MOCK_IMAGE_URLS.size()));
            logger.warn("Cloudinary is not configured. Simulating upload for file: '{}'. Returning mock URL: {}",
                    file.getOriginalFilename(), mockUrl);
            return mockUrl;
        }

        try {
            logger.info("Uploading file '{}' (size: {} bytes) to Cloudinary...", file.getOriginalFilename(), file.getSize());
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "image",
                    "folder", "snapcart_products"
            ));

            String secureUrl = (String) uploadResult.get("secure_url");
            logger.info("File uploaded successfully. Secure URL: {}", secureUrl);
            return secureUrl;
        } catch (Exception e) {
            logger.error("Failed to upload file to Cloudinary: {}", e.getMessage(), e);
            throw new IOException(mapCloudinaryError(e), e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Tệp không được để trống.");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException(String.format(
                    Locale.US,
                    "Ảnh vượt quá giới hạn %d MB (file hiện tại: %.1f MB). Vui lòng chọn ảnh nhẹ hơn.",
                    maxFileSizeBytes / (1024 * 1024),
                    file.getSize() / (1024.0 * 1024.0)
            ));
        }

        String contentType = file.getContentType();
        String extension = getFileExtension(file.getOriginalFilename());

        boolean validContentType = contentType != null
                && ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT));
        boolean validExtension = extension != null && ALLOWED_EXTENSIONS.contains(extension);

        if (validContentType && validExtension) {
            return;
        }

        throw new IllegalArgumentException(
                "Định dạng không hợp lệ. Chỉ chấp nhận JPG, PNG, WebP hoặc GIF."
        );
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return null;
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    private String mapCloudinaryError(Exception e) {
        String raw = e.getMessage() != null ? e.getMessage().toLowerCase(Locale.ROOT) : "";

        if (raw.contains("file size too large") || raw.contains("too large")) {
            return "Ảnh quá lớn. Giới hạn tối đa là 5 MB.";
        }
        if (raw.contains("invalid image") || raw.contains("not an image") || raw.contains("unsupported")) {
            return "File không phải ảnh hợp lệ. Chỉ chấp nhận JPG, PNG, WebP hoặc GIF.";
        }
        if (raw.contains("timeout") || raw.contains("timed out")) {
            return "Tải ảnh lên quá lâu. Vui lòng thử lại với ảnh nhỏ hơn hoặc kết nối ổn định hơn.";
        }
        if (raw.contains("unauthorized") || raw.contains("invalid api key")) {
            return "Cấu hình Cloudinary không hợp lệ. Liên hệ quản trị viên.";
        }

        return "Không tải lên được ảnh. Vui lòng thử lại.";
    }
}
