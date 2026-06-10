package com.ecommerce.backend.config;

import com.ecommerce.backend.service.ProductRagExportService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RagExportInitializer {

    @Value("${app.rag.export-on-startup:false}")
    private boolean exportOnStartup;

    @Bean
    CommandLineRunner exportRagDocsOnStartup(ProductRagExportService productRagExportService) {
        return args -> {
            if (!exportOnStartup) {
                return;
            }

            if (productRagExportService.countExportableProducts() == 0) {
                System.out.println("Skip RAG export: no products available.");
                return;
            }

            var exportedPath = productRagExportService.exportToDefaultPath();
            System.out.println("Exported RAG product docs to: " + exportedPath);
        };
    }
}
