package com.worldhero.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpeditionConfigDto {
    @Builder.Default
    private int totalSlots = 3;
    @Builder.Default
    private int unlockedSlots = 1;
    @Builder.Default
    private int tutorialDurationSeconds = 10;
    @Builder.Default
    private int normalDurationSeconds = 28800; // 8 hours
    @Builder.Default
    private boolean paidSlotsEnabled = false;
}
