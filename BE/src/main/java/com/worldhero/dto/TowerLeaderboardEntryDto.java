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
public class TowerLeaderboardEntryDto {
    private int rank;
    private UUID userId;
    private String displayName;
    private int highestFloorCleared;
    private int bestScore;
    private int totalAttempts;
    private LocalDateTime updatedAt;
}
