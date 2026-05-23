package com.ecommerce.backend.controller;

import com.ecommerce.backend.service.SepayWebhookService;
import com.ecommerce.backend.service.SepayWebhookService.SepayWebhookResult;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/sepay")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SepayWebhookController {

    private final SepayWebhookService sepayWebhookService;

    public SepayWebhookController(SepayWebhookService sepayWebhookService) {
        this.sepayWebhookService = sepayWebhookService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<SepayWebhookResult> handleWebhook(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestBody(required = false) JsonNode payload
    ) {
        SepayWebhookResult result = sepayWebhookService.handle(authorization, apiKey, payload);
        if (result.unauthorized()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
        return ResponseEntity.ok(result);
    }
}
