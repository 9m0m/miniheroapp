package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.HeroDetailDto;
import com.worldhero.service.HeroProgressionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/heroes")
@RequiredArgsConstructor
@Tag(name = "Hero Progression", description = "Nâng cấp Hero Level 1-50 và Star 1-5")
public class HeroProgressionController {

    private final HeroProgressionService heroProgressionService;

    @Data
    public static class LevelUpRequest {
        private int targetLevel;
        /** Optional stable client key for idempotent level-up. If absent, no ledger entry is recorded. */
        private String operationKey;
    }

    @PostMapping("/{heroId}/level-up")
    @Operation(summary = "Nâng cấp Hero Level")
    public ResponseEntity<HeroDetailDto> levelUp(
            @PathVariable UUID heroId,
            @RequestBody LevelUpRequest request,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(heroProgressionService.levelUpHero(effectiveId, heroId, request.getTargetLevel(), request.getOperationKey()));
    }

    @Data
    public static class StarUpRequest {
        /** Optional stable client key for idempotent star-up. If absent, no ledger entry is recorded. */
        private String operationKey;
    }

    @PostMapping("/{heroId}/star-up")
    @Operation(summary = "Nâng cấp Hero Star")
    public ResponseEntity<HeroDetailDto> starUp(
            @PathVariable UUID heroId,
            @RequestBody(required = false) StarUpRequest request,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        String opKey = request != null ? request.getOperationKey() : null;
        return ResponseEntity.ok(heroProgressionService.starUpHero(effectiveId, heroId, opKey));
    }
}
