package com.worldhero.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "Kiểm tra tình trạng hoạt động của Backend API")
public class HealthController {

    @GetMapping
    @Operation(summary = "Kiểm tra kết nối máy chủ")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "World Hero Backend Engine",
                "version", "1.0.0",
                "timestamp", Instant.now().toString()
        ));
    }
}
