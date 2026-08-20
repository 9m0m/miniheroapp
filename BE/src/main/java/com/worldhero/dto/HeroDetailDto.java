package com.worldhero.dto;

import com.worldhero.model.enums.HeroClass;
import com.worldhero.model.enums.HeroRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeroDetailDto {
    private UUID id;
    private String templateId;
    private String name;
    private HeroClass heroClass;
    private HeroRole role;

    @Builder.Default
    private int level = 1;

    @Builder.Default
    private int stars = 1;

    @Builder.Default
    private int shards = 0;

    private int exp;
    private boolean isInParty;
    private int slotIndex;

    @Builder.Default
    private List<ItemInstanceDto> equippedItems = new ArrayList<>();

    @Builder.Default
    private java.util.Map<String, Integer> skills = new java.util.HashMap<>();

    private StatsDto computedStats;
    private CombatStatsDto towerStats;
    private double liveDps;
}
