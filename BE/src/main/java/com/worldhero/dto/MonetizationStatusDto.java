package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonetizationStatusDto {
    private int piggyBankGems;
    private boolean isPiggyBankFull; // >= 1000
    private boolean isGoldenPassActive;
    private int loginDayIndex;
    private LocalDateTime loginLastClaimedAt;
    private boolean canClaimToday;
    private boolean growthFundUnlocked;
    private List<Integer> claimedGrowthFundStages;
    private int maxClearedStage;
}
