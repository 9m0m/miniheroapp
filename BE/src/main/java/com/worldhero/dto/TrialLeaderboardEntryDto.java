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
public class TrialLeaderboardEntryDto {
    private int rank;
    private UUID userId;
    private String username;
    private double score;
    private double dpsPeak;
    private double totalDamage;
    private double timeTakenSec;
    private boolean isBuildPublic;
    private String recordedAt;
}
