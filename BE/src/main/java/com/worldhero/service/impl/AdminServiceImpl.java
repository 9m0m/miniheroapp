package com.worldhero.service.impl;

import com.worldhero.dto.*;
import com.worldhero.engine.DamageCalculator;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.*;
import com.worldhero.model.enums.ElementalType;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.ItemSlot;
import com.worldhero.repository.*;
import com.worldhero.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ItemTemplateRepository itemTemplateRepository;
    private final SkillConfigRepository skillConfigRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        return AdminDashboardStatsDto.builder()
                .totalUsers(userRepository.count())
                .totalItemTemplates(itemTemplateRepository.count())
                .totalSkillConfigs(skillConfigRepository.count())
                .serverStatus("ONLINE_HEALTHY")
                .databaseEngine("PostgreSQL miniheroapp (Hibernate 6.5 / Spring Data JPA)")
                .build();
    }

    // ==========================================
    // 🛡️ MASTER ITEM TEMPLATES MANAGEMENT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<ItemTemplateDto> getAllItemTemplates() {
        return itemTemplateRepository.findAll().stream()
                .map(ItemTemplateEntity::toTemplateDto)
                .sorted(Comparator.comparing((ItemTemplateDto t) -> t.getRequiredClass() != null ? t.getRequiredClass().name() : "UNIVERSAL")
                        .thenComparing(ItemTemplateDto::getBaseRarity)
                        .thenComparing(ItemTemplateDto::getName))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ItemTemplateDto updateItemTemplate(String id, ItemTemplateDto dto) {
        ItemTemplateEntity entity = itemTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Template: " + id));

        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getIconUrl() != null) entity.setIconKey(dto.getIconUrl());
        if (dto.getBaseRarity() != null) entity.setBaseRarity(dto.getBaseRarity());
        if (dto.getElementalType() != null) entity.setElementalType(dto.getElementalType());
        if (dto.getILvlScalingFactor() > 0) entity.setIlvlScalingFactor(dto.getILvlScalingFactor());

        // Base Stats
        if (dto.getBaseStats() != null) {
            StatsDto st = dto.getBaseStats();
            entity.setBasePhysAtk(st.getPhysAtk());
            entity.setBaseMagicAtk(st.getMagicAtk());
            entity.setBaseAtkPercent(st.getAtkPercent());
            entity.setBaseAtkSpeed(st.getAtkSpeed());
            entity.setBaseCritRate(st.getCritRate());
            entity.setBaseCritDmg(st.getCritDmg());
            entity.setBaseElemDmgBonus(st.getElemDmgBonus());
            entity.setBaseMaxHp(st.getMaxHp());
            entity.setBaseArmor(st.getArmor());
            entity.setBaseDmgReduction(st.getDmgReduction());
        }

        entity = itemTemplateRepository.save(entity);
        log.info("🗡️ Updated Master Item Template: {}", entity.getName());
        return entity.toTemplateDto();
    }

    // ==========================================
    // 🔮 SKILL TREE BALANCER
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<SkillConfigDto> getAllSkillConfigs() {
        return skillConfigRepository.findAll().stream()
                .map(this::toSkillDto)
                .sorted(Comparator.comparing((SkillConfigDto s) -> s.getHeroClass().name())
                        .thenComparing(SkillConfigDto::getSkillId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SkillConfigDto updateSkillConfig(String skillId, SkillConfigDto dto) {
        SkillConfigEntity entity = skillConfigRepository.findBySkillId(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Skill: " + skillId));

        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getIcon() != null) entity.setIcon(dto.getIcon());
        if (dto.getMaxLevel() > 0) entity.setMaxLevel(dto.getMaxLevel());
        if (dto.getBaseGoldCost() > 0) entity.setBaseGoldCost(dto.getBaseGoldCost());
        if (dto.getGoldCostPerLevel() >= 0) entity.setGoldCostPerLevel(dto.getGoldCostPerLevel());
        if (dto.getBonusDescription() != null) entity.setBonusDescription(dto.getBonusDescription());
        if (dto.getStatBonusesJson() != null) entity.setStatBonusesJson(dto.getStatBonusesJson());

        entity = skillConfigRepository.save(entity);
        log.info("⚡ Updated Skill Config: {} ({})", entity.getName(), entity.getSkillId());
        return toSkillDto(entity);
    }

    private SkillConfigDto toSkillDto(SkillConfigEntity entity) {
        return SkillConfigDto.builder()
                .id(entity.getId())
                .heroClass(entity.getHeroClass())
                .skillId(entity.getSkillId())
                .name(entity.getName())
                .description(entity.getDescription())
                .icon(entity.getIcon())
                .maxLevel(entity.getMaxLevel())
                .baseGoldCost(entity.getBaseGoldCost())
                .goldCostPerLevel(entity.getGoldCostPerLevel())
                .bonusDescription(entity.getBonusDescription())
                .statBonusesJson(entity.getStatBonusesJson())
                .build();
    }
}
