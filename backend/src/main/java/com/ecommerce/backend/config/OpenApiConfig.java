package com.ecommerce.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI snapcartOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Snapcart E-commerce API")
                        .version("v1")
                        .description("API documentation for authentication, products, orders, and customer profiles."));
    }
}
