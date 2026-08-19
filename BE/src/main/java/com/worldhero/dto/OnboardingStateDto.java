package com.worldhero.dto;

import com.worldhero.model.enums.OnboardingStep;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingStateDto {
    private OnboardingStep step;
    private int lifetimePulls;
    private boolean knightSummoned;
    private boolean rangerSummoned;
    private boolean thirdSummonCompleted;
    private boolean firstExpeditionClaimed;
    private boolean towerUnlocked;
    private int standardSummonTickets;
}
