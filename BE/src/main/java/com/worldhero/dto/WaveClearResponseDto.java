package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaveClearResponseDto {
    private long goldEarned;
    private int enhanceStonesEarned;
    private int piggyBankGemsAdded;
    private int totalPiggyBankGems;
    private boolean droppedChest;
    private ItemInstanceDto droppedItem;
    
    private int currentWorld;
    private int currentStage;
    private int currentWave;
    private long totalGold;
    private int totalGems;
    private int totalStones;
}
