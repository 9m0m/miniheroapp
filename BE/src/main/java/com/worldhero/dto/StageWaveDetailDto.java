package com.worldhero.dto;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StageWaveDetailDto {
    private UUID id;
    private Integer worldIndex;
    private Integer stageIndex;
    private Integer waveNumber;
    private String monsterTemplateId;
    private String monsterName;
    private String monsterIcon;
    private Integer monsterCount;
    private Double hpMultiplier;
    private Double atkMultiplier;
    private Boolean isBossWave;
}
