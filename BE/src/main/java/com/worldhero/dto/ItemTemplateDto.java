package com.worldhero.dto;

import com.worldhero.model.enums.ElementalType;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.ItemSlot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemTemplateDto {

    private String id;
    private String name;
    private String description;
    private String iconUrl;

    private ItemSlot slot;
    private HeroClass requiredClass;       // null = Universal Accessory
    private ItemRarity baseRarity;
    private ElementalType elementalType;
    private int requiredLevel;

    // Base stats of the template (un-enhanced, iLvl 1)
    private StatsDto baseStats;

    // Stat growth scaling factor per iLvl
    @Builder.Default
    private double iLvlScalingFactor = 0.08; // 8% growth per iLvl
}
