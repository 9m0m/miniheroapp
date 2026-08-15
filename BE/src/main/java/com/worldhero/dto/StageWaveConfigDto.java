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
public class StageWaveConfigDto {
    private UUID id;
    private int worldIndex;
    private int stageIndex;
    private int waveNumber;
    private String monsterId;
    private String monsterName;
    private String monsterIcon;
    private int monsterCount; // 3 to 15 monsters per wave
    private double hpMultiplier;
    private double atkMultiplier;
    private double armorMultiplier;
    private String bossEnrageSkill;
}
