package com.worldhero.service.impl;

import com.worldhero.dto.AttackProfileDto;
import com.worldhero.dto.CombatStatsDto;
import com.worldhero.dto.HeroCatalogResponseDto;
import com.worldhero.dto.HeroTemplateDto;
import com.worldhero.dto.TowerProfileDto;
import com.worldhero.model.enums.AttackMode;
import com.worldhero.model.enums.GearFamily;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.model.enums.HeroRole;
import com.worldhero.model.enums.TargetRule;
import com.worldhero.service.HeroCatalogService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
public class HeroCatalogServiceImpl implements HeroCatalogService {

    private final Map<String, HeroTemplateDto> templateMap = new LinkedHashMap<>();
    private final Map<HeroClass, String> legacyClassMap = new LinkedHashMap<>();
    private final Map<String, HeroClass> reverseLegacyMap = new LinkedHashMap<>();

    @PostConstruct
    public void init() {
        // Build the canonical 24-hero catalog
        registerAllTemplates();

        // Register legacy mappings
        registerLegacyMapping(HeroClass.WARRIOR, "hero.warrior");
        registerLegacyMapping(HeroClass.RANGER, "hero.ranger");
        registerLegacyMapping(HeroClass.MAGE, "hero.wizard");
        registerLegacyMapping(HeroClass.PRIEST, "hero.priest");

        // Validate complete 24-template catalog integrity
        validateCatalogIntegrity();

        log.info("Initialized HeroCatalog: {} total templates, {} enabled (version: {})",
                templateMap.size(), getEnabledTemplates().size(), CATALOG_VERSION);
    }

    private static final Set<String> CANONICAL_UNIQUE_SKILLS = Set.of(
        "aegis_intercept", "stonewall_taunt", "sanctuary_shield", "chain_lock",
        "vanguard_cleave", "breaking_combo", "blood_tempo", "line_breaker",
        "backline_execute", "counter_step", "smoke_feint", "soul_harvest",
        "falcon_mark", "snare_trap", "suppressing_volley", "companion_guard",
        "arc_storm", "hexfire_blast", "element_shift", "binding_curse",
        "divine_mend", "battle_rhythm", "spirit_totem", "reactive_elixir"
    );

    private static final Set<String> CANONICAL_PASSIVES = Set.of(
        "iron_aegis", "stone_skin", "holy_barrier", "shackles_aura",
        "vanguard_heart", "inner_focus", "fury_stack", "momentum",
        "executioner_eye", "counter_stance", "shadow_cloak", "soul_reap",
        "eagle_eye", "trap_mastery", "rapid_fire", "beast_bond",
        "mana_surge", "hex_resonance", "elemental_flow", "curse_link",
        "divine_grace", "tempo_melody", "ancestral_ward", "alchemical_catalyst"
    );

    private void validateCatalogIntegrity() {
        if (templateMap.size() != 24) {
            throw new IllegalStateException("HeroCatalog must contain exactly 24 templates, found: " + templateMap.size());
        }
        long enabledCount = templateMap.values().stream().filter(HeroTemplateDto::isEnabled).count();
        if (enabledCount != 18) {
            throw new IllegalStateException("HeroCatalog must have exactly 18 enabled templates, found: " + enabledCount);
        }
        for (HeroTemplateDto tpl : templateMap.values()) {
            if (tpl.getName() == null || tpl.getRole() == null || tpl.getBaseStats() == null ||
                tpl.getUniqueSkillId() == null || tpl.getPassiveSkillId() == null || tpl.getSpriteKey() == null) {
                throw new IllegalStateException("HeroTemplate " + tpl.getId() + " is missing mandatory fields");
            }
            if (!CANONICAL_UNIQUE_SKILLS.contains(tpl.getUniqueSkillId())) {
                throw new IllegalStateException("HeroTemplate " + tpl.getId() + " has unknown uniqueSkillId: " + tpl.getUniqueSkillId());
            }
            if (!CANONICAL_PASSIVES.contains(tpl.getPassiveSkillId())) {
                throw new IllegalStateException("HeroTemplate " + tpl.getId() + " has unknown passiveSkillId: " + tpl.getPassiveSkillId());
            }
        }
    }

