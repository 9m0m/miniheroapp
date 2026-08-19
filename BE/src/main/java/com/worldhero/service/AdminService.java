package com.worldhero.service;

import com.worldhero.dto.*;

import java.util.List;

public interface AdminService {
    // Dashboard Stats
    AdminDashboardStatsDto getDashboardStats();

    // Master Item Templates Management
    List<ItemTemplateDto> getAllItemTemplates();
    ItemTemplateDto updateItemTemplate(String id, ItemTemplateDto dto);

    // Skill Tree Configs Management
    List<SkillConfigDto> getAllSkillConfigs();
    SkillConfigDto updateSkillConfig(String skillId, SkillConfigDto dto);
}
