package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillNodeDto {
    private String id;
    private String name;
    private String description;
    private String icon;
    private int maxLevel;
    private int currentLevel;
    private long goldCostNextLevel;
    private String bonusDescription;
}
