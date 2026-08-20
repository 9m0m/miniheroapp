package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.*;
import com.worldhero.engine.tower.TowerReplayEvent;
import com.worldhero.model.entity.TowerProgressEntity;
import com.worldhero.service.TowerFloorConfigService;
import com.worldhero.service.TowerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tower")
@RequiredArgsConstructor
@Tag(name = "Progress Tower", description = "Authoritative 3v3 Progress Tower, 30 Floors, Replays, và Leaderboards")
public class TowerController {

    private final TowerService towerService;
    private final TowerFloorConfigService floorConfigService;

    @GetMapping("/seasons/current")
    @Operation(summary = "Lấy thông tin Season hiện tại của Progress Tower")
    public ResponseEntity<Map<String, Object>> getCurrentSeason(@RequestParam(defaultValue = "PROGRESS") String mode) {
        return ResponseEntity.ok(Map.of(
                "seasonId", TowerService.CURRENT_SEASON_ID,
                "mode", mode,
                "name", "Season 1 — Vanguard Ascension",
                "totalFloors", TowerFloorConfigService.TOTAL_FLOORS,
                "status", "ACTIVE",
                "catalogVersion", "hero-v1",
                "balanceVersion", "tower-v1"
        ));
    }

    @GetMapping("/seasons/{seasonId}/floors")
    @Operation(summary = "Lấy danh sách 30 Floor configs")
    public ResponseEntity<List<TowerFloorDto>> getFloors(@PathVariable String seasonId) {
        return ResponseEntity.ok(floorConfigService.getAllFloors());
    }

    @GetMapping("/floors/{floorNumber}")
    @Operation(summary = "Lấy chi tiết cấu hình 1 Floor")
    public ResponseEntity<TowerFloorDto> getFloor(@PathVariable int floorNumber) {
        return floorConfigService.getFloorByNumber(floorNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/progress/me")
    @Operation(summary = "Lấy tiến độ Tower và đội hình đã lưu của user")
    public ResponseEntity<TowerProgressDto> getMyProgress(
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(towerService.getProgress(effectiveId));
    }

    @GetMapping("/party/v2")
    @Operation(summary = "Lấy đội hình 3x3 Grid và chiến thuật đã lưu")
    public ResponseEntity<TowerPartyV2Dto> getPartyV2(
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(towerService.getPartyV2(effectiveId));
    }

    @PostMapping("/party/v2")
    @Operation(summary = "Lưu đội hình 3x3 Grid, Tactic, Hero Policies, và Energy Priority")
    public ResponseEntity<TowerPartyV2Dto> savePartyV2(
            @jakarta.validation.Valid @RequestBody TowerPartyV2Dto request,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(towerService.savePartyV2(effectiveId, request));
    }

    @PostMapping("/attempts")
    @Operation(summary = "Khởi chạy lượt đánh Tower (Backend authoritative combat resolution)")
    public ResponseEntity<TowerAttemptResponseDto> createAttempt(
            @jakarta.validation.Valid @RequestBody TowerAttemptRequestDto request,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(towerService.createAttempt(effectiveId, request));
    }

    @GetMapping("/attempts/{attemptId}")
    @Operation(summary = "Lấy kết quả attempt theo ID")
    public ResponseEntity<TowerAttemptResponseDto> getAttempt(
            @PathVariable UUID attemptId,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(towerService.getAttempt(effectiveId, attemptId));
    }

    @GetMapping("/attempts/{attemptId}/replay")
    @Operation(summary = "Lấy danh sách Replay Events của attempt")
    public ResponseEntity<List<TowerReplayEvent>> getAttemptReplay(
            @PathVariable UUID attemptId,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        TowerAttemptResponseDto attempt = towerService.getAttempt(effectiveId, attemptId);
        return ResponseEntity.ok(attempt.getReplayEvents());
    }

    @PostMapping("/attempts/{attemptId}/acknowledge")
    @Operation(summary = "Đánh dấu UI đã trình chiếu xong Replay (Không cấp lại reward)")
    public ResponseEntity<TowerAttemptResponseDto> acknowledgeAttempt(
            @PathVariable UUID attemptId,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(towerService.acknowledgeAttempt(effectiveId, attemptId));
    }

    @GetMapping("/seasons/{seasonId}/leaderboard")
    @Operation(summary = "Lấy Bảng xếp hạng Top 50 người chơi")
    public ResponseEntity<List<TowerLeaderboardEntryDto>> getLeaderboard(@PathVariable String seasonId) {
        return ResponseEntity.ok(towerService.getLeaderboard(seasonId));
    }
}
