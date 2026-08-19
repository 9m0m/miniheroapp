package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.GemFusionRequestDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.SmartFusionRequestDto;
import com.worldhero.dto.Transmute9RequestDto;
import com.worldhero.dto.Transmute9ResponseDto;
import com.worldhero.service.CubeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cube")
@RequiredArgsConstructor
@Tag(name = "The Magic Cube", description = "Khối hợp nhất The Cube: Ma trận 9 Món, Smart Fusion & Gem Fusion")
public class CubeController {

    private final CubeService cubeService;

    @PostMapping("/transmute-9")
    @Operation(summary = "Ma trận The Cube: Ghép 9 món cùng phẩm cấp -> 1 món phẩm cấp cao hơn với cơ chế Jackpot & Fallback")
    public ResponseEntity<Transmute9ResponseDto> transmuteCube9(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody Transmute9RequestDto request) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(cubeService.transmuteCube9(request));
    }

    @PostMapping("/fuse")
    @Operation(summary = "Smart Fusion: Ghép 3 món cùng phẩm cấp -> 1 món phẩm cấp trên")
    public ResponseEntity<ItemInstanceDto> smartFusion(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SmartFusionRequestDto request) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(cubeService.smartFusion(request));
    }

    @PostMapping("/fuse-gems")
    @Operation(summary = "Gem Fusion: Ghép 3 viên ngọc Tier N -> 1 viên ngọc Tier N+1")
    public ResponseEntity<String> gemFusion(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody GemFusionRequestDto request) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(cubeService.gemFusion(request));
    }
}
