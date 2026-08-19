package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TowerProgressDto {
    private String seasonId;
    private int currentFloor;
    private int highestFloorCleared;
    private int bestScore;
    private int totalAttempts;
    private TowerPartyV2Dto savedPartyV2;
    private TowerAttemptResponseDto unacknowledgedAttempt;
    @Builder.Default
    private String catalogVersion = "hero-v1";
    @Builder.Default
    private String balanceVersion = "tower-v1";
}
