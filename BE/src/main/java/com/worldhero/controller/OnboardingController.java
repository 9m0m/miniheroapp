package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.OnboardingAdvanceRequestDto;
import com.worldhero.dto.OnboardingStateDto;
import com.worldhero.service.OnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/onboarding")
@RequiredArgsConstructor
@Tag(name = "Onboarding", description = "Server-authoritative Onboarding & Tutorial State Machine")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @GetMapping("/state")
    @Operation(summary = "Lấy trạng thái Onboarding / Tutorial hiện tại")
    public ResponseEntity<OnboardingStateDto> getState(
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(onboardingService.getOnboardingState(effectiveId));
    }

    @PostMapping("/advance")
    @Operation(summary = "Chuyển bước Onboarding / Tutorial (Idempotent)")
    public ResponseEntity<OnboardingStateDto> advance(
            @RequestBody OnboardingAdvanceRequestDto request,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(onboardingService.advanceOnboarding(effectiveId, request));
    }
}
