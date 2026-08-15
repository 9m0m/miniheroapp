package com.worldhero.controller;

import com.worldhero.dto.EnhanceRequestDto;
import com.worldhero.dto.EnhanceResponseDto;
import com.worldhero.service.EnhanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/upgrade")
@RequiredArgsConstructor
@Tag(name = "Item Enhancement", description = "Hệ thống cường hóa trang bị từ +0 đến +15 kèm cơ chế bảo hiểm Lucky Forge")
public class EnhanceController {

    private final EnhanceService enhanceService;

    @PostMapping("/enhance")
    @Operation(summary = "Cường hóa trang bị (+1 -> +15) tiêu Gold + Đá, hỗ trợ Bùa Bảo Hiểm WLD")
    public ResponseEntity<EnhanceResponseDto> enhanceItem(@Valid @RequestBody EnhanceRequestDto request) {
        return ResponseEntity.ok(enhanceService.enhanceItem(request));
    }
}
