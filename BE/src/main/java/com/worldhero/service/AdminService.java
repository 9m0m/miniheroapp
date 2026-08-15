package com.worldhero.service;

import com.worldhero.dto.*;

import java.util.List;

public interface AdminService {
    // Dashboard Stats
    AdminDashboardStatsDto getDashboardStats();

    // Monster Templates Management
    List<MonsterTemplateDto> getAllMonsters();
    MonsterTemplateDto getMonsterById(String id);
    MonsterTemplateDto createMonster(MonsterTemplateDto dto);
    MonsterTemplateDto updateMonster(String id, MonsterTemplateDto dto);
    void deleteMonster(String id);

    // Stage Waves & Drop Table Configuration
    StageDetailConfigDto getStageDetailConfig(int worldIndex, int stageIndex);
    StageDetailConfigDto updateStageDetailConfig(int worldIndex, int stageIndex, StageDetailConfigDto dto);

    // Master Item Templates Management
    List<ItemTemplateDto> getAllItemTemplates();
    ItemTemplateDto updateItemTemplate(String id, ItemTemplateDto dto);

    // Skill Tree Configs Management
    List<SkillConfigDto> getAllSkillConfigs();
    SkillConfigDto updateSkillConfig(String skillId, SkillConfigDto dto);

    // Live Battle Math Simulation Engine
    BattleSimulationResultDto simulateBattle(BattleSimulationRequestDto request);
}
