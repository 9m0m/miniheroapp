package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.BuildInspectResponseDto;
import com.worldhero.dto.TrialLeaderboardEntryDto;
import com.worldhero.dto.TrialSubmitRequestDto;
import com.worldhero.model.enums.TrialType;
import com.worldhero.service.TrialArenaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/arena")
@RequiredArgsConstructor
@Tag(name = "Trial Arena & Leaderboard", description = "Đấu trường thử nghiệm 30s DPS, Boss Speedrun và Xếp hạng")
public class TrialArenaController {

    private final TrialArenaService trialArenaService;

    @GetMapping("/leaderboard")
    @Operation(summary = "Lấy bảng xếp hạng đấu trường hàng tuần")
    public ResponseEntity<List<TrialLeaderboardEntryDto>> getLeaderboard(@RequestParam(defaultValue = "DPS_30S") TrialType trialType) {
        return ResponseEntity.ok(trialArenaService.getLeaderboard(trialType));
    }

    @PostMapping("/submit")
    @Operation(summary = "Gửi kỷ lục đấu trường (DPS / Speedrun)")
    public ResponseEntity<TrialLeaderboardEntryDto> submitTrialRecord(
            @RequestBody TrialSubmitRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(trialArenaService.submitTrialRecord(request));
    }

    @PostMapping("/privacy")
    @Operation(summary = "Bật/Tắt chế độ công khai đội hình")
    public ResponseEntity<Void> toggleBuildPrivacy(
            @RequestParam(required = false) UUID userId,
            @RequestParam boolean isPublic,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        trialArenaService.toggleBuildPrivacy(effectiveId, isPublic);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/inspect")
    @Operation(summary = "Soi đội hình và trang bị của người chơi khác (Tôn trọng thiết lập bảo mật)")
    public ResponseEntity<BuildInspectResponseDto> inspectBuild(
            @RequestParam UUID targetUserId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        boolean isAdmin = principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN"));
        return ResponseEntity.ok(trialArenaService.inspectBuild(targetUserId, isAdmin));
    }

    @GetMapping("/admin/audit")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @Operation(summary = "Thanh tra toàn bộ kỷ lục và phát hiện bất thường (Yêu cầu quyền Admin)")
    public ResponseEntity<List<TrialLeaderboardEntryDto>> getAdminAuditList() {
        return ResponseEntity.ok(trialArenaService.getAdminAuditList());
    }
}
