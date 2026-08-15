package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnhanceResponseDto {
    public enum EnhanceStatus {
        SUCCESS,
        FAILED_KEPT,
        FAILED_DOWNGRADED
    }

    private boolean success;
    private EnhanceStatus status;
    private int oldEnhanceLevel;
    private int newEnhanceLevel;
    private double successChance;
    private long goldCost;
    private int stonesCost;
    private ItemInstanceDto updatedItem;
    private HeroDetailDto updatedHero; // If item was equipped on a hero
    private long remainingGold;
    private int remainingStones;
}
