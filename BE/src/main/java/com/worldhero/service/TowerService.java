package com.worldhero.service;

import com.worldhero.dto.*;

import java.util.List;
import java.util.UUID;

public interface TowerService {
    String CURRENT_SEASON_ID = "season-1";

    TowerProgressDto getProgress(UUID userId);

    TowerPartyV2Dto savePartyV2(UUID userId, TowerPartyV2Dto partyDto);

    TowerPartyV2Dto getPartyV2(UUID userId);

    TowerAttemptResponseDto createAttempt(UUID userId, TowerAttemptRequestDto request);

    TowerAttemptResponseDto getAttempt(UUID userId, UUID attemptId);

    TowerAttemptResponseDto acknowledgeAttempt(UUID userId, UUID attemptId);

    List<TowerLeaderboardEntryDto> getLeaderboard(String seasonId);
}
