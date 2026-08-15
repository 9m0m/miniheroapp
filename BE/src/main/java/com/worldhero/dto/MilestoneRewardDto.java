package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneRewardDto {
    private int milestoneIndex; // 1 to 6
    private int pointsRequired; // e.g. 20, 40, 60, 80, 100, 120
    private long goldReward;
    private int gemsReward;
    private int stonesReward;
    private String itemRewardName;
    private String icon;
    private boolean isClaimed;
    private boolean canClaim;
}
