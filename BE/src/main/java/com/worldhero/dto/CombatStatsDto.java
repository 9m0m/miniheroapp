package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CombatStatsDto {
    private int atk;
    private int maxHp;
    private int armor;
    private int speed;
    private double critRate; // Percentage e.g. 5.0 for 5%
    private double critDmg;  // Percentage e.g. 150.0 for 150%

    public static CombatStatsDto forRole(com.worldhero.model.enums.HeroRole role) {
        return switch (role) {
            case TANK -> CombatStatsDto.builder()
                    .atk(90).maxHp(1250).armor(110).speed(85).critRate(5.0).critDmg(150.0).build();
            case BRUISER -> CombatStatsDto.builder()
                    .atk(115).maxHp(1050).armor(75).speed(98).critRate(5.0).critDmg(150.0).build();
            case ASSASSIN -> CombatStatsDto.builder()
                    .atk(145).maxHp(760).armor(40).speed(122).critRate(10.0).critDmg(160.0).build();
            case MARKSMAN -> CombatStatsDto.builder()
                    .atk(135).maxHp(800).armor(45).speed(112).critRate(8.0).critDmg(155.0).build();
            case MAGE -> CombatStatsDto.builder()
                    .atk(145).maxHp(780).armor(38).speed(102).critRate(5.0).critDmg(150.0).build();
            case SUPPORT -> CombatStatsDto.builder()
                    .atk(100).maxHp(900).armor(55).speed(105).critRate(5.0).critDmg(150.0).build();
        };
    }
}
