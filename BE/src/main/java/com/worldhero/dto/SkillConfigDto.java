package com.worldhero.dto;

import com.worldhero.model.enums.HeroClass;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillConfigDto {
    private String id;
    private HeroClass heroClass;
    private String skillId;
    private String name;
    private String description;
    private String icon;
    private int maxLevel;
    private long baseGoldCost;
    private long goldCostPerLevel;
    private String bonusDescription;
    private String statBonusesJson;
}
