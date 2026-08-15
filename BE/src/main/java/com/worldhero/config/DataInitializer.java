package com.worldhero.config;

import com.worldhero.model.entity.HeroEntity;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.ItemTemplateEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.ElementalType;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.ItemSlot;
import com.worldhero.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ItemTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final HeroRepository heroRepository;
    private final ItemInstanceRepository instanceRepository;
    private final AdminUserRepository adminUserRepository;
    private final MonsterTemplateRepository monsterTemplateRepository;
    private final SkillConfigRepository skillConfigRepository;
    private final DropTableConfigRepository dropTableConfigRepository;
    private final StageWaveConfigRepository stageWaveConfigRepository;
    private final QuestTemplateRepository questTemplateRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedItemTemplates();
        seedDefaultDemoUser();
        seedSuperAdminUser();
        seedMonsterTemplates();
        seedSkillConfigs();
        seedDropTablesAndStageWaves();
        seedDefaultQuests();
    }

    private void seedDefaultQuests() {
        if (questTemplateRepository.count() > 0) return;

        log.info("📜 Seeding Default Daily & Weekly Quests into Database...");
        List<com.worldhero.model.entity.QuestTemplateEntity> quests = List.of(
            // DAILY QUESTS (6 quests, 20 pts each = 120 total)
            com.worldhero.model.entity.QuestTemplateEntity.builder()
                .id("daily_kill_mobs")
                .title("Monster Slayer")
                .description("Defeat 30 wild monsters in normal or boss waves.")
                .icon("⚔️")
                .questType(com.worldhero.model.enums.QuestType.DAILY)
                .actionType(com.worldhero.model.enums.QuestActionType.MONSTER_KILL)
                .targetCount(30)
                .activityPoints(20)
                .goldReward(500L)
                .gemsReward(10)
                .sortOrder(1)
                .isActive(true)
                .build(),

            com.worldhero.model.entity.QuestTemplateEntity.builder()
                .id("daily_clear_waves")
                .title("Wave Conqueror")
                .description("Successfully clear 5 waves with your hero squad.")
                .icon("🌊")
                .questType(com.worldhero.model.enums.QuestType.DAILY)
                .actionType(com.worldhero.model.enums.QuestActionType.WAVE_CLEAR)
                .targetCount(5)
                .activityPoints(20)
                .stonesReward(2)
                .sortOrder(2)
                .isActive(true)
                .build(),

            com.worldhero.model.entity.QuestTemplateEntity.builder()
                .id("daily_enhance_gear")
                .title("Blacksmith Apprentice")
                .description("Enhance any weapon or armor piece at the forge.")
                .icon("🔨")
                .questType(com.worldhero.model.enums.QuestType.DAILY)
                .actionType(com.worldhero.model.enums.QuestActionType.EQUIPMENT_ENHANCE)
                .targetCount(1)
                .activityPoints(20)
                .gemsReward(20)
                .sortOrder(3)
                .isActive(true)
                .build(),

            com.worldhero.model.entity.QuestTemplateEntity.builder()
                .id("daily_open_chests")
                .title("Treasure Seeker")
                .description("Open 2 equipment loot chests dropped in battle.")
                .icon("🎁")
                .questType(com.worldhero.model.enums.QuestType.DAILY)
                .actionType(com.worldhero.model.enums.QuestActionType.CHEST_OPEN)
                .targetCount(2)
                .activityPoints(20)
                .gemsReward(30)
                .sortOrder(4)
                .isActive(true)
                .build(),

            com.worldhero.model.entity.QuestTemplateEntity.builder()
                .id("daily_alchemy_cube")
                .title("Mystic Transmutation")
                .description("Brew a ward scroll at Alchemy or fuse gear in The Cube.")
                .icon("🔮")
                .questType(com.worldhero.model.enums.QuestType.DAILY)
                .actionType(com.worldhero.model.enums.QuestActionType.CUBE_FUSION)
                .targetCount(1)
                .activityPoints(20)
                .goldReward(500L)
                .sortOrder(5)
                .isActive(true)
                .build(),

            com.worldhero.model.entity.QuestTemplateEntity.builder()
                .id("daily_upgrade_skill")
                .title("Hero Empowerment")
                .description("Learn or upgrade a skill node in the Master Skill Tree.")
                .icon("⚡")
                .questType(com.worldhero.model.enums.QuestType.DAILY)
                .actionType(com.worldhero.model.enums.QuestActionType.SKILL_UPGRADE)
                .targetCount(1)
                .activityPoints(20)
                .goldReward(500L)
                .sortOrder(6)
                .isActive(true)
                .build(),

            // WEEKLY QUESTS (5 quests, 100-120 pts each = 600 total)
            com.worldhero.model.entity.QuestTemplateEntity.builder()
                .id("weekly_kill_bosses")
                .title("Bane of the Overlords")
                .description("Vanquish 10 Stage Bosses (Wave 31) across the 4 Worlds.")
                .icon("👑")
                .questType(com.worldhero.model.enums.QuestType.WEEKLY)
                .actionType(com.worldhero.model.enums.QuestActionType.BOSS_KILL_W31)
                .targetCount(10)
                .activityPoints(120)
                .goldReward(3000L)
                .gemsReward(100)
                .sortOrder(1)
                .isActive(true)
                .build(),

            com.worldhero.model.entity.QuestTemplateEntity.builder()
                .id("weekly_high_enhance")
                .title("Master of the Forge")
                .description("Perform 5 equipment enhancements at the Blacksmith.")
                .icon("🔨")
                .questType(com.worldhero.model.enums.QuestType.WEEKLY)
                .actionType(com.worldhero.model.enums.QuestActionType.EQUIPMENT_ENHANCE)
                .targetCount(5)
                .activityPoints(120)
                .stonesReward(10)
                .sortOrder(2)
                .isActive(true)
                .build(),

            com.worldhero.model.entity.QuestTemplateEntity.builder()
                .id("weekly_cube_fusions")
                .title("Horadric Scholar")
                .description("Transmute items 3 times inside the Horadric Cube.")
                .icon("🎲")
                .questType(com.worldhero.model.enums.QuestType.WEEKLY)
                .actionType(com.worldhero.model.enums.QuestActionType.CUBE_FUSION)
                .targetCount(3)
                .activityPoints(120)
                .gemsReward(150)
                .sortOrder(3)
                .isActive(true)
                .build(),

            com.worldhero.model.entity.QuestTemplateEntity.builder()
                .id("weekly_trial_runs")
                .title("Arena Gladiator")
                .description("Complete 5 challenge runs in the Trial Arena (DPS or Speedrun).")
                .icon("🎯")
                .questType(com.worldhero.model.enums.QuestType.WEEKLY)
                .actionType(com.worldhero.model.enums.QuestActionType.TRIAL_RUN)
                .targetCount(5)
                .activityPoints(120)
                .goldReward(5000L)
                .stonesReward(5)
                .sortOrder(4)
                .isActive(true)
                .build(),

            com.worldhero.model.entity.QuestTemplateEntity.builder()
                .id("weekly_gold_hoard")
                .title("Economic Tycoon")
                .description("Accumulate a total of 25,000 Gold or smash the Piggy Bank.")
                .icon("💰")
                .questType(com.worldhero.model.enums.QuestType.WEEKLY)
                .actionType(com.worldhero.model.enums.QuestActionType.GOLD_EARNED)
                .targetCount(25000)
                .activityPoints(120)
                .gemsReward(250)
                .sortOrder(5)
                .isActive(true)
                .build()
        );

        questTemplateRepository.saveAll(quests);
        log.info("✅ Successfully seeded 11 Default Master Quests (6 Daily + 5 Weekly)!");
    }

    private void seedSuperAdminUser() {
        if (adminUserRepository.findByUsername("superadmin").isEmpty()) {
            adminUserRepository.save(com.worldhero.model.entity.AdminUserEntity.builder()
                    .username("superadmin")
                    .password("adminpassword123")
                    .role(com.worldhero.model.enums.AdminRole.ROLE_SUPERADMIN)
                    .build());
            log.info("👑 Initialized SuperAdmin User ('superadmin' / 'adminpassword123') in Database!");
        }
    }

    private void seedMonsterTemplates() {
        if (monsterTemplateRepository.count() >= 16) {
            return;
        }

        log.info("👾 Seeding Comprehensive Master Monster Templates into Database...");
        List<com.worldhero.model.entity.MonsterTemplateEntity> monsters = List.of(
            // --- WORLD 1: EMERALD FOREST ---
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("goblin_scout").name("Forest Goblin Scout").category("Forest Goblins")
                .elementalType(ElementalType.PHYSICAL).baseHp(200.0).baseAtk(15.0).baseArmor(20.0)
                .attackSpeed(1.0).iconKey("👺").isBoss(false).goldReward(20L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("goblin_spearman").name("Goblin Spearman").category("Forest Goblins")
                .elementalType(ElementalType.PHYSICAL).baseHp(260.0).baseAtk(18.0).baseArmor(25.0)
                .attackSpeed(1.0).iconKey("🗡️").isBoss(false).goldReward(25L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("wild_boar").name("Feral Wild Boar").category("Forest Goblins")
                .elementalType(ElementalType.PHYSICAL).baseHp(320.0).baseAtk(22.0).baseArmor(30.0)
                .attackSpeed(0.9).iconKey("🐗").isBoss(false).goldReward(30L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("forest_wolf").name("Emerald Timberwolf").category("Forest Goblins")
                .elementalType(ElementalType.PHYSICAL).baseHp(280.0).baseAtk(24.0).baseArmor(22.0)
                .attackSpeed(1.2).iconKey("🐺").isBoss(false).goldReward(35L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("boss_goblin_king").name("Elder Goblin King").category("Bosses")
                .elementalType(ElementalType.PHYSICAL).baseHp(2500.0).baseAtk(65.0).baseArmor(90.0)
                .attackSpeed(0.85).iconKey("👑").isBoss(true).goldReward(500L).build(),

            // --- WORLD 2: FROZEN CITADEL ---
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("frost_sprite").name("Glacial Frost Sprite").category("Frost Wyrms")
                .elementalType(ElementalType.COLD).baseHp(380.0).baseAtk(25.0).baseArmor(35.0)
                .attackSpeed(1.1).iconKey("❄️").isBoss(false).goldReward(40L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("ice_golem").name("Ancient Ice Golem").category("Frost Wyrms")
                .elementalType(ElementalType.COLD).baseHp(550.0).baseAtk(30.0).baseArmor(60.0)
                .attackSpeed(0.8).iconKey("🗿").isBoss(false).goldReward(50L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("glacial_archer").name("Glacial Archer").category("Frost Wyrms")
                .elementalType(ElementalType.COLD).baseHp(420.0).baseAtk(35.0).baseArmor(40.0)
                .attackSpeed(1.2).iconKey("🏹").isBoss(false).goldReward(55L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("frost_stalker").name("Subzero Frost Stalker").category("Frost Wyrms")
                .elementalType(ElementalType.COLD).baseHp(480.0).baseAtk(38.0).baseArmor(45.0)
                .attackSpeed(1.3).iconKey("🐆").isBoss(false).goldReward(60L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("boss_frost_wyrm").name("Ancient Frost Wyrm").category("Bosses")
                .elementalType(ElementalType.COLD).baseHp(5500.0).baseAtk(120.0).baseArmor(150.0)
                .attackSpeed(0.9).iconKey("🐉").isBoss(true).goldReward(1000L).build(),

            // --- WORLD 3: VOLCANIC CALDERA ---
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("fire_imp").name("Volcanic Fire Imp").category("Magma Demons")
                .elementalType(ElementalType.FIRE).baseHp(600.0).baseAtk(42.0).baseArmor(50.0)
                .attackSpeed(1.1).iconKey("🔥").isBoss(false).goldReward(70L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("lava_hound").name("Infernal Lava Hound").category("Magma Demons")
                .elementalType(ElementalType.FIRE).baseHp(750.0).baseAtk(48.0).baseArmor(60.0)
                .attackSpeed(1.0).iconKey("🐕").isBoss(false).goldReward(80L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("magma_brute").name("Magma Caldera Brute").category("Magma Demons")
                .elementalType(ElementalType.FIRE).baseHp(950.0).baseAtk(55.0).baseArmor(85.0)
                .attackSpeed(0.8).iconKey("🌋").isBoss(false).goldReward(95L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("flame_sorcerer").name("Pyromancer Sorcerer").category("Magma Demons")
                .elementalType(ElementalType.FIRE).baseHp(680.0).baseAtk(62.0).baseArmor(55.0)
                .attackSpeed(1.15).iconKey("🧙‍♂️").isBoss(false).goldReward(110L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("boss_fire_lord").name("Fire Lord Ifrit").category("Bosses")
                .elementalType(ElementalType.FIRE).baseHp(12000.0).baseAtk(210.0).baseArmor(240.0)
                .attackSpeed(0.85).iconKey("👑").isBoss(true).goldReward(2000L).build(),

            // --- WORLD 4: VOID ABYSS ---
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("void_wisp").name("Cosmic Void Wisp").category("Void Entities")
                .elementalType(ElementalType.CHAOS).baseHp(900.0).baseAtk(60.0).baseArmor(75.0)
                .attackSpeed(1.2).iconKey("👁️").isBoss(false).goldReward(120L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("abyssal_stalker").name("Abyssal Stalker").category("Void Entities")
                .elementalType(ElementalType.CHAOS).baseHp(1100.0).baseAtk(70.0).baseArmor(90.0)
                .attackSpeed(1.3).iconKey("👤").isBoss(false).goldReward(140L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("chaos_fiend").name("Primordial Chaos Fiend").category("Void Entities")
                .elementalType(ElementalType.CHAOS).baseHp(1400.0).baseAtk(82.0).baseArmor(110.0)
                .attackSpeed(0.95).iconKey("👾").isBoss(false).goldReward(170L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("nether_horror").name("Nether Horror Eldritch").category("Void Entities")
                .elementalType(ElementalType.CHAOS).baseHp(1700.0).baseAtk(95.0).baseArmor(130.0)
                .attackSpeed(1.0).iconKey("🌌").isBoss(false).goldReward(200L).build(),
            com.worldhero.model.entity.MonsterTemplateEntity.builder()
                .id("boss_void_overlord").name("Void Overlord Abaddon").category("Bosses")
                .elementalType(ElementalType.CHAOS).baseHp(28000.0).baseAtk(380.0).baseArmor(420.0)
                .attackSpeed(1.0).iconKey("👁️").isBoss(true).goldReward(5000L).build()
        );
        monsterTemplateRepository.saveAll(monsters);
        log.info("✅ Successfully seeded 20 Master Monster Templates!");
    }

    private void seedSkillConfigs() {
        if (skillConfigRepository.count() > 0) return;

        log.info("🌱 Seeding Master Skill Configs into Database...");
        List<com.worldhero.model.entity.SkillConfigEntity> skillConfigs = List.of(
            // WARRIOR
            com.worldhero.model.entity.SkillConfigEntity.builder()
                .id("warrior_iron_wall").heroClass(com.worldhero.model.enums.HeroClass.WARRIOR).skillId("iron_wall")
                .name("Iron Wall").description("Reinforces armor and reduces damage taken.")
                .icon("🛡️").maxLevel(5).baseGoldCost(500L).goldCostPerLevel(500L)
                .bonusDescription("+10 Armor • +2% Damage Reduction per level")
                .statBonusesJson("{\"armor\":10.0,\"dmgReduction\":2.0}").build(),
            com.worldhero.model.entity.SkillConfigEntity.builder()
                .id("warrior_berserk_strike").heroClass(com.worldhero.model.enums.HeroClass.WARRIOR).skillId("berserk_strike")
                .name("Berserk Strike").description("Boosts physical attack power and drains enemy life.")
                .icon("🩸").maxLevel(5).baseGoldCost(500L).goldCostPerLevel(500L)
                .bonusDescription("+10 Phys ATK • +2% Lifesteal per level")
                .statBonusesJson("{\"physAtk\":10.0,\"lifeSteal\":2.0}").build(),
            com.worldhero.model.entity.SkillConfigEntity.builder()
                .id("warrior_whirlwind_slash").heroClass(com.worldhero.model.enums.HeroClass.WARRIOR).skillId("whirlwind_slash")
                .name("Whirlwind Slash").description("Sweeping cleave dealing massive critical damage.")
                .icon("🌪️").maxLevel(5).baseGoldCost(500L).goldCostPerLevel(500L)
                .bonusDescription("+10% Crit DMG • +3% Total ATK per level")
                .statBonusesJson("{\"critDmg\":10.0,\"atkPercent\":3.0}").build(),

            // RANGER
            com.worldhero.model.entity.SkillConfigEntity.builder()
                .id("ranger_eagle_eye").heroClass(com.worldhero.model.enums.HeroClass.RANGER).skillId("eagle_eye")
                .name("Eagle Eye").description("Sharpens eyesight, boosting Critical Rate and Attack Speed.")
                .icon("🦅").maxLevel(5).baseGoldCost(500L).goldCostPerLevel(500L)
                .bonusDescription("+3% Crit Rate • +0.06 Attack Speed per level")
                .statBonusesJson("{\"critRate\":3.0,\"atkSpeed\":0.06}").build(),
            com.worldhero.model.entity.SkillConfigEntity.builder()
                .id("ranger_venom_arrow").heroClass(com.worldhero.model.enums.HeroClass.RANGER).skillId("venom_arrow")
                .name("Venom Arrow").description("Enchants arrows with poison and increases dodge chance.")
                .icon("🏹").maxLevel(5).baseGoldCost(500L).goldCostPerLevel(500L)
                .bonusDescription("+8% Elemental DMG • +3% Physical Dodge per level")
                .statBonusesJson("{\"elemDmgBonus\":8.0,\"physDodge\":3.0}").build(),
            com.worldhero.model.entity.SkillConfigEntity.builder()
                .id("ranger_deadly_sniping").heroClass(com.worldhero.model.enums.HeroClass.RANGER).skillId("deadly_sniping")
                .name("Deadly Sniping").description("Armor-piercing sniping shot dealing lethal critical damage.")
                .icon("🎯").maxLevel(5).baseGoldCost(500L).goldCostPerLevel(500L)
                .bonusDescription("+15% Crit DMG • +8 Phys ATK per level")
                .statBonusesJson("{\"critDmg\":15.0,\"physAtk\":8.0}").build(),

            // MAGE
            com.worldhero.model.entity.SkillConfigEntity.builder()
                .id("mage_mana_flow").heroClass(com.worldhero.model.enums.HeroClass.MAGE).skillId("mana_flow")
                .name("Mana Flow").description("Amplifies magic power and accelerates cooldown recovery.")
                .icon("🔮").maxLevel(5).baseGoldCost(500L).goldCostPerLevel(500L)
                .bonusDescription("+12 Magic ATK • +3% Cooldown Reduction per level")
                .statBonusesJson("{\"magicAtk\":12.0,\"cdr\":3.0}").build(),
            com.worldhero.model.entity.SkillConfigEntity.builder()
                .id("mage_pyroblast").heroClass(com.worldhero.model.enums.HeroClass.MAGE).skillId("pyroblast")
                .name("Pyroblast").description("Summons devastating fireballs and enhances spell evasion.")
                .icon("🔥").maxLevel(5).baseGoldCost(500L).goldCostPerLevel(500L)
                .bonusDescription("+10% Fire DMG • +4% Spell Evasion per level")
                .statBonusesJson("{\"elemDmgBonus\":10.0,\"spellEvasion\":4.0}").build(),
            com.worldhero.model.entity.SkillConfigEntity.builder()
                .id("mage_void_blizzard").heroClass(com.worldhero.model.enums.HeroClass.MAGE).skillId("void_blizzard")
                .name("Void Blizzard").description("Unleashes an abyssal blizzard increasing overall damage.")
                .icon("❄️").maxLevel(5).baseGoldCost(500L).goldCostPerLevel(500L)
                .bonusDescription("+5% Total ATK • +8% Elemental DMG per level")
                .statBonusesJson("{\"atkPercent\":5.0,\"elemDmgBonus\":8.0}").build(),

            // PRIEST
            com.worldhero.model.entity.SkillConfigEntity.builder()
                .id("priest_divine_aura").heroClass(com.worldhero.model.enums.HeroClass.PRIEST).skillId("divine_aura")
                .name("Divine Aura").description("Radiates holy light, regenerating HP and shielding the party.")
                .icon("✨").maxLevel(5).baseGoldCost(500L).goldCostPerLevel(500L)
                .bonusDescription("+12 HP/s Regen • +3% Damage Reduction per level")
                .statBonusesJson("{\"hpRegen\":12.0,\"dmgReduction\":3.0}").build(),
            com.worldhero.model.entity.SkillConfigEntity.builder()
                .id("priest_purification").heroClass(com.worldhero.model.enums.HeroClass.PRIEST).skillId("purification")
                .name("Purification").description("Cleanses curses and grants Chaos resistance.")
                .icon("🕯️").maxLevel(5).baseGoldCost(500L).goldCostPerLevel(500L)
                .bonusDescription("+8% Chaos Res • +4% Cooldown Reduction per level")
                .statBonusesJson("{\"chaosRes\":8.0,\"cdr\":4.0}").build(),
            com.worldhero.model.entity.SkillConfigEntity.builder()
                .id("priest_eternal_blessing").heroClass(com.worldhero.model.enums.HeroClass.PRIEST).skillId("eternal_blessing")
                .name("Eternal Blessing").description("Empowers vitality, boosting Max HP and all Elemental Resistances.")
                .icon("💖").maxLevel(5).baseGoldCost(500L).goldCostPerLevel(500L)
                .bonusDescription("+50 Max HP • +4% All Resistances per level")
                .statBonusesJson("{\"maxHp\":50.0,\"fireRes\":4.0,\"coldRes\":4.0,\"lightningRes\":4.0}").build()
        );
        skillConfigRepository.saveAll(skillConfigs);
        log.info("✅ Successfully seeded 12 Master Skill Nodes for 4 Classes!");
    }

    private void seedDropTablesAndStageWaves() {
        if (dropTableConfigRepository.count() == 0) {
            log.info("🗺️ Seeding Default Drop Tables for 4 Worlds...");
            List<com.worldhero.model.entity.DropTableConfigEntity> dropTables = new ArrayList<>();
            for (int world = 1; world <= 4; world++) {
                for (int stage = 1; stage <= 10; stage++) {
                    dropTables.add(com.worldhero.model.entity.DropTableConfigEntity.builder()
                            .worldIndex(world)
                            .stageIndex(stage)
                            .chestDropChance(0.03 + (stage - 1) * 0.005)
                            .bossChestDropChance(0.25 + (world - 1) * 0.05)
                            .stoneDropChance(0.40)
                            .goldMultiplier(1.0 + (world - 1) * 0.2 + (stage - 1) * 0.05)
                            .normalCommonWeight(0.60)
                            .normalUncommonWeight(0.28)
                            .normalRareWeight(0.10)
                            .normalEpicWeight(0.02)
                            .normalLegendaryWeight(0.00)
                            .bossCommonWeight(0.00)
                            .bossUncommonWeight(0.20)
                            .bossRareWeight(0.45)
                            .bossEpicWeight(0.30)
                            .bossLegendaryWeight(0.05)
                            .build());
                }
            }
            dropTableConfigRepository.saveAll(dropTables);
            log.info("✅ Successfully seeded 40 Drop Tables for all 4 Worlds!");
        } else {
            List<com.worldhero.model.entity.DropTableConfigEntity> all = dropTableConfigRepository.findAll();
            boolean needUpdate = false;
            for (var dt : all) {
                if (dt.getNormalCommonWeight() == 0.0 && dt.getNormalUncommonWeight() == 0.0 && dt.getNormalRareWeight() == 0.0) {
                    dt.setNormalCommonWeight(0.60);
                    dt.setNormalUncommonWeight(0.28);
                    dt.setNormalRareWeight(0.10);
                    dt.setNormalEpicWeight(0.02);
                    dt.setNormalLegendaryWeight(0.00);
                    dt.setBossCommonWeight(0.00);
                    dt.setBossUncommonWeight(0.20);
                    dt.setBossRareWeight(0.45);
                    dt.setBossEpicWeight(0.30);
                    dt.setBossLegendaryWeight(0.05);
                    needUpdate = true;
                }
            }
            if (needUpdate) {
                dropTableConfigRepository.saveAll(all);
            }
        }
    }

    private void seedItemTemplates() {
        if (templateRepository.count() > 0) {
            log.info("ℹ️ Item Templates already seeded ({} templates found).", templateRepository.count());
            return;
        }

        log.info("🌱 Seeding Master Item Templates into Database...");

        List<ItemTemplateEntity> templates = List.of(
            // --- WARRIOR GEAR ---
            ItemTemplateEntity.builder()
                .id("wpn_iron_sword")
                .name("Kiếm Sắt Tân Binh")
                .description("Vũ khí khởi đầu cân bằng của Đấu Sĩ.")
                .iconKey("⚔️")
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.PHYSICAL)
                .basePhysAtk(25.0).baseAtkPercent(2.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_royal_claymore")
                .name("Đại Kiếm Hoàng Gia")
                .description("Rèn từ thép titan tôi luyện trong lửa dung nham.")
                .iconKey("🗡️")
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.RARE)
                .elementalType(ElementalType.PHYSICAL)
                .basePhysAtk(65.0).baseCritRate(5.0).baseElemDmgBonus(10.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_excalibur")
                .name("Thánh Kiếm Excalibur")
                .description("Vũ khí huyền thoại chém đứt màn đêm và ban phước lành vĩnh cửu.")
                .iconKey("✨")
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.LEGENDARY)
                .elementalType(ElementalType.PHYSICAL)
                .basePhysAtk(180.0).baseCritRate(15.0).baseCritDmg(35.0).baseLifeSteal(10.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("shd_iron_shield")
                .name("Khiên Thép Hộ Mệnh")
                .description("Bảo vệ kiên cố trước mọi đòn tấn công vật lý.")
                .iconKey("🛡️")
                .slotType(ItemSlot.OFF_HAND)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.UNCOMMON)
                .elementalType(ElementalType.PHYSICAL)
                .baseArmor(40.0).baseMaxHp(80.0).baseDmgReduction(3.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("shd_aegis_bulwark")
                .name("Khiên Thần Aegis")
                .description("Chiếc khiên huyền thoại chặn đứng cả đòn đánh của Thần Linh.")
                .iconKey("🔰")
                .slotType(ItemSlot.OFF_HAND)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.EPIC)
                .elementalType(ElementalType.PHYSICAL)
                .baseArmor(120.0).baseMaxHp(250.0).baseDmgReduction(8.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("arm_plate_chest")
                .name("Giáp Tấm Chiến Binh")
                .description("Giáp sắt dày tăng sức chống chịu tối đa.")
                .iconKey("🥋")
                .slotType(ItemSlot.ARMOR)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(30.0).baseMaxHp(50.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("hlm_iron_helm")
                .name("Mũ Sắt Chiến Binh")
                .description("Mũ sắt bảo vệ phần đầu trước đòn chí mạng.")
                .iconKey("🪖")
                .slotType(ItemSlot.HELMET)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(20.0).baseMaxHp(30.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("pnt_iron_greaves")
                .name("Quần Giáp Thép")
                .description("Bảo vệ đôi chân kiên cố khi càn quét chiến trường.")
                .iconKey("👖")
                .slotType(ItemSlot.PANTS)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(20.0).baseMaxHp(30.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("bot_iron_boots")
                .name("Ủng Thép Tân Binh")
                .description("Ủng thép vững chãi giúp trụ vững trước quái thú.")
                .iconKey("🥾")
                .slotType(ItemSlot.BOOTS)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(15.0).baseAtkSpeed(0.05)
                .build(),

            // --- RANGER GEAR ---
            ItemTemplateEntity.builder()
                .id("wpn_hunting_bow")
                .name("Cung Săn Gió Lốc")
                .description("Bắn nhanh, chính xác và có khả năng xuyên giáp mục tiêu.")
                .iconKey("🏹")
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.PHYSICAL)
                .basePhysAtk(30.0).baseAtkSpeed(0.2).baseCritRate(8.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_windrunner_bow")
                .name("Thần Cung Gió Lốc")
                .description("Mỗi mũi tên bắn ra xé toạc không gian với tốc độ thần tốc.")
                .iconKey("🎯")
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.EPIC)
                .elementalType(ElementalType.COLD)
                .basePhysAtk(90.0).baseAtkSpeed(0.35).baseCritRate(15.0).baseCritDmg(30.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_phantom_quiver")
                .name("Ống Tên Bóng Ma")
                .description("Ống tên vô tận giúp xạ thủ duy trì hỏa lực liên tục.")
                .iconKey("🎒")
                .slotType(ItemSlot.OFF_HAND)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.UNCOMMON)
                .basePhysAtk(15.0).baseAtkSpeed(0.15).baseCritRate(5.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("arm_leather_vest")
                .name("Áo Giáp Da Tân Binh")
                .description("Áo da nhẹ giúp di chuyển linh hoạt và né đòn tốt hơn.")
                .iconKey("🦺")
                .slotType(ItemSlot.ARMOR)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(15.0).baseMaxHp(40.0).basePhysDodge(5.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("hlm_leather_cap")
                .name("Mũ Da Thợ Săn")
                .description("Mũ da giúp tăng tầm nhìn và sự tập trung chí mạng.")
                .iconKey("🧢")
                .slotType(ItemSlot.HELMET)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(10.0).baseMaxHp(25.0).baseCritRate(3.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("pnt_leather_pants")
                .name("Quần Da Thợ Săn")
                .description("Quần da dẻo dai hỗ trợ né tránh đòn đánh.")
                .iconKey("👖")
                .slotType(ItemSlot.PANTS)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(12.0).baseMaxHp(30.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("bot_leather_boots")
                .name("Giày Da Tốc Độ")
                .description("Giày da nhẹ tăng tốc độ chạy và né đòn hiểm.")
                .iconKey("👟")
                .slotType(ItemSlot.BOOTS)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(10.0).baseAtkSpeed(0.1).basePhysDodge(4.0)
                .build(),

            // --- MAGE GEAR ---
            ItemTemplateEntity.builder()
                .id("wpn_apprentice_wand")
                .name("Đũa Phép Học Việc")
                .description("Đũa phép cơ bản tụ khí ma thuật nguyên sơ.")
                .iconKey("🪄")
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.FIRE)
                .baseMagicAtk(30.0).baseAtkPercent(5.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_fire_staff")
                .name("Trượng Hỏa Xà")
                .description("Kêu gọi sức mạnh của lửa thiêu rụi toàn bộ kẻ thù.")
                .iconKey("🔥")
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.RARE)
                .elementalType(ElementalType.FIRE)
                .baseMagicAtk(65.0).baseAtkPercent(8.0).baseElemDmgBonus(15.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_void_orb")
                .name("Cầu Ma Pháp Hư Không")
                .description("Tích tụ năng lượng hư không giảm thời gian hồi chiêu.")
                .iconKey("🔮")
                .slotType(ItemSlot.OFF_HAND)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.UNCOMMON)
                .elementalType(ElementalType.CHAOS)
                .baseMagicAtk(25.0).baseCdr(5.0).baseSpellEvasion(5.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("arm_silk_robe")
                .name("Áo Choàng Pháp Sư")
                .description("Áo lụa dệt bằng sợi ma pháp giúp né đòn phép thuật.")
                .iconKey("🥋")
                .slotType(ItemSlot.ARMOR)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(10.0).baseMaxHp(35.0).baseSpellEvasion(5.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("hlm_wizard_hat")
                .name("Nón Pháp Sư")
                .description("Chiếc nón chóp nhọn chứa đựng bí thuật cổ xưa.")
                .iconKey("🧙")
                .slotType(ItemSlot.HELMET)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(8.0).baseMaxHp(20.0).baseCdr(3.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("pnt_silk_pants")
                .name("Quần Lụa Ma Pháp")
                .description("Quần lụa nhẹ nhàng hỗ trợ thi triển phép.")
                .iconKey("👖")
                .slotType(ItemSlot.PANTS)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(10.0).baseMaxHp(25.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("bot_silk_shoes")
                .name("Giày Vải Phù Thủy")
                .description("Giày ma pháp di chuyển êm ái không tiếng động.")
                .iconKey("👞")
                .slotType(ItemSlot.BOOTS)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(8.0).baseCdr(2.0)
                .build(),

            // --- PRIEST GEAR ---
            ItemTemplateEntity.builder()
                .id("wpn_holy_mace")
                .name("Chùy Thánh Khởi Đầu")
                .description("Vũ khí ban phước hỗ trợ hồi máu liên tục cho đồng đội.")
                .iconKey("🔨")
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.PRIEST)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.CHAOS)
                .basePhysAtk(20.0).baseMagicAtk(20.0).baseHpRegen(10.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_holy_bell")
                .name("Chuông Thánh Cứu Rỗi")
                .description("Hồi phục sinh lực và tạo hộ thuẫn bảo vệ đội hình.")
                .iconKey("🔔")
                .slotType(ItemSlot.OFF_HAND)
                .requiredClass(HeroClass.PRIEST)
                .baseRarity(ItemRarity.UNCOMMON)
                .elementalType(ElementalType.CHAOS)
                .baseMaxHp(60.0).baseHpRegen(15.0).baseCdr(5.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("arm_priest_vestment")
                .name("Áo Tế Lễ Thánh Đường")
                .description("Áo choàng thánh thanh tẩy mọi tà niệm và hồi phục HP.")
                .iconKey("🥋")
                .slotType(ItemSlot.ARMOR)
                .requiredClass(HeroClass.PRIEST)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(15.0).baseMaxHp(50.0).baseHpRegen(8.0)
                .build(),

            // --- UNIVERSAL ACCESSORIES (CRAFTABLE / BOSS DROPS) ---
            ItemTemplateEntity.builder()
                .id("acc_ruby_ring")
                .name("Nhẫn Hồng Ngọc")
                .description("Tăng sát thương công kích toàn diện cho người đeo.")
                .iconKey("💍")
                .slotType(ItemSlot.RING_1)
                .requiredClass(null) // Universal
                .baseRarity(ItemRarity.UNCOMMON)
                .basePhysAtk(15.0).baseMagicAtk(15.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("acc_emerald_ring")
                .name("Nhẫn Lục Bảo")
                .description("Tăng mạnh tỷ lệ và sát thương đòn chí mạng.")
                .iconKey("💍")
                .slotType(ItemSlot.RING_2)
                .requiredClass(null) // Universal
                .baseRarity(ItemRarity.RARE)
                .baseCritRate(8.0).baseCritDmg(20.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("acc_heart_amulet")
                .name("Dây Chuyền Trái Tim Rồng")
                .description("Ban tặng sinh lực dồi dào và khả năng hút máu kẻ thù.")
                .iconKey("📿")
                .slotType(ItemSlot.NECKLACE)
                .requiredClass(null) // Universal
                .baseRarity(ItemRarity.RARE)
                .baseMaxHp(120.0).baseHpRegen(10.0).baseLifeSteal(3.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("acc_dragon_talisman")
                .name("Bùa Hộ Mệnh Long Thần")
                .description("Bảo vật cổ truyền giảm sát thương gánh chịu và tăng uy lực.")
                .iconKey("🧿")
                .slotType(ItemSlot.TALISMAN)
                .requiredClass(null) // Universal
                .baseRarity(ItemRarity.EPIC)
                .basePhysAtk(25.0).baseMagicAtk(25.0).baseDmgReduction(5.0).baseCdr(5.0)
                .build()
        );

        templateRepository.saveAll(templates);
        log.info("✅ Successfully seeded {} Item Templates!", templates.size());
    }

    private void seedDefaultDemoUser() {
        if (userRepository.count() > 0) {
            log.info("ℹ️ User data already exists ({} users found).", userRepository.count());
            return;
        }

        log.info("🌱 Seeding Default Demo User and Starting Party...");

        UserEntity demoUser = UserEntity.builder()
            .worldIdHash("nullifier_demo_arthur_01")
            .displayName("Arthur Pendragon")
            .gold(5000L)
            .gems(50)
            .enhanceStones(20)
            .currentWorld(1)
            .currentStage(1)
            .currentWave(1)
            .maxClearedStage(0)
            .piggyBankGems(150)
            .isGoldenPassActive(false)
            .loginDayIndex(0)
            .growthFundUnlocked(false)
            .growthFundClaimedStages("[]")
            .build();

        demoUser = userRepository.save(demoUser);

        // Create 4 Class Heroes
        HeroEntity warrior = HeroEntity.builder()
            .user(demoUser)
            .heroClass(HeroClass.WARRIOR)
            .level(1)
            .exp(0)
            .isInParty(true)
            .slotIndex(0)
            .build();

        HeroEntity ranger = HeroEntity.builder()
            .user(demoUser)
            .heroClass(HeroClass.RANGER)
            .level(1)
            .exp(0)
            .isInParty(true)
            .slotIndex(1)
            .build();

        HeroEntity mage = HeroEntity.builder()
            .user(demoUser)
            .heroClass(HeroClass.MAGE)
            .level(1)
            .exp(0)
            .isInParty(true)
            .slotIndex(2)
            .build();

        HeroEntity priest = HeroEntity.builder()
            .user(demoUser)
            .heroClass(HeroClass.PRIEST)
            .level(1)
            .exp(0)
            .isInParty(false)
            .slotIndex(-1)
            .build();

        warrior = heroRepository.save(warrior);
        ranger = heroRepository.save(ranger);
        mage = heroRepository.save(mage);
        priest = heroRepository.save(priest);

        // Equip Starter Items
        ItemTemplateEntity swordTpl = templateRepository.findById("wpn_iron_sword").orElse(null);
        ItemTemplateEntity shieldTpl = templateRepository.findById("shd_iron_shield").orElse(null);
        ItemTemplateEntity bowTpl = templateRepository.findById("wpn_hunting_bow").orElse(null);
        ItemTemplateEntity staffTpl = templateRepository.findById("wpn_fire_staff").orElse(null);

        if (swordTpl != null) {
            instanceRepository.save(ItemInstanceEntity.builder()
                .user(demoUser)
                .hero(warrior)
                .equippedSlot(ItemSlot.MAIN_HAND)
                .template(swordTpl)
                .itemLevel(1)
                .currentRarity(ItemRarity.COMMON)
                .enhanceLevel(1)
                .sockets("[]")
                .subStats("{}")
                .build());
        }

        if (shieldTpl != null) {
            instanceRepository.save(ItemInstanceEntity.builder()
                .user(demoUser)
                .hero(warrior)
                .equippedSlot(ItemSlot.OFF_HAND)
                .template(shieldTpl)
                .itemLevel(1)
                .currentRarity(ItemRarity.UNCOMMON)
                .enhanceLevel(0)
                .sockets("[]")
                .subStats("{}")
                .build());
        }

        if (bowTpl != null) {
            instanceRepository.save(ItemInstanceEntity.builder()
                .user(demoUser)
                .hero(ranger)
                .equippedSlot(ItemSlot.MAIN_HAND)
                .template(bowTpl)
                .itemLevel(1)
                .currentRarity(ItemRarity.COMMON)
                .enhanceLevel(2)
                .sockets("[]")
                .subStats("{}")
                .build());
        }

        if (staffTpl != null) {
            instanceRepository.save(ItemInstanceEntity.builder()
                .user(demoUser)
                .hero(mage)
                .equippedSlot(ItemSlot.MAIN_HAND)
                .template(staffTpl)
                .itemLevel(1)
                .currentRarity(ItemRarity.RARE)
                .enhanceLevel(0)
                .sockets("[]")
                .subStats("{}")
                .build());
        }

        // Seed some items in Bag for testing equip/cube
        ItemTemplateEntity ringTpl = templateRepository.findById("acc_ruby_ring").orElse(null);
        ItemTemplateEntity claymoreTpl = templateRepository.findById("wpn_royal_claymore").orElse(null);

        if (ringTpl != null) {
            instanceRepository.save(ItemInstanceEntity.builder()
                .user(demoUser)
                .hero(null) // in bag
                .equippedSlot(null)
                .template(ringTpl)
                .itemLevel(1)
                .currentRarity(ItemRarity.UNCOMMON)
                .enhanceLevel(0)
                .sockets("[]")
                .subStats("{}")
                .build());
        }

        if (claymoreTpl != null) {
            instanceRepository.save(ItemInstanceEntity.builder()
                .user(demoUser)
                .hero(null) // in bag
                .equippedSlot(null)
                .template(claymoreTpl)
                .itemLevel(1)
                .currentRarity(ItemRarity.RARE)
                .enhanceLevel(3)
                .sockets("[\"RUBY_T1\"]")
                .subStats("{}")
                .build());
        }

        log.info("✅ Successfully seeded Demo User with 4 Heroes, starter gear & bag items!");
    }
}
