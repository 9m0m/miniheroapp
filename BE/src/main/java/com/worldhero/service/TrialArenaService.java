package com.worldhero.service;

import com.worldhero.dto.BuildInspectResponseDto;
import com.worldhero.dto.TrialLeaderboardEntryDto;
import com.worldhero.dto.TrialSubmitRequestDto;
import com.worldhero.model.enums.TrialType;

import java.util.List;
import java.util.UUID;

public interface TrialArenaService {
    TrialLeaderboardEntryDto submitTrialRecord(TrialSubmitRequestDto request);
    List<TrialLeaderboardEntryDto> getLeaderboard(TrialType trialType);
    void toggleBuildPrivacy(UUID userId, boolean isPublic);
    BuildInspectResponseDto inspectBuild(UUID targetUserId, boolean isAdmin);
    List<TrialLeaderboardEntryDto> getAdminAuditList();
}
