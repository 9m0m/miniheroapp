package com.worldhero.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("World Hero Mini-App API")
                        .version("1.0.0")
                        .description("REST API Documentation for World Hero (Idle Party RPG on World App)")
                        .contact(new Contact().name("World Hero Dev Team"))
                        .license(new License().name("Apache 2.0")));
    }
}
