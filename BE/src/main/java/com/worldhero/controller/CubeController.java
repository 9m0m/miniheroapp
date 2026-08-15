package com.worldhero.controller;

import com.worldhero.dto.GemFusionRequestDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.SmartFusionRequestDto;
import com.worldhero.service.CubeService;
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
@RequestMapping("/api/v1/cube")
@RequiredArgsConstructor
@Tag(name = "The Magic Cube", description = "Khối hợp nhất The Cube: Smart Fusion (Ghép 3 Đồ) & Gem Fusion (Ghép Ngọc)")
public class CubeController {

    private final CubeService cubeService;

    @PostMapping("/fuse")
    @Operation(summary = "Smart Fusion: Ghép 3 món cùng phẩm cấp -> 1 món phẩm cấp trên")
    public ResponseEntity<ItemInstanceDto> smartFusion(@Valid @RequestBody SmartFusionRequestDto request) {
        return ResponseEntity.ok(cubeService.smartFusion(request));
    }

    @PostMapping("/fuse-gems")
    @Operation(summary = "Gem Fusion: Ghép 3 viên ngọc Tier N -> 1 viên ngọc Tier N+1")
    public ResponseEntity<String> gemFusion(@Valid @RequestBody GemFusionRequestDto request) {
        return ResponseEntity.ok(cubeService.gemFusion(request));
    }
}
