package com.ecommerce.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException e) {
        return ResponseEntity.badRequest().body(Map.of(
                "message", "Ảnh vượt quá giới hạn 5 MB. Vui lòng chọn file nhẹ hơn.",
                "error", "Ảnh vượt quá giới hạn 5 MB. Vui lòng chọn file nhẹ hơn."
        ));
    }
}
