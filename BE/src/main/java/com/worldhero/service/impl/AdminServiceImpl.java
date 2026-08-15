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
    private final MonsterTemplateRepository monsterTemplateRepository;
    private final StageWaveConfigRepository stageWaveConfigRepository;
    private final DropTableConfigRepository dropTableConfigRepository;
    private final SkillConfigRepository skillConfigRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        return AdminDashboardStatsDto.builder()
                .totalUsers(userRepository.count())
                .totalItemTemplates(itemTemplateRepository.count())
                .totalMonsterTemplates(monsterTemplateRepository.count())
                .totalStageWaveConfigs(stageWaveConfigRepository.count())
                .totalSkillConfigs(skillConfigRepository.count())
                .totalWorlds(4)
                .totalStages(40)
                .serverStatus("ONLINE_HEALTHY")
                .databaseEngine("PostgreSQL miniheroapp (Hibernate 6.5 / Spring Data JPA)")
                .build();
    }

    // ==========================================
    // 👾 MONSTER TEMPLATES CRUD
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<MonsterTemplateDto> getAllMonsters() {
        return monsterTemplateRepository.findAll().stream()
                .map(this::toMonsterDto)
                .sorted(Comparator.comparing(MonsterTemplateDto::getCategory, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(MonsterTemplateDto::getIsBoss)
                        .thenComparing(MonsterTemplateDto::getName))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MonsterTemplateDto getMonsterById(String id) {
        MonsterTemplateEntity entity = monsterTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Quái vật: " + id));
        return toMonsterDto(entity);
    }

    @Override
    @Transactional
    public MonsterTemplateDto createMonster(MonsterTemplateDto dto) {
        if (dto.getId() == null || dto.getId().isBlank()) {
            dto.setId("mob_" + dto.getName().toLowerCase().replaceAll("[^a-z0-9]", "_") + "_" + System.currentTimeMillis() % 1000);
        }
        if (monsterTemplateRepository.existsById(dto.getId())) {
            throw new GameRuleViolationException("Quái vật với ID " + dto.getId() + " đã tồn tại!");
        }

        MonsterTemplateEntity entity = MonsterTemplateEntity.builder()
                .id(dto.getId())
                .name(dto.getName())
                .category(dto.getCategory() != null ? dto.getCategory() : "Forest Goblins")
                .elementalType(dto.getElementalType() != null ? dto.getElementalType() : ElementalType.PHYSICAL)
                .baseHp(dto.getBaseHp() != null ? dto.getBaseHp() : 200.0)
                .baseAtk(dto.getBaseAtk() != null ? dto.getBaseAtk() : 15.0)
                .baseArmor(dto.getBaseArmor() != null ? dto.getBaseArmor() : 20.0)
                .attackSpeed(dto.getAttackSpeed() != null ? dto.getAttackSpeed() : 1.0)
                .iconKey(dto.getIconKey() != null ? dto.getIconKey() : "👾")
                .isBoss(Boolean.TRUE.equals(dto.getIsBoss()))
                .goldReward(dto.getGoldReward() != null ? dto.getGoldReward() : 20L)
                .build();

        entity = monsterTemplateRepository.save(entity);
        log.info("➕ Created new Monster Template: {} ({})", entity.getName(), entity.getId());
        return toMonsterDto(entity);
    }

    @Override
    @Transactional
    public MonsterTemplateDto updateMonster(String id, MonsterTemplateDto dto) {
        MonsterTemplateEntity entity = monsterTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Quái vật: " + id));

        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getCategory() != null) entity.setCategory(dto.getCategory());
        if (dto.getElementalType() != null) entity.setElementalType(dto.getElementalType());
        if (dto.getBaseHp() != null) entity.setBaseHp(dto.getBaseHp());
        if (dto.getBaseAtk() != null) entity.setBaseAtk(dto.getBaseAtk());
        if (dto.getBaseArmor() != null) entity.setBaseArmor(dto.getBaseArmor());
        if (dto.getAttackSpeed() != null) entity.setAttackSpeed(dto.getAttackSpeed());
        if (dto.getIconKey() != null) entity.setIconKey(dto.getIconKey());
        if (dto.getIsBoss() != null) entity.setIsBoss(dto.getIsBoss());
        if (dto.getGoldReward() != null) entity.setGoldReward(dto.getGoldReward());

        entity = monsterTemplateRepository.save(entity);
        log.info("✏️ Updated Monster Template: {}", entity.getId());
        return toMonsterDto(entity);
    }

    @Override
    @Transactional
    public void deleteMonster(String id) {
        if (!monsterTemplateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy Quái vật: " + id);
        }
        monsterTemplateRepository.deleteById(id);
        log.info("🗑️ Deleted Monster Template: {}", id);
    }

    // ==========================================
    // ⚔️ STAGE WAVES & DROP TABLE CONFIGURATION
    // ==========================================

    @Override
    @Transactional
    public StageDetailConfigDto getStageDetailConfig(int worldIndex, int stageIndex) {
        List<StageWaveConfigEntity> waveEntities = stageWaveConfigRepository.findByWorldIndexAndStageIndexOrderByWaveNumberAsc(worldIndex, stageIndex);
        
        // If waves do not exist yet in DB for this stage, seed default 30 waves automatically
        if (waveEntities.isEmpty()) {
            waveEntities = generateDefaultStageWaves(worldIndex, stageIndex);
            waveEntities = stageWaveConfigRepository.saveAll(waveEntities);
        }

        DropTableConfigEntity dropTable = dropTableConfigRepository.findByWorldIndexAndStageIndex(worldIndex, stageIndex)
                .orElseGet(() -> {
                    DropTableConfigEntity newDropTable = DropTableConfigEntity.builder()
                            .worldIndex(worldIndex)
                            .stageIndex(stageIndex)
                            .chestDropChance(0.03 + (stageIndex - 1) * 0.005)
                            .bossChestDropChance(0.25 + (worldIndex - 1) * 0.05)
                            .stoneDropChance(0.40)
                            .goldMultiplier(1.0 + (worldIndex - 1) * 0.2 + (stageIndex - 1) * 0.05)
                            .build();
                    return dropTableConfigRepository.save(newDropTable);
                });

        Map<String, MonsterTemplateEntity> monsterMap = monsterTemplateRepository.findAll().stream()
                .collect(Collectors.toMap(MonsterTemplateEntity::getId, m -> m, (a, b) -> a));

        List<StageWaveConfigDto> waveDtos = waveEntities.stream().map(w -> {
            MonsterTemplateEntity mob = monsterMap.get(w.getMonsterId());
            return StageWaveConfigDto.builder()
                    .id(w.getId())
                    .worldIndex(w.getWorldIndex())
                    .stageIndex(w.getStageIndex())
                    .waveNumber(w.getWaveNumber())
                    .monsterId(w.getMonsterId())
                    .monsterName(mob != null ? mob.getName() : w.getMonsterId())
                    .monsterIcon(mob != null ? mob.getIconKey() : (w.getWaveNumber() == 31 ? "👑" : "👾"))
                    .monsterCount(w.getMonsterCount())
                    .hpMultiplier(w.getHpMultiplier())
                    .atkMultiplier(w.getAtkMultiplier())
                    .armorMultiplier(w.getArmorMultiplier())
                    .bossEnrageSkill(w.getBossEnrageSkill())
                    .build();
        }).collect(Collectors.toList());

        String worldName = switch (worldIndex) {
            case 2 -> "Frozen Citadel";
            case 3 -> "Volcanic Caldera";
            case 4 -> "Void Abyss";
            default -> "Emerald Forest";
        };

        return StageDetailConfigDto.builder()
                .worldIndex(worldIndex)
                .stageIndex(stageIndex)
                .stageName("World " + worldIndex + " (" + worldName + ") - Stage " + stageIndex)
                .dropTable(DropTableConfigDto.builder()
                        .id(dropTable.getId())
                        .worldIndex(dropTable.getWorldIndex())
                        .stageIndex(dropTable.getStageIndex())
                        .chestDropChance(dropTable.getChestDropChance())
                        .bossChestDropChance(dropTable.getBossChestDropChance())
                        .stoneDropChance(dropTable.getStoneDropChance())
                        .goldMultiplier(dropTable.getGoldMultiplier())
                        .normalCommonWeight(dropTable.getNormalCommonWeight())
                        .normalUncommonWeight(dropTable.getNormalUncommonWeight())
                        .normalRareWeight(dropTable.getNormalRareWeight())
                        .normalEpicWeight(dropTable.getNormalEpicWeight())
                        .normalLegendaryWeight(dropTable.getNormalLegendaryWeight())
                        .bossCommonWeight(dropTable.getBossCommonWeight())
                        .bossUncommonWeight(dropTable.getBossUncommonWeight())
                        .bossRareWeight(dropTable.getBossRareWeight())
                        .bossEpicWeight(dropTable.getBossEpicWeight())
                        .bossLegendaryWeight(dropTable.getBossLegendaryWeight())
                        .build())
                .waves(waveDtos)
                .build();
    }

    @Override
    @Transactional
    public StageDetailConfigDto updateStageDetailConfig(int worldIndex, int stageIndex, StageDetailConfigDto dto) {
        // 1. Update Drop Table
        if (dto.getDropTable() != null) {
            DropTableConfigEntity dropTable = dropTableConfigRepository.findByWorldIndexAndStageIndex(worldIndex, stageIndex)
                    .orElseGet(() -> DropTableConfigEntity.builder().worldIndex(worldIndex).stageIndex(stageIndex).build());

            dropTable.setChestDropChance(dto.getDropTable().getChestDropChance());
            dropTable.setBossChestDropChance(dto.getDropTable().getBossChestDropChance());
            dropTable.setStoneDropChance(dto.getDropTable().getStoneDropChance());
            dropTable.setGoldMultiplier(dto.getDropTable().getGoldMultiplier());
            if (dto.getDropTable().getNormalCommonWeight() > 0 || dto.getDropTable().getNormalUncommonWeight() > 0) {
                dropTable.setNormalCommonWeight(dto.getDropTable().getNormalCommonWeight());
                dropTable.setNormalUncommonWeight(dto.getDropTable().getNormalUncommonWeight());
                dropTable.setNormalRareWeight(dto.getDropTable().getNormalRareWeight());
                dropTable.setNormalEpicWeight(dto.getDropTable().getNormalEpicWeight());
                dropTable.setNormalLegendaryWeight(dto.getDropTable().getNormalLegendaryWeight());
            }
            if (dto.getDropTable().getBossRareWeight() > 0 || dto.getDropTable().getBossEpicWeight() > 0) {
                dropTable.setBossCommonWeight(dto.getDropTable().getBossCommonWeight());
                dropTable.setBossUncommonWeight(dto.getDropTable().getBossUncommonWeight());
                dropTable.setBossRareWeight(dto.getDropTable().getBossRareWeight());
                dropTable.setBossEpicWeight(dto.getDropTable().getBossEpicWeight());
                dropTable.setBossLegendaryWeight(dto.getDropTable().getBossLegendaryWeight());
            }
            dropTableConfigRepository.save(dropTable);
        }

        // 2. Update Waves
        if (dto.getWaves() != null && !dto.getWaves().isEmpty()) {
            List<StageWaveConfigEntity> existingWaves = stageWaveConfigRepository.findByWorldIndexAndStageIndexOrderByWaveNumberAsc(worldIndex, stageIndex);
            Map<Integer, StageWaveConfigEntity> existingMap = existingWaves.stream()
                    .collect(Collectors.toMap(StageWaveConfigEntity::getWaveNumber, w -> w, (a, b) -> a));

            List<StageWaveConfigEntity> toSave = new ArrayList<>();
            for (StageWaveConfigDto waveDto : dto.getWaves()) {
                StageWaveConfigEntity entity = existingMap.get(waveDto.getWaveNumber());
                if (entity == null) {
                    entity = StageWaveConfigEntity.builder()
                            .worldIndex(worldIndex)
                            .stageIndex(stageIndex)
                            .waveNumber(waveDto.getWaveNumber())
                            .build();
                }
                entity.setMonsterId(waveDto.getMonsterId());
                entity.setMonsterCount(Math.max(3, Math.min(15, waveDto.getMonsterCount()))); // Clamp 3 to 15 monsters
                entity.setHpMultiplier(waveDto.getHpMultiplier() > 0 ? waveDto.getHpMultiplier() : 1.0);
                entity.setAtkMultiplier(waveDto.getAtkMultiplier() > 0 ? waveDto.getAtkMultiplier() : 1.0);
                entity.setArmorMultiplier(waveDto.getArmorMultiplier() > 0 ? waveDto.getArmorMultiplier() : 1.0);
                entity.setBossEnrageSkill(waveDto.getBossEnrageSkill());
                toSave.add(entity);
            }
            stageWaveConfigRepository.saveAll(toSave);
        }

        log.info("💾 LiveOps Update: Saved Stage Config for World {} - Stage {}", worldIndex, stageIndex);
        return getStageDetailConfig(worldIndex, stageIndex);
    }

    private List<StageWaveConfigEntity> generateDefaultStageWaves(int worldIndex, int stageIndex) {
        List<StageWaveConfigEntity> list = new ArrayList<>();

        String defaultMobId = switch (worldIndex) {
            case 2 -> "frost_golem";
            case 3 -> "fire_imp";
            case 4 -> "void_wisp";
            default -> "goblin_scout";
        };

        String defaultBossId = switch (worldIndex) {
            case 2 -> "boss_frost_wyrm";
            case 3 -> "boss_fire_lord";
            case 4 -> "boss_void_overlord";
            default -> "boss_goblin_king";
        };

        for (int wave = 1; wave <= 31; wave++) {
            boolean isBoss = wave == 31;
            double stageGrowth = 1.0 + (stageIndex - 1) * 0.08 + (worldIndex - 1) * 0.5;
            double waveGrowth = 1.0 + (wave - 1) * 0.03;

            list.add(StageWaveConfigEntity.builder()
                    .worldIndex(worldIndex)
                    .stageIndex(stageIndex)
                    .waveNumber(wave)
                    .monsterId(isBoss ? defaultBossId : defaultMobId)
                    .monsterCount(isBoss ? 1 : Math.min(15, 3 + (wave / 3))) // 3 to 13 normal mobs, 1 Boss on Wave 31
                    .hpMultiplier(Math.round((stageGrowth * waveGrowth * (isBoss ? 3.5 : 1.0)) * 100.0) / 100.0)
                    .atkMultiplier(Math.round((stageGrowth * waveGrowth * (isBoss ? 1.8 : 1.0)) * 100.0) / 100.0)
                    .armorMultiplier(Math.round((stageGrowth * waveGrowth * (isBoss ? 1.5 : 1.0)) * 100.0) / 100.0)
                    .bossEnrageSkill(isBoss ? "Berserk Rage (+50% ATK)" : null)
                    .build());
        }
        return list;
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

    // ==========================================
    // 📊 LIVE BATTLE MATH SIMULATION ENGINE
    // ==========================================

    @Override
    public BattleSimulationResultDto simulateBattle(BattleSimulationRequestDto req) {
        int rounds = Math.max(10, Math.min(500, req.getSimulationRounds()));
        int wins = 0;
        int losses = 0;

        double totalDmgDealt = 0;
        double totalDmgTaken = 0;
        double totalTimeToKill = 0;

        // Fetch monster configuration for specified world/stage/wave
        StageWaveConfigEntity waveCfg = stageWaveConfigRepository
                .findByWorldIndexAndStageIndexAndWaveNumber(req.getWorldIndex(), req.getStageIndex(), req.getWaveNumber())
                .orElse(null);

        String mobId = waveCfg != null ? waveCfg.getMonsterId() : "goblin_scout";
        int monsterCount = waveCfg != null ? waveCfg.getMonsterCount() : 5;
        double hpMult = waveCfg != null ? waveCfg.getHpMultiplier() : (1.0 + req.getWaveNumber() * 0.05);
        double atkMult = waveCfg != null ? waveCfg.getAtkMultiplier() : 1.0;
        double armorMult = waveCfg != null ? waveCfg.getArmorMultiplier() : 1.0;

        MonsterTemplateEntity mobTpl = monsterTemplateRepository.findById(mobId).orElse(null);
        String mobName = mobTpl != null ? mobTpl.getName() : "Wild Entity";
        double baseMobHp = (mobTpl != null ? mobTpl.getBaseHp() : 250.0) * hpMult;
        double baseMobAtk = (mobTpl != null ? mobTpl.getBaseAtk() : 20.0) * atkMult;
        double baseMobArmor = (mobTpl != null ? mobTpl.getBaseArmor() : 15.0) * armorMult;

        List<String> highlights = new ArrayList<>();

        for (int r = 0; r < rounds; r++) {
            double currentHeroHp = req.getHeroTotalHp();
            double currentMonsterHpPool = baseMobHp * monsterCount;

            double simTime = 0.0;
            double roundDmgDealt = 0;
            double roundDmgTaken = 0;

            while (currentHeroHp > 0 && currentMonsterHpPool > 0 && simTime < 180.0) {
                simTime += 0.5; // 0.5s combat tick

                // Hero attacks monster
                boolean isCrit = ThreadLocalRandom.current().nextDouble(0, 100) < req.getHeroCritRate();
                double critMultiplier = isCrit ? (req.getHeroCritDmg() / 100.0) : 1.0;
                double armorMitigation = 1.0 - (baseMobArmor / (baseMobArmor + 500.0));
                double heroHitDmg = req.getHeroTotalAtk() * critMultiplier * armorMitigation * req.getHeroAtkSpeed() * 0.5;

                currentMonsterHpPool -= heroHitDmg;
                roundDmgDealt += heroHitDmg;

                if (currentMonsterHpPool <= 0) break;

                // Monsters counter-attack hero
                double heroArmorMitigation = 1.0 - (req.getHeroTotalArmor() / (req.getHeroTotalArmor() + 500.0));
                double monsterHitDmg = baseMobAtk * heroArmorMitigation * 0.35 * Math.min(3, monsterCount);
                currentHeroHp -= monsterHitDmg;
                roundDmgTaken += monsterHitDmg;
            }

            if (currentMonsterHpPool <= 0) {
                wins++;
            } else {
                losses++;
            }

            totalDmgDealt += roundDmgDealt;
            totalDmgTaken += roundDmgTaken;
            totalTimeToKill += simTime;

            if (r < 3) {
                highlights.add(String.format("Round %d: %s in %.1fs (Hero HP Left: %.0f, Dmg Dealt: %.0f, Dmg Taken: %.0f)",
                        r + 1, currentMonsterHpPool <= 0 ? "VICTORY" : "DEFEAT", simTime, Math.max(0, currentHeroHp), roundDmgDealt, roundDmgTaken));
            }
        }

        double winRate = (double) wins / rounds * 100.0;
        double avgTtk = totalTimeToKill / rounds;
        double avgDps = (totalDmgDealt / rounds) / Math.max(0.1, avgTtk);

        String assessment;
        if (winRate >= 95.0 && avgTtk < 12.0) {
            assessment = "🟢 RẤT DỄ (Overpowered) — Party tiêu diệt quái cực nhanh. Cân nhắc tăng HP/Giáp quái.";
        } else if (winRate >= 75.0 && avgTtk <= 30.0) {
            assessment = "✨ CÂN BẰNG TỐT (Optimal Balance) — Độ khó vừa phải, mang lại trải nghiệm idle kịch tính.";
        } else if (winRate >= 40.0) {
            assessment = "🟡 KHÁ THỬ THÁCH (Challenging) — Yêu cầu người chơi nâng cấp kỹ năng hoặc cường hóa đồ.";
        } else {
            assessment = "🔴 QUÁ KHÓ (High Wipeout Risk) — Quái vật gây sát thương quá lớn hoặc máu quá dày.";
        }

        return BattleSimulationResultDto.builder()
                .totalRounds(rounds)
                .wins(wins)
                .losses(losses)
                .winRatePercent(Math.round(winRate * 10.0) / 10.0)
                .avgTimeToKillSec(Math.round(avgTtk * 10.0) / 10.0)
                .avgHeroDps(Math.round(avgDps * 10.0) / 10.0)
                .avgDamageDealt(Math.round((totalDmgDealt / rounds) * 10.0) / 10.0)
                .avgDamageTaken(Math.round((totalDmgTaken / rounds) * 10.0) / 10.0)
                .monsterName(mobName)
                .monsterCount(monsterCount)
                .monsterTotalHp(baseMobHp * monsterCount)
                .monsterAtk(baseMobAtk)
                .balanceAssessment(assessment)
                .battleLogHighlights(highlights)
                .build();
    }

    // ==========================================
    // 🛠️ MAPPERS
    // ==========================================

    private MonsterTemplateDto toMonsterDto(MonsterTemplateEntity entity) {
        return MonsterTemplateDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .category(entity.getCategory())
                .elementalType(entity.getElementalType())
                .baseHp(entity.getBaseHp())
                .baseAtk(entity.getBaseAtk())
                .baseArmor(entity.getBaseArmor())
                .attackSpeed(entity.getAttackSpeed())
                .iconKey(entity.getIconKey())
                .isBoss(entity.getIsBoss())
                .goldReward(entity.getGoldReward())
                .build();
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
