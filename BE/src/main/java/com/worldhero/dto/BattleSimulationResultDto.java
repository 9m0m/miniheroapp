package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BattleSimulationResultDto {
    private int totalRounds;
    private int wins;
    private int losses;
    private double winRatePercent;
    private double avgTimeToKillSec;
    private double avgHeroDps;
    private double avgDamageDealt;
    private double avgDamageTaken;
    private String monsterName;
    private int monsterCount;
    private double monsterTotalHp;
    private double monsterAtk;
    private String balanceAssessment;
    private List<String> battleLogHighlights;
}
