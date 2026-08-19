package com.worldhero.dto;

import com.worldhero.model.enums.GearFamily;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.model.enums.HeroRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeroTemplateDto {
    private String id;
    private String catalogVersion;
    private String name;
    private String title;
    private HeroRole role;
    private GearFamily gearFamily;
    private CombatStatsDto baseStats;
    private String growthCurveId;
    private AttackProfileDto attackProfile;
    private TowerProfileDto towerProfile;
    private String passiveSkillId;
    private String uniqueSkillId;
    private String spriteKey;
    private String portraitKey;
    private boolean enabled;
    private HeroClass legacyHeroClass;
}
