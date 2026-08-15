package com.worldhero.service;

import com.worldhero.dto.HeroDetailDto;
import com.worldhero.dto.HeroSkillTreeDto;
import com.worldhero.dto.StatsDto;
import com.worldhero.dto.UpgradeSkillRequestDto;
import com.worldhero.model.enums.HeroClass;

import java.util.Map;
import java.util.UUID;

public interface SkillService {
    HeroSkillTreeDto getSkillTree(UUID heroId);
    HeroDetailDto upgradeSkill(UpgradeSkillRequestDto request);
    StatsDto calculateSkillBonusStats(HeroClass heroClass, Map<String, Integer> skills);
}
