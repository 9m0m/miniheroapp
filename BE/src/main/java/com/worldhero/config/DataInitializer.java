package com.worldhero.config;

import com.worldhero.model.entity.HeroEntity;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.ItemTemplateEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.ElementalType;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.ItemSlot;
import com.worldhero.model.enums.ItemType;
import com.worldhero.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
    private final SkillConfigRepository skillConfigRepository;
    private final DropTableConfigRepository dropTableConfigRepository;
    private final QuestTemplateRepository questTemplateRepository;
    private final OnboardingStateRepository onboardingStateRepository;

    private final Environment environment;

    @org.springframework.beans.factory.annotation.Value("${app.admin.username:superadmin}")
    private String adminUsername;

    @org.springframework.beans.factory.annotation.Value("${app.admin.password:adminpassword123}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        seedItemTemplates();
        if (environment.acceptsProfiles(Profiles.of("dev", "test"))) {
            seedDefaultDemoUser();
            seedSuperAdminUser();
        }
        seedSkillConfigs();
        seedDropTables();
        seedDefaultQuests();
    }

    private void seedDefaultQuests() {
        if (questTemplateRepository.count() > 0) return;

        log.info("📜 Seeding Default Daily & Weekly Quests into Database...");
        List<com.worldhero.model.entity.QuestTemplateEntity> quests = List.of(
            com.worldhero.model.entity.QuestTemplateEntity.builder()
                .id("daily_open_chests")
                .title("Treasure Seeker")
                .description("Open 2 equipment loot chests from Core rewards.")
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
                .sortOrder(1)
                .isActive(true)
                .build()
        );

        questTemplateRepository.saveAll(quests);
        log.info("✅ Successfully seeded 2 Core Master Quests!");
    }

    private void seedSuperAdminUser() {
        if (adminUserRepository.findByUsername(adminUsername).isEmpty()) {
            String encodedPassword = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(adminPassword);
            adminUserRepository.save(com.worldhero.model.entity.AdminUserEntity.builder()
                    .username(adminUsername)
                    .password(encodedPassword)
                    .role(com.worldhero.model.enums.AdminRole.ROLE_SUPERADMIN)
                    .build());
            log.info("👑 Initialized SuperAdmin User ('{}') with BCrypt password in Database!", adminUsername);
        }
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

    private void seedDropTables() {
        if (dropTableConfigRepository.count() == 0) {
            log.info("Seeding Core default drop table...");
            dropTableConfigRepository.save(com.worldhero.model.entity.DropTableConfigEntity.builder()
                    .worldIndex(1)
                    .stageIndex(1)
                    .chestDropChance(1.0)
                    .bossChestDropChance(0.0)
                    .stoneDropChance(0.40)
                    .goldMultiplier(1.0)
                    .normalCommonWeight(0.60)
                    .normalUncommonWeight(0.28)
                    .normalRareWeight(0.10)
                    .normalEpicWeight(0.02)
                    .normalLegendaryWeight(0.00)
                    .bossCommonWeight(0.00)
                    .bossUncommonWeight(0.00)
                    .bossRareWeight(0.00)
                    .bossEpicWeight(0.00)
                    .bossLegendaryWeight(0.00)
                    .build());
            log.info("Core default drop table seeded.");
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
        log.info("🌱 Seeding/Updating Master Item Templates into Database in 100% English...");

        List<ItemTemplateEntity> templates = List.of(
            // --- CHESTS ---
            ItemTemplateEntity.builder()
                .id("chest_normal")
                .name("Normal Wooden Chest")
                .description("Basic chest dropped by wild monsters. Contains common gear and crafting materials.")
                .iconKey("chest_wooden")
                .itemType(ItemType.CHEST)
                .slotType(ItemSlot.TALISMAN)
                .requiredClass(null)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.PHYSICAL)
                .build(),

            // --- MATERIALS ---
            ItemTemplateEntity.builder()
                .id("mat_iron_ore")
                .name("Raw Iron Ore")
                .description("Basic mineral extracted from mountain quarries, used for weapon crafting.")
                .iconKey("ore_iron")
                .itemType(ItemType.MATERIAL)
                .slotType(ItemSlot.TALISMAN)
                .requiredClass(null)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.PHYSICAL)
                .build(),

            ItemTemplateEntity.builder()
                .id("mat_beast_leather")
                .name("Tough Beast Leather")
                .description("Durable hides stripped from wild predators, used for armor tailoring.")
                .iconKey("leather_beast")
                .itemType(ItemType.MATERIAL)
                .slotType(ItemSlot.TALISMAN)
                .requiredClass(null)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.PHYSICAL)
                .build(),

            ItemTemplateEntity.builder()
                .id("mat_arcane_dust")
                .name("Glimmering Arcane Dust")
                .description("Refined magical residue required for enchanting and transmutation.")
                .iconKey("dust_arcane")
                .itemType(ItemType.MATERIAL)
                .slotType(ItemSlot.TALISMAN)
                .requiredClass(null)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.FIRE)
                .build(),

            // --- GEMS ---
            ItemTemplateEntity.builder()
                .id("gem_ruby_t1")
                .name("Chipped Ruby (Tier 1)")
                .description("Inlay into sockets to increase Physical ATK and Fire Damage.")
                .iconKey("gem_ruby")
                .itemType(ItemType.GEM)
                .slotType(ItemSlot.TALISMAN)
                .requiredClass(null)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.FIRE)
                .basePhysAtk(6.0).baseElemDmgBonus(2.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("gem_emerald_t1")
                .name("Chipped Emerald (Tier 1)")
                .description("Inlay into sockets to increase Attack Speed and Critical Rate.")
                .iconKey("gem_emerald")
                .itemType(ItemType.GEM)
                .slotType(ItemSlot.TALISMAN)
                .requiredClass(null)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.PHYSICAL)
                .baseAtkSpeed(0.05).baseCritRate(1.5)
                .build(),

            ItemTemplateEntity.builder()
                .id("gem_sapphire_t1")
                .name("Chipped Sapphire (Tier 1)")
                .description("Inlay into sockets to increase Magic ATK and Max HP.")
                .iconKey("gem_sapphire")
                .itemType(ItemType.GEM)
                .slotType(ItemSlot.TALISMAN)
                .requiredClass(null)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.COLD)
                .baseMagicAtk(6.0).baseMaxHp(25.0)
                .build(),

            // --- WARRIOR GEAR ---
            ItemTemplateEntity.builder()
                .id("wpn_iron_sword")
                .name("Novice Iron Sword")
                .description("Reliable basic blade forged for beginner vanguard warriors.")
                .iconKey("sword_iron")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.PHYSICAL)
                .basePhysAtk(15.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_royal_claymore")
                .name("Royal Claymore")
                .description("Forged from tempered titan steel with molten edges.")
                .iconKey("sword_claymore")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.RARE)
                .elementalType(ElementalType.PHYSICAL)
                .basePhysAtk(45.0).baseAtkPercent(3.0).baseElemDmgBonus(4.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_excalibur")
                .name("Holy Blade Excalibur")
                .description("Legendary holy sword cleaving through darkness with divine light.")
                .iconKey("sword_holy")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.LEGENDARY)
                .elementalType(ElementalType.PHYSICAL)
                .basePhysAtk(125.0).baseCritRate(8.0).baseCritDmg(20.0).baseLifeSteal(5.0).baseAtkPercent(5.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("shd_iron_shield")
                .name("Novice Iron Shield")
                .description("Solid heavy shield deflecting physical blows.")
                .iconKey("shield_iron")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.OFF_HAND)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.PHYSICAL)
                .baseArmor(12.0).baseMaxHp(25.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("shd_aegis_bulwark")
                .name("Aegis Bulwark Shield")
                .description("Mythical divine bulwark absorbing catastrophic incoming damage.")
                .iconKey("shield_aegis")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.OFF_HAND)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.EPIC)
                .elementalType(ElementalType.PHYSICAL)
                .baseArmor(65.0).baseMaxHp(150.0).baseDmgReduction(4.0).baseHpRegen(4.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("arm_plate_chest")
                .name("Iron Plate Cuirass")
                .description("Heavy iron armor plating defending vital organs.")
                .iconKey("armor_plate")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.ARMOR)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(15.0).baseMaxHp(30.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("hlm_iron_helm")
                .name("Iron Guard Greathelm")
                .description("Solid forged helmet shielding the skull from fatal blows.")
                .iconKey("helm_iron")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.HELMET)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(8.0).baseMaxHp(15.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("pnt_iron_greaves")
                .name("Iron Plate Greaves")
                .description("Reinforced leg armor protecting joints in close combat.")
                .iconKey("pants_iron")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.PANTS)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(10.0).baseMaxHp(20.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("bot_iron_boots")
                .name("Steel Heavy Sabatons")
                .description("Sturdy armored footwear ensuring grounded balance.")
                .iconKey("boots_iron")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.BOOTS)
                .requiredClass(HeroClass.WARRIOR)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(6.0).basePhysAtk(2.0)
                .build(),

            // --- RANGER GEAR ---
            ItemTemplateEntity.builder()
                .id("wpn_hunting_bow")
                .name("Recurve Hunting Bow")
                .description("Light bow built for swift ranged sniping.")
                .iconKey("bow_recurve")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.PHYSICAL)
                .basePhysAtk(16.0).baseAtkSpeed(0.05)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_windrunner_bow")
                .name("Windrunner Greatbow")
                .description("Fires razor-sharp gale arrows tearing through enemy formations.")
                .iconKey("bow_wind")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.EPIC)
                .elementalType(ElementalType.COLD)
                .basePhysAtk(65.0).baseAtkSpeed(0.15).baseCritRate(5.0).baseCritDmg(12.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_phantom_quiver")
                .name("Phantom Leather Quiver")
                .description("Leather arrow quiver enabling sustained rapid firing.")
                .iconKey("quiver_leather")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.OFF_HAND)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.COMMON)
                .basePhysAtk(6.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("arm_leather_vest")
                .name("Scout Leather Tunic")
                .description("Supple treated leather vest maximizing combat agility.")
                .iconKey("tunic_leather")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.ARMOR)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(10.0).baseMaxHp(25.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("hlm_leather_cap")
                .name("Scout Camo Hood")
                .description("Lightweight leather hood enhancing peripheral vision.")
                .iconKey("hood_leather")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.HELMET)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(5.0).baseMaxHp(12.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("pnt_leather_pants")
                .name("Ranger Leather Breeches")
                .description("Flexible leather trousers tailored for swift dodging.")
                .iconKey("pants_leather")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.PANTS)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(7.0).baseMaxHp(18.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("bot_leather_boots")
                .name("Swift Leather Boots")
                .description("Silent footsteps granting swift combat repositioning.")
                .iconKey("boots_leather")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.BOOTS)
                .requiredClass(HeroClass.RANGER)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(4.0).basePhysAtk(2.0)
                .build(),

            // --- MAGE GEAR ---
            ItemTemplateEntity.builder()
                .id("wpn_apprentice_wand")
                .name("Apprentice Ash Wand")
                .description("Primal focus wand concentrating elemental arcane bursts.")
                .iconKey("wand_ash")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.FIRE)
                .baseMagicAtk(18.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_fire_staff")
                .name("Serpent Fire Staff")
                .description("Summons blazing inferno waves that incinerate enemy ranks.")
                .iconKey("staff_fire")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.RARE)
                .elementalType(ElementalType.FIRE)
                .baseMagicAtk(45.0).baseAtkPercent(4.0).baseElemDmgBonus(5.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_void_orb")
                .name("Void Resonance Orb")
                .description("Harnesses void essence to accelerate spell cooldowns.")
                .iconKey("orb_void")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.OFF_HAND)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.CHAOS)
                .baseMagicAtk(8.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("arm_silk_robe")
                .name("Arcane Silk Robe")
                .description("Woven with mana fibers to disperse enemy magical damage.")
                .iconKey("robe_silk")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.ARMOR)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(5.0).baseMagicAtk(5.0).baseMaxHp(18.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("hlm_wizard_hat")
                .name("Sorcerer Pointed Hat")
                .description("Ancient mystical hat imbued with deep arcane wisdom.")
                .iconKey("hat_wizard")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.HELMET)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(3.0).baseMagicAtk(3.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("pnt_silk_pants")
                .name("Mystic Silk Trousers")
                .description("Lightweight silk skirt facilitating rapid spell incantations.")
                .iconKey("pants_silk")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.PANTS)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(4.0).baseMagicAtk(3.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("bot_silk_shoes")
                .name("Spellweaver Slippers")
                .description("Enchanted footwear enabling silent floating strides.")
                .iconKey("shoes_silk")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.BOOTS)
                .requiredClass(HeroClass.MAGE)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(3.0).baseMagicAtk(2.0)
                .build(),

            // --- PRIEST GEAR ---
            ItemTemplateEntity.builder()
                .id("wpn_holy_mace")
                .name("Sanctified Holy Mace")
                .description("Blessed blunt weapon channeling continuous team healing.")
                .iconKey("mace_holy")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.PRIEST)
                .baseRarity(ItemRarity.COMMON)
                .elementalType(ElementalType.CHAOS)
                .baseMagicAtk(15.0).baseMaxHp(20.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("wpn_holy_bell")
                .name("Resonance Holy Chime")
                .description("Restores squad vitality and erects protective holy shields.")
                .iconKey("bell_holy")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.OFF_HAND)
                .requiredClass(HeroClass.PRIEST)
                .baseRarity(ItemRarity.UNCOMMON)
                .elementalType(ElementalType.CHAOS)
                .baseMagicAtk(18.0).baseMaxHp(40.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("arm_priest_vestment")
                .name("Cleric Sacred Vestment")
                .description("Purifying ceremonial vestments enhancing health recovery.")
                .iconKey("vestment_priest")
                .itemType(ItemType.EQUIPMENT)
                .slotType(ItemSlot.ARMOR)
                .requiredClass(HeroClass.PRIEST)
                .baseRarity(ItemRarity.COMMON)
                .baseArmor(8.0).baseMaxHp(35.0)
                .build(),

            // --- UNIVERSAL ACCESSORIES ---
            ItemTemplateEntity.builder()
                .id("acc_ruby_ring")
                .name("Ruby Battle Band")
                .description("Empowers overall physical and magical attack power.")
                .iconKey("ring_ruby")
                .itemType(ItemType.ACCESSORY)
                .slotType(ItemSlot.RING_1)
                .requiredClass(null)
                .baseRarity(ItemRarity.UNCOMMON)
                .basePhysAtk(6.0).baseMagicAtk(6.0).baseAtkPercent(2.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("acc_emerald_ring")
                .name("Emerald Signet Ring")
                .description("Special ring boosting critical strike rate and speed.")
                .iconKey("ring_emerald")
                .itemType(ItemType.ACCESSORY)
                .slotType(ItemSlot.RING_1)
                .requiredClass(null)
                .baseRarity(ItemRarity.RARE)
                .baseCritRate(3.0).baseCritDmg(6.0).baseAtkSpeed(0.03)
                .build(),

            ItemTemplateEntity.builder()
                .id("acc_copper_ring")
                .name("Polished Copper Ring")
                .description("Simple copper band imbued with subtle vigor.")
                .iconKey("ring_copper")
                .itemType(ItemType.ACCESSORY)
                .slotType(ItemSlot.RING_1)
                .requiredClass(null)
                .baseRarity(ItemRarity.COMMON)
                .basePhysAtk(3.0).baseMagicAtk(3.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("acc_stone_talisman")
                .name("Ancient Stone Talisman")
                .description("Weathered runic stone warding off dark energies.")
                .iconKey("talisman_stone")
                .itemType(ItemType.ACCESSORY)
                .slotType(ItemSlot.TALISMAN)
                .requiredClass(null)
                .baseRarity(ItemRarity.COMMON)
                .baseMaxHp(25.0).baseArmor(4.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("acc_wooden_amulet")
                .name("Oak Tree Talisman")
                .description("Carved oak talisman granting fortitude.")
                .iconKey("amulet_oak")
                .itemType(ItemType.ACCESSORY)
                .slotType(ItemSlot.TALISMAN)
                .requiredClass(null)
                .baseRarity(ItemRarity.COMMON)
                .baseMaxHp(30.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("acc_heart_amulet")
                .name("Dragon Heart Talisman")
                .description("Bestows immense vitality and vampiric lifesteal.")
                .iconKey("amulet_heart")
                .itemType(ItemType.ACCESSORY)
                .slotType(ItemSlot.TALISMAN)
                .requiredClass(null)
                .baseRarity(ItemRarity.RARE)
                .baseMaxHp(80.0).baseHpRegen(6.0).baseLifeSteal(3.0)
                .build(),

            ItemTemplateEntity.builder()
                .id("acc_dragon_talisman")
                .name("Dragon Ward Talisman")
                .description("Ancient relic granting damage reduction and cooldown recovery.")
                .iconKey("talisman_dragon")
                .itemType(ItemType.ACCESSORY)
                .slotType(ItemSlot.TALISMAN)
                .requiredClass(null)
                .baseRarity(ItemRarity.EPIC)
                .basePhysAtk(15.0).baseMagicAtk(15.0).baseDmgReduction(4.0).baseCdr(4.0)
                .build()
        );

        templateRepository.saveAll(templates);
        log.info("✅ Successfully saved {} 100% English Item Templates with ItemType!", templates.size());
    }

    private void seedDefaultDemoUser() {
        if (userRepository.count() > 0) {
            log.info("ℹ️ User data already exists ({} users found).", userRepository.count());
            return;
        }

        log.info("🌱 Seeding Default Fresh Demo User (Zero Heroes, Ready for Onboarding Tutorial)...");

        UserEntity demoUser = UserEntity.builder()
            .worldIdHash("nullifier_demo_arthur_01")
            .displayName("Arthur Pendragon")
            .gold(0L)
            .gems(0)
            .enhanceStones(0)
            .standardSummonTickets(0)
            .piggyBankGems(0)
            .isGoldenPassActive(false)
            .loginDayIndex(0)
            .build();

        demoUser = userRepository.save(demoUser);

        // Seed fresh Onboarding State
        onboardingStateRepository.save(com.worldhero.model.entity.OnboardingStateEntity.builder()
            .user(demoUser)
            .step(com.worldhero.model.enums.OnboardingStep.WELCOME)
            .lifetimePulls(0)
            .knightSummoned(false)
            .rangerSummoned(false)
            .thirdSummonCompleted(false)
            .firstExpeditionClaimed(false)
            .build());

        log.info("✅ Successfully initialized fresh Demo User with 0 heroes, ready for Step 1 Onboarding Tutorial!");
    }
}
