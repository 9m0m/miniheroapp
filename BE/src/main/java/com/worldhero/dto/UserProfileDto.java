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
    private long essence;
    private int gems;
    private int enhanceStones;
    private int inventorySlots;
    private int piggyBankGems;
    private boolean isGoldenPassActive;
    private int loginDayIndex;
    private LocalDateTime loginLastClaimedAt;
}
