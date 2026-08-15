package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DropTableConfigDto {
    private UUID id;
    private int worldIndex;
    private int stageIndex;
    private double chestDropChance;
    private double bossChestDropChance;
    private double stoneDropChance;
    private double goldMultiplier;

    // Normal Chest Rarity Weights
    private double normalCommonWeight;
    private double normalUncommonWeight;
    private double normalRareWeight;
    private double normalEpicWeight;
    private double normalLegendaryWeight;

    // Boss Chest Rarity Weights
    private double bossCommonWeight;
    private double bossUncommonWeight;
    private double bossRareWeight;
    private double bossEpicWeight;
    private double bossLegendaryWeight;
}
