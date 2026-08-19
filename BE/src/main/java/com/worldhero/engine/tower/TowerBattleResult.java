package com.worldhero.engine.tower;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TowerBattleResult {
    private TowerSide winner;
    private int roundsUsed;
    private double remainingPlayerHpPercent;
    private int calculatedScore;
    
    @Builder.Default
    private List<TowerReplayEvent> replayEvents = new ArrayList<>();
    
    @Builder.Default
    private List<TowerEntity> initialCombatants = new ArrayList<>();

    @Builder.Default
    private List<TowerEntity> finalCombatants = new ArrayList<>();
}
