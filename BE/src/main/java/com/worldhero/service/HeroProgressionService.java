package com.worldhero.service;

import com.worldhero.dto.CombatStatsDto;
import com.worldhero.dto.HeroDetailDto;

import java.util.UUID;

public interface HeroProgressionService {
    int MAX_HERO_LEVEL = 50;
    int MAX_HERO_STARS = 5;

    record LevelCost(int essence, int gold) {}
    record StarCost(int levelCap, int shards, int gold, double rawStatBonus) {}

    static double getStarStatBonus(int stars) {
        return switch (Math.max(1, Math.min(MAX_HERO_STARS, stars))) {
            case 2, 3 -> 0.03;
            case 4 -> 0.07;
            case 5 -> 0.10;
            default -> 0.0;
        };
    }

    static CombatStatsDto calculateHeroProgressionStats(CombatStatsDto baseStats, int level, int stars) {
        if (baseStats == null) return CombatStatsDto.builder().build();

        int safeLevel = Math.max(1, Math.min(MAX_HERO_LEVEL, level));
        double starBonus = getStarStatBonus(stars);

        int hp = (int) Math.round(baseStats.getMaxHp() * (1.0 + 0.030 * (safeLevel - 1)) * (1.0 + starBonus));
        int atk = (int) Math.round(baseStats.getAtk() * (1.0 + 0.024 * (safeLevel - 1)) * (1.0 + starBonus));
        int armor = (int) Math.round(baseStats.getArmor() * (1.0 + 0.020 * (safeLevel - 1)) * (1.0 + starBonus));

        return CombatStatsDto.builder()
                .maxHp(hp)
                .atk(atk)
                .armor(armor)
                .speed(baseStats.getSpeed())
                .critRate(baseStats.getCritRate())
                .critDmg(baseStats.getCritDmg())
                .build();
    }

    LevelCost calculateLevelCost(int fromLevel, int toLevel);

    StarCost getStarCost(int targetStar);

    CombatStatsDto computeHeroStats(CombatStatsDto baseStats, int level, int stars);

    HeroDetailDto levelUpHero(UUID userId, UUID heroId, int targetLevel);

    HeroDetailDto levelUpHero(UUID userId, UUID heroId, int targetLevel, String operationKey);

    HeroDetailDto starUpHero(UUID userId, UUID heroId);

    HeroDetailDto starUpHero(UUID userId, UUID heroId, String operationKey);
}
