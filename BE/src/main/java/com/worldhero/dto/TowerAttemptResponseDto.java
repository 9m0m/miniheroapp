package com.worldhero.dto;

import com.worldhero.engine.tower.TowerEntity;
import com.worldhero.engine.tower.TowerReplayEvent;
import com.worldhero.engine.tower.TowerSide;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TowerAttemptResponseDto {
    private UUID attemptId;
    private int floorNumber;
    private TowerSide winner;
    private int roundsUsed;
    private double remainingHpPercent;
    private int score;
    private boolean isFirstClear;
    private TowerFloorDto.RewardPreviewDto rewardsGranted;
    private List<TowerEntity> combatants;
    private List<TowerReplayEvent> replayEvents;
    private String catalogVersion;
    private String balanceVersion;
    private boolean isAcknowledged;
    private LocalDateTime createdAt;
}
