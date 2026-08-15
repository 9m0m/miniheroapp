package com.worldhero.dto;

import com.worldhero.model.enums.TrialType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialSubmitRequestDto {
    private UUID userId;
    private TrialType trialType;
    private double dpsPeak;
    private double totalDamage;
    private double timeTakenSec;
    private String heroesSnapshotJson;
}
