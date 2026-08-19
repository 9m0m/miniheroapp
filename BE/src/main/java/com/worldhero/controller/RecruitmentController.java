package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.RecruitmentBannerDto;
import com.worldhero.dto.RecruitmentPullRequestDto;
import com.worldhero.dto.RecruitmentPullResponseDto;
import com.worldhero.dto.SummonHistoryDto;
import com.worldhero.service.RecruitmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruitment")
@RequiredArgsConstructor
@Tag(name = "Recruitment", description = "Hero Recruitment (Altar) & Summon Ledgers")
public class RecruitmentController {

    private final RecruitmentService recruitmentService;

    @GetMapping("/banners")
    @Operation(summary = "Get active recruitment banners")
    public ResponseEntity<List<RecruitmentBannerDto>> getBanners() {
        return ResponseEntity.ok(recruitmentService.getBanners());
    }

    @PostMapping("/pull")
    @Operation(summary = "Summon hero using standard ticket (Scripted 1-2, Protected 3rd, Duplicate = 1 Shard)")
    public ResponseEntity<RecruitmentPullResponseDto> pull(
            @RequestBody RecruitmentPullRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null || principal.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required to summon heroes.");
        }
        return ResponseEntity.ok(recruitmentService.pull(principal.getId(), request));
    }

    @GetMapping("/history")
    @Operation(summary = "Get user summon history without entity leaks")
    public ResponseEntity<List<SummonHistoryDto>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null || principal.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required to view summon history.");
        }
        return ResponseEntity.ok(recruitmentService.getHistory(principal.getId()));
    }
}
