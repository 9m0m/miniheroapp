package com.worldhero.dto;

import com.worldhero.model.enums.ElementalType;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.ItemSlot;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemTemplateUpdateDto {
    private String id;
    private String name;
    private String description;
    private String iconKey;
    private ItemSlot slotType;
    private HeroClass requiredClass;
    private ItemRarity baseRarity;
    private ElementalType elementalType;
    private Double basePhysAtk;
    private Double baseMagicAtk;
    private Double baseArmor;
    private Double baseMaxHp;
    private Double baseAtkSpeed;
    private Double baseCritRate;
    private Double baseCritDmg;
    private Double baseAtkPercent;
    private Double iLvlScalingFactor;
}
