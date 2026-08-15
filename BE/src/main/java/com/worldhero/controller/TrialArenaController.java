package com.worldhero.controller;

import com.worldhero.dto.BuildInspectResponseDto;
import com.worldhero.dto.TrialLeaderboardEntryDto;
import com.worldhero.dto.TrialSubmitRequestDto;
import com.worldhero.model.enums.TrialType;
import com.worldhero.service.TrialArenaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/arena")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrialArenaController {

    private final TrialArenaService trialArenaService;

    @GetMapping("/leaderboard")
    public ResponseEntity<List<TrialLeaderboardEntryDto>> getLeaderboard(@RequestParam(defaultValue = "DPS_30S") TrialType trialType) {
        return ResponseEntity.ok(trialArenaService.getLeaderboard(trialType));
    }

    @PostMapping("/submit")
    public ResponseEntity<TrialLeaderboardEntryDto> submitTrialRecord(@RequestBody TrialSubmitRequestDto request) {
        return ResponseEntity.ok(trialArenaService.submitTrialRecord(request));
    }

    @PostMapping("/privacy")
    public ResponseEntity<Void> toggleBuildPrivacy(@RequestParam UUID userId, @RequestParam boolean isPublic) {
        trialArenaService.toggleBuildPrivacy(userId, isPublic);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/inspect")
    public ResponseEntity<BuildInspectResponseDto> inspectBuild(
            @RequestParam UUID targetUserId,
            @RequestParam(defaultValue = "false") boolean isAdmin
    ) {
        return ResponseEntity.ok(trialArenaService.inspectBuild(targetUserId, isAdmin));
    }

    @GetMapping("/admin/audit")
    public ResponseEntity<List<TrialLeaderboardEntryDto>> getAdminAuditList() {
        return ResponseEntity.ok(trialArenaService.getAdminAuditList());
    }
}
