package com.worldhero.dto;

import com.worldhero.model.enums.ElementalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonsterTemplateDto {
    private String id;
    private String name;
    private String category;
    private ElementalType elementalType;
    private Double baseHp;
    private Double baseAtk;
    private Double baseArmor;
    private Double attackSpeed;
    private String iconKey;
    private Boolean isBoss;
    private Long goldReward;
}
