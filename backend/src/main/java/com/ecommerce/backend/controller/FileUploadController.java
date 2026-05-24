package com.ecommerce.backend.controller;

import com.ecommerce.backend.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    public FileUploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String url = cloudinaryService.uploadFile(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(errorBody(e.getMessage()));
        } catch (IOException e) {
            String message = e.getMessage() != null ? e.getMessage() : "Không tải lên được ảnh. Vui lòng thử lại.";
            return ResponseEntity.internalServerError().body(errorBody(message));
        }
    }

    private Map<String, String> errorBody(String message) {
        return Map.of("message", message, "error", message);
    }
}
