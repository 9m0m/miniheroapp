package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.HeroDetailDto;
import com.worldhero.dto.ReviveHeroRequestDto;
import com.worldhero.dto.ReviveHeroResponseDto;
import com.worldhero.service.HeroService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/heroes")
@RequiredArgsConstructor
@Tag(name = "Heroes & Party", description = "Quản lý 4 Class Tướng, trang bị đang mặc và Live DPS thời gian thực")
public class HeroController {

    private final HeroService heroService;

    @GetMapping
    @Operation(summary = "Lấy danh sách 4 Tướng kèm trang bị đang mặc và chỉ số stats tính động")
    public ResponseEntity<List<HeroDetailDto>> getHeroes(
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(heroService.getHeroesForUser(effectiveId));
    }

    @PostMapping("/revive")
    @Operation(summary = "Hồi sinh ngay lập tức 1 Tướng bằng 10 Gems")
    public ResponseEntity<ReviveHeroResponseDto> reviveHero(
            @Valid @RequestBody ReviveHeroRequestDto request,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(heroService.reviveHero(effectiveId, request.getHeroClass()));
    }
}
