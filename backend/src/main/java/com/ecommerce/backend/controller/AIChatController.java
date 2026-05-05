package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AIChatRequest;
import com.ecommerce.backend.dto.AIChatResponse;
import com.ecommerce.backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*") // Cho phép Frontend gọi API
public class AIChatController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/chat")
    public AIChatResponse chat(@RequestBody AIChatRequest request) {
        String reply = geminiService.getChatResponse(request.getMessage());
        return new AIChatResponse(reply);
    }
}