    private void registerLegacyMapping(HeroClass legacyClass, String templateId) {
        legacyClassMap.put(legacyClass, templateId);
        reverseLegacyMap.put(templateId, legacyClass);
    }

    private void registerAllTemplates() {
        // --- 1. TANK (Base HP 1250, ATK 90, Armor 110, Speed 85, CritRate 5%, CritDmg 150%) ---
        register(HeroTemplateDto.builder()
                .id("hero.knight")
                .catalogVersion(CATALOG_VERSION)
                .name("Knight")
                .title("Aegis Guardian")
                .role(HeroRole.TANK)
                .gearFamily(GearFamily.HEAVY)
                .baseStats(CombatStatsDto.forRole(HeroRole.TANK))
                .growthCurveId("standard_tank_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.MELEE).rangePx(45).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(85).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_tank_standard").build())
                .passiveSkillId("iron_aegis")
                .uniqueSkillId("aegis_intercept")
                .spriteKey("hero_knight")
                .portraitKey("portrait_knight")
                .enabled(true)
                .build());

        register(HeroTemplateDto.builder()
                .id("hero.guardian")
                .catalogVersion(CATALOG_VERSION)
                .name("Guardian")
                .title("Stonewall Bastion")
                .role(HeroRole.TANK)
                .gearFamily(GearFamily.HEAVY)
                .baseStats(CombatStatsDto.forRole(HeroRole.TANK))
                .growthCurveId("standard_tank_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.MELEE).rangePx(45).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(85).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_tank_taunt").build())
                .passiveSkillId("stone_skin")
                .uniqueSkillId("stonewall_taunt")
                .spriteKey("hero_guardian")
                .portraitKey("portrait_guardian")
                .enabled(true)
                .build());

        register(HeroTemplateDto.builder()
                .id("hero.paladin")
                .catalogVersion(CATALOG_VERSION)
                .name("Paladin")
                .title("Holy Defender")
                .role(HeroRole.TANK)
                .gearFamily(GearFamily.HEAVY)
                .baseStats(CombatStatsDto.forRole(HeroRole.TANK))
                .growthCurveId("standard_tank_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.MELEE).rangePx(45).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(85).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_tank_shield").build())
                .passiveSkillId("holy_barrier")
                .uniqueSkillId("sanctuary_shield")
                .spriteKey("hero_paladin")
                .portraitKey("portrait_paladin")
                .enabled(true)
                .build());

        // 4th Tank - Disabled for MVP
        register(HeroTemplateDto.builder()
                .id("hero.warden")
                .catalogVersion(CATALOG_VERSION)
                .name("Warden")
                .title("Chain Sentinel")
                .role(HeroRole.TANK)
                .gearFamily(GearFamily.HEAVY)
                .baseStats(CombatStatsDto.forRole(HeroRole.TANK))
                .growthCurveId("standard_tank_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.MELEE).rangePx(45).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(85).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_tank_lock").build())
                .passiveSkillId("shackles_aura")
                .uniqueSkillId("chain_lock")
                .spriteKey("hero_warden")
                .portraitKey("portrait_warden")
                .enabled(false)
                .build());

        // --- 2. BRUISER (Base HP 1050, ATK 115, Armor 75, Speed 98, CritRate 5%, CritDmg 150%) ---
        register(HeroTemplateDto.builder()
                .id("hero.warrior")
                .catalogVersion(CATALOG_VERSION)
                .name("Warrior")
                .title("Vanguard Champion")
                .role(HeroRole.BRUISER)
                .gearFamily(GearFamily.MARTIAL)
                .baseStats(CombatStatsDto.forRole(HeroRole.BRUISER))
                .growthCurveId("standard_bruiser_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.MELEE).rangePx(45).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(98).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_bruiser_standard").build())
                .passiveSkillId("vanguard_heart")
                .uniqueSkillId("vanguard_cleave")
                .spriteKey("hero_warrior")
                .portraitKey("portrait_warrior")
                .legacyHeroClass(HeroClass.WARRIOR)
                .enabled(true)
                .build());

        register(HeroTemplateDto.builder()
                .id("hero.fighter")
                .catalogVersion(CATALOG_VERSION)
                .name("Fighter")
                .title("Iron Fist")
                .role(HeroRole.BRUISER)
                .gearFamily(GearFamily.MARTIAL)
                .baseStats(CombatStatsDto.forRole(HeroRole.BRUISER))
                .growthCurveId("standard_bruiser_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.MELEE).rangePx(45).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(98).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_bruiser_combo").build())
                .passiveSkillId("inner_focus")
                .uniqueSkillId("breaking_combo")
                .spriteKey("hero_fighter")
                .portraitKey("portrait_fighter")
                .enabled(true)
                .build());

        register(HeroTemplateDto.builder()
                .id("hero.berserker")
                .catalogVersion(CATALOG_VERSION)
                .name("Berserker")
                .title("Blood Frenzy")
                .role(HeroRole.BRUISER)
                .gearFamily(GearFamily.MARTIAL)
                .baseStats(CombatStatsDto.forRole(HeroRole.BRUISER))
                .growthCurveId("standard_bruiser_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.MELEE).rangePx(45).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(98).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_bruiser_tempo").build())
                .passiveSkillId("fury_stack")
                .uniqueSkillId("blood_tempo")
                .spriteKey("hero_berserker")
                .portraitKey("portrait_berserker")
                .enabled(true)
                .build());

        // 4th Bruiser - Disabled for MVP
        register(HeroTemplateDto.builder()
                .id("hero.lancer")
                .catalogVersion(CATALOG_VERSION)
                .name("Lancer")
                .title("Line Breaker")
                .role(HeroRole.BRUISER)
                .gearFamily(GearFamily.MARTIAL)
                .baseStats(CombatStatsDto.forRole(HeroRole.BRUISER))
                .growthCurveId("standard_bruiser_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.MELEE).rangePx(50).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(98).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_bruiser_charge").build())
                .passiveSkillId("momentum")
                .uniqueSkillId("line_breaker")
                .spriteKey("hero_lancer")
                .portraitKey("portrait_lancer")
                .enabled(false)
                .build());

        // --- 3. ASSASSIN (Base HP 760, ATK 145, Armor 40, Speed 122, CritRate 10%, CritDmg 160%) ---
        register(HeroTemplateDto.builder()
                .id("hero.slayer")
                .catalogVersion(CATALOG_VERSION)
                .name("Slayer")
                .title("Silent Blade")
                .role(HeroRole.ASSASSIN)
                .gearFamily(GearFamily.MARTIAL)
                .baseStats(CombatStatsDto.forRole(HeroRole.ASSASSIN))
                .growthCurveId("standard_assassin_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.MELEE).rangePx(45).targetRule(TargetRule.LOWEST_HP_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(122).basicTargetRule(TargetRule.LOWEST_HP_ENEMY).aiPolicyId("ai_assassin_execute").build())
                .passiveSkillId("executioner_eye")
                .uniqueSkillId("backline_execute")
                .spriteKey("hero_slayer")
                .portraitKey("portrait_slayer")
                .enabled(true)
                .build());

        register(HeroTemplateDto.builder()
                .id("hero.shadow_monk")
                .catalogVersion(CATALOG_VERSION)
                .name("Shadow Monk")
                .title("Phantom Fist")
                .role(HeroRole.ASSASSIN)
                .gearFamily(GearFamily.MARTIAL)
                .baseStats(CombatStatsDto.forRole(HeroRole.ASSASSIN))
                .growthCurveId("standard_assassin_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.MELEE).rangePx(45).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(122).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_assassin_counter").build())
                .passiveSkillId("counter_stance")
                .uniqueSkillId("counter_step")
                .spriteKey("hero_shadow_monk")
                .portraitKey("portrait_shadow_monk")
                .enabled(true)
                .build());

        register(HeroTemplateDto.builder()
                .id("hero.rogue")
                .catalogVersion(CATALOG_VERSION)
                .name("Rogue")
                .title("Shadow Stalker")
                .role(HeroRole.ASSASSIN)
                .gearFamily(GearFamily.MARTIAL)
                .baseStats(CombatStatsDto.forRole(HeroRole.ASSASSIN))
                .growthCurveId("standard_assassin_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.MELEE).rangePx(45).targetRule(TargetRule.LOWEST_HP_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(122).basicTargetRule(TargetRule.LOWEST_HP_ENEMY).aiPolicyId("ai_assassin_feint").build())
                .passiveSkillId("shadow_cloak")
                .uniqueSkillId("smoke_feint")
                .spriteKey("hero_rogue")
                .portraitKey("portrait_rogue")
                .enabled(true)
                .build());

        // 4th Assassin - Disabled for MVP
        register(HeroTemplateDto.builder()
                .id("hero.reaper")
                .catalogVersion(CATALOG_VERSION)
                .name("Reaper")
                .title("Soul Harvester")
                .role(HeroRole.ASSASSIN)
                .gearFamily(GearFamily.MARTIAL)
                .baseStats(CombatStatsDto.forRole(HeroRole.ASSASSIN))
                .growthCurveId("standard_assassin_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.MELEE).rangePx(45).targetRule(TargetRule.LOWEST_HP_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(122).basicTargetRule(TargetRule.LOWEST_HP_ENEMY).aiPolicyId("ai_assassin_harvest").build())
                .passiveSkillId("soul_reap")
                .uniqueSkillId("soul_harvest")
                .spriteKey("hero_reaper")
                .portraitKey("portrait_reaper")
                .enabled(false)
                .build());

        // --- 4. MARKSMAN (Base HP 800, ATK 135, Armor 45, Speed 112, CritRate 8%, CritDmg 155%) ---
        register(HeroTemplateDto.builder()
                .id("hero.ranger")
                .catalogVersion(CATALOG_VERSION)
                .name("Ranger")
                .title("Falcon Eye")
                .role(HeroRole.MARKSMAN)
                .gearFamily(GearFamily.RANGED)
                .baseStats(CombatStatsDto.forRole(HeroRole.MARKSMAN))
                .growthCurveId("standard_marksman_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.RANGED).rangePx(200).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(112).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_marksman_standard").build())
                .passiveSkillId("eagle_eye")
                .uniqueSkillId("falcon_mark")
                .spriteKey("hero_ranger")
                .portraitKey("portrait_ranger")
                .legacyHeroClass(HeroClass.RANGER)
                .enabled(true)
                .build());

        register(HeroTemplateDto.builder()
                .id("hero.hunter")
                .catalogVersion(CATALOG_VERSION)
                .name("Hunter")
                .title("Trapper Ranger")
                .role(HeroRole.MARKSMAN)
                .gearFamily(GearFamily.RANGED)
                .baseStats(CombatStatsDto.forRole(HeroRole.MARKSMAN))
                .growthCurveId("standard_marksman_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.RANGED).rangePx(180).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(112).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_marksman_trap").build())
                .passiveSkillId("trap_mastery")
                .uniqueSkillId("snare_trap")
                .spriteKey("hero_hunter")
                .portraitKey("portrait_hunter")
                .enabled(true)
                .build());

        register(HeroTemplateDto.builder()
                .id("hero.gunner")
                .catalogVersion(CATALOG_VERSION)
                .name("Gunner")
                .title("Heavy Cannoneer")
                .role(HeroRole.MARKSMAN)
                .gearFamily(GearFamily.RANGED)
                .baseStats(CombatStatsDto.forRole(HeroRole.MARKSMAN))
                .growthCurveId("standard_marksman_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.RANGED).rangePx(190).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(112).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_marksman_volley").build())
                .passiveSkillId("rapid_fire")
                .uniqueSkillId("suppressing_volley")
                .spriteKey("hero_gunner")
                .portraitKey("portrait_gunner")
                .enabled(true)
                .build());

        // 4th Marksman - Disabled for MVP
        register(HeroTemplateDto.builder()
                .id("hero.beastmaster")
                .catalogVersion(CATALOG_VERSION)
                .name("Beastmaster")
                .title("Wild Warden")
                .role(HeroRole.MARKSMAN)
                .gearFamily(GearFamily.RANGED)
                .baseStats(CombatStatsDto.forRole(HeroRole.MARKSMAN))
                .growthCurveId("standard_marksman_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.RANGED).rangePx(180).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(112).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_marksman_beast").build())
                .passiveSkillId("beast_bond")
                .uniqueSkillId("companion_guard")
                .spriteKey("hero_beastmaster")
                .portraitKey("portrait_beastmaster")
                .enabled(false)
                .build());

        // --- 5. MAGE (Base HP 780, ATK 145, Armor 38, Speed 102, CritRate 5%, CritDmg 150%) ---
        register(HeroTemplateDto.builder()
                .id("hero.wizard")
                .catalogVersion(CATALOG_VERSION)
                .name("Wizard")
                .title("Archmage")
                .role(HeroRole.MAGE)
                .gearFamily(GearFamily.ARCANE)
                .baseStats(CombatStatsDto.forRole(HeroRole.MAGE))
                .growthCurveId("standard_mage_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.RANGED).rangePx(200).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(102).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_mage_aoe").build())
                .passiveSkillId("mana_surge")
                .uniqueSkillId("arc_storm")
                .spriteKey("hero_wizard")
                .portraitKey("portrait_wizard")
                .legacyHeroClass(HeroClass.MAGE)
                .enabled(true)
                .build());

        register(HeroTemplateDto.builder()
                .id("hero.sorcerer")
                .catalogVersion(CATALOG_VERSION)
                .name("Sorcerer")
                .title("Hexfire Wielder")
                .role(HeroRole.MAGE)
                .gearFamily(GearFamily.ARCANE)
                .baseStats(CombatStatsDto.forRole(HeroRole.MAGE))
                .growthCurveId("standard_mage_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.RANGED).rangePx(200).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(102).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_mage_dot").build())
                .passiveSkillId("hex_resonance")
                .uniqueSkillId("hexfire_blast")
                .spriteKey("hero_sorcerer")
                .portraitKey("portrait_sorcerer")
                .enabled(true)
                .build());

        register(HeroTemplateDto.builder()
                .id("hero.elementalist")
                .catalogVersion(CATALOG_VERSION)
                .name("Elementalist")
                .title("Prismatic Weaver")
                .role(HeroRole.MAGE)
                .gearFamily(GearFamily.ARCANE)
                .baseStats(CombatStatsDto.forRole(HeroRole.MAGE))
                .growthCurveId("standard_mage_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.RANGED).rangePx(200).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(102).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_mage_shift").build())
                .passiveSkillId("elemental_flow")
                .uniqueSkillId("element_shift")
                .spriteKey("hero_elementalist")
                .portraitKey("portrait_elementalist")
                .enabled(true)
                .build());

        // 4th Mage - Disabled for MVP
        register(HeroTemplateDto.builder()
                .id("hero.warlock")
                .catalogVersion(CATALOG_VERSION)
                .name("Warlock")
                .title("Curse Binder")
                .role(HeroRole.MAGE)
                .gearFamily(GearFamily.ARCANE)
                .baseStats(CombatStatsDto.forRole(HeroRole.MAGE))
                .growthCurveId("standard_mage_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.RANGED).rangePx(200).targetRule(TargetRule.FRONT_ENEMY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(102).basicTargetRule(TargetRule.FRONT_ENEMY).aiPolicyId("ai_mage_curse").build())
                .passiveSkillId("curse_link")
                .uniqueSkillId("binding_curse")
                .spriteKey("hero_warlock")
                .portraitKey("portrait_warlock")
                .enabled(false)
                .build());

        // --- 6. SUPPORT (Base HP 900, ATK 100, Armor 55, Speed 105, CritRate 5%, CritDmg 150%) ---
        register(HeroTemplateDto.builder()
                .id("hero.priest")
                .catalogVersion(CATALOG_VERSION)
                .name("Priest")
                .title("High Cleric")
                .role(HeroRole.SUPPORT)
                .gearFamily(GearFamily.ARCANE)
                .baseStats(CombatStatsDto.forRole(HeroRole.SUPPORT))
                .growthCurveId("standard_support_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.SUPPORT).rangePx(200).targetRule(TargetRule.LOWEST_HP_ALLY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(105).basicTargetRule(TargetRule.LOWEST_HP_ALLY).aiPolicyId("ai_support_heal").build())
                .passiveSkillId("divine_grace")
                .uniqueSkillId("divine_mend")
                .spriteKey("hero_priest")
                .portraitKey("portrait_priest")
                .legacyHeroClass(HeroClass.PRIEST)
                .enabled(true)
                .build());

        register(HeroTemplateDto.builder()
                .id("hero.bard")
                .catalogVersion(CATALOG_VERSION)
                .name("Bard")
                .title("Songweaver")
                .role(HeroRole.SUPPORT)
                .gearFamily(GearFamily.ARCANE)
                .baseStats(CombatStatsDto.forRole(HeroRole.SUPPORT))
                .growthCurveId("standard_support_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.SUPPORT).rangePx(200).targetRule(TargetRule.ALL_ALLIES).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(105).basicTargetRule(TargetRule.ALL_ALLIES).aiPolicyId("ai_support_buff").build())
                .passiveSkillId("tempo_melody")
                .uniqueSkillId("battle_rhythm")
                .spriteKey("hero_bard")
                .portraitKey("portrait_bard")
                .enabled(true)
                .build());

        register(HeroTemplateDto.builder()
                .id("hero.shaman")
                .catalogVersion(CATALOG_VERSION)
                .name("Shaman")
                .title("Totem Caller")
                .role(HeroRole.SUPPORT)
                .gearFamily(GearFamily.ARCANE)
                .baseStats(CombatStatsDto.forRole(HeroRole.SUPPORT))
                .growthCurveId("standard_support_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.SUPPORT).rangePx(200).targetRule(TargetRule.ALL_ALLIES).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(105).basicTargetRule(TargetRule.ALL_ALLIES).aiPolicyId("ai_support_regen").build())
                .passiveSkillId("ancestral_ward")
                .uniqueSkillId("spirit_totem")
                .spriteKey("hero_shaman")
                .portraitKey("portrait_shaman")
                .enabled(true)
                .build());

        // 4th Support - Disabled for MVP
        register(HeroTemplateDto.builder()
                .id("hero.alchemist")
                .catalogVersion(CATALOG_VERSION)
                .name("Alchemist")
                .title("Potion Master")
                .role(HeroRole.SUPPORT)
                .gearFamily(GearFamily.ARCANE)
                .baseStats(CombatStatsDto.forRole(HeroRole.SUPPORT))
                .growthCurveId("standard_support_growth")
                .attackProfile(AttackProfileDto.builder().mode(AttackMode.SUPPORT).rangePx(200).targetRule(TargetRule.LOWEST_HP_ALLY).build())
                .towerProfile(TowerProfileDto.builder().baseSpeed(105).basicTargetRule(TargetRule.LOWEST_HP_ALLY).aiPolicyId("ai_support_elixir").build())
                .passiveSkillId("alchemical_catalyst")
                .uniqueSkillId("reactive_elixir")
                .spriteKey("hero_alchemist")
                .portraitKey("portrait_alchemist")
                .enabled(false)
                .build());
    }

    private void register(HeroTemplateDto template) {
        templateMap.put(template.getId(), template);
    }

    @Override
    public HeroCatalogResponseDto getCatalog(String version) {
        List<HeroTemplateDto> templates = getAllTemplates();
        int enabledCount = (int) templates.stream().filter(HeroTemplateDto::isEnabled).count();

        return HeroCatalogResponseDto.builder()
                .catalogVersion(CATALOG_VERSION)
                .totalHeroes(templates.size())
                .enabledCount(enabledCount)
                .templates(templates)
                .build();
    }

    @Override
    public List<HeroTemplateDto> getAllTemplates() {
        return Collections.unmodifiableList(new ArrayList<>(templateMap.values()));
    }

    @Override
    public List<HeroTemplateDto> getEnabledTemplates() {
        return templateMap.values().stream()
                .filter(HeroTemplateDto::isEnabled)
                .toList();
    }

    @Override
    public Optional<HeroTemplateDto> getTemplateById(String templateId) {
        if (templateId == null) return Optional.empty();
        return Optional.ofNullable(templateMap.get(templateId));
    }

    @Override
    public Optional<HeroTemplateDto> getTemplateByLegacyClass(HeroClass heroClass) {
        if (heroClass == null) return Optional.empty();
        String templateId = legacyClassMap.get(heroClass);
        if (templateId == null) return Optional.empty();
        return getTemplateById(templateId);
    }

    @Override
    public String mapLegacyClassToTemplateId(HeroClass heroClass) {
        return legacyClassMap.get(heroClass);
    }

    @Override
    public HeroClass mapTemplateIdToLegacyClass(String templateId) {
        return reverseLegacyMap.get(templateId);
    }
}
