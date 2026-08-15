package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private UUID id;
    private String worldIdHash;
    private String displayName;
    private long gold;
    private int gems;
    private int enhanceStones;
    private int currentWorld;
    private int currentStage;
    private int currentWave;
    private int maxClearedStage;
    private int piggyBankGems;
    private boolean isGoldenPassActive;
    private int loginDayIndex;
    private LocalDateTime loginLastClaimedAt;
    private boolean growthFundUnlocked;
    private String growthFundClaimedStages;
}
