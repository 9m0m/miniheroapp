package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BattleSimulationRequestDto {
    @Builder.Default
    private int worldIndex = 1;

    @Builder.Default
    private int stageIndex = 1;

    @Builder.Default
    private int waveNumber = 5;

    @Builder.Default
    private int heroTotalAtk = 120;

    @Builder.Default
    private int heroTotalHp = 800;

    @Builder.Default
    private int heroTotalArmor = 150;

    @Builder.Default
    private double heroAtkSpeed = 1.2;

    @Builder.Default
    private double heroCritRate = 15.0;

    @Builder.Default
    private double heroCritDmg = 180.0;

    @Builder.Default
    private int simulationRounds = 100;
}
