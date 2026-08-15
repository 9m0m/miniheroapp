package com.worldhero.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldhero.dto.HeroDetailDto;
import com.worldhero.dto.HeroSkillTreeDto;
import com.worldhero.dto.SkillNodeDto;
import com.worldhero.dto.StatsDto;
import com.worldhero.dto.UpgradeSkillRequestDto;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.InsufficientResourceException;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.HeroEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.repository.HeroRepository;
import com.worldhero.repository.SkillConfigRepository;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.HeroService;
import com.worldhero.service.SkillService;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillServiceImpl implements SkillService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    public static final int MAX_SKILL_LEVEL = 5;

    private final HeroRepository heroRepository;
    private final UserRepository userRepository;
    private final SkillConfigRepository skillConfigRepository;
    private final UserService userService;
    private final HeroService heroService;

    @Override
    @Transactional(readOnly = true)
    public HeroSkillTreeDto getSkillTree(UUID heroId) {
        HeroEntity hero = heroRepository.findById(heroId)
                .orElseThrow(() -> new ResourceNotFoundException("Hero not found: " + heroId));

        Map<String, Integer> currentSkills = parseSkills(hero.getSkills());
        List<SkillNodeDto> nodes = getSkillNodesForClass(hero.getHeroClass(), currentSkills);

        return HeroSkillTreeDto.builder()
                .heroId(hero.getId())
                .heroClass(hero.getHeroClass())
                .heroName(getHeroName(hero.getHeroClass()))
                .nodes(nodes)
                .build();
    }

    @Override
    @Transactional
    public HeroDetailDto upgradeSkill(UpgradeSkillRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        HeroEntity hero = heroRepository.findById(request.getHeroId())
                .orElseThrow(() -> new ResourceNotFoundException("Hero not found: " + request.getHeroId()));

        if (!hero.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Hero does not belong to this user.");
        }

        Map<String, Integer> skills = parseSkills(hero.getSkills());
        int currentLvl = skills.getOrDefault(request.getSkillId(), 0);

        var skillCfg = skillConfigRepository.findBySkillId(request.getSkillId()).orElse(null);
        int maxLvl = skillCfg != null ? skillCfg.getMaxLevel() : MAX_SKILL_LEVEL;

        if (currentLvl >= maxLvl) {
            throw new GameRuleViolationException("Kỹ năng đã đạt cấp tối đa (Level " + maxLvl + ")!");
        }

        long baseCost = skillCfg != null ? skillCfg.getBaseGoldCost() : 500L;
        long costPerLvl = skillCfg != null ? skillCfg.getGoldCostPerLevel() : 500L;
        long goldCost = baseCost + costPerLvl * currentLvl;

        if (user.getGold() < goldCost) {
            throw new InsufficientResourceException("Không đủ Gold! Cần: " + goldCost + ", Hiện có: " + user.getGold());
        }

        // Deduct Gold
        user.setGold(user.getGold() - goldCost);
        userRepository.save(user);

        // Update Skill Level
        skills.put(request.getSkillId(), currentLvl + 1);
        hero.setSkills(serializeSkills(skills));
        hero = heroRepository.save(hero);

        log.info("⚡ Skill Upgrade SUCCESS: Hero {} ({}) upgraded skill {} to level {}",
                hero.getId(), hero.getHeroClass(), request.getSkillId(), currentLvl + 1);

        return heroService.buildHeroDetailDto(hero);
    }

    @Override
    public StatsDto calculateSkillBonusStats(HeroClass heroClass, Map<String, Integer> skills) {
        StatsDto bonus = new StatsDto();
        if (skills == null || skills.isEmpty()) return bonus;

        switch (heroClass) {
            case WARRIOR -> {
                int ironWall = skills.getOrDefault("iron_wall", 0);
                int berserk = skills.getOrDefault("berserk_strike", 0);
                int whirlwind = skills.getOrDefault("whirlwind_slash", 0);

                bonus.setArmor(bonus.getArmor() + ironWall * 10.0);
                bonus.setDmgReduction(bonus.getDmgReduction() + ironWall * 2.0);
                bonus.setPhysAtk(bonus.getPhysAtk() + berserk * 10.0);
                bonus.setLifeSteal(bonus.getLifeSteal() + berserk * 2.0);
                bonus.setCritDmg(bonus.getCritDmg() + whirlwind * 10.0);
                bonus.setAtkPercent(bonus.getAtkPercent() + whirlwind * 3.0);
            }
            case RANGER -> {
                int eagleEye = skills.getOrDefault("eagle_eye", 0);
                int venomArrow = skills.getOrDefault("venom_arrow", 0);
                int deadlySnipe = skills.getOrDefault("deadly_sniping", 0);

                bonus.setCritRate(bonus.getCritRate() + eagleEye * 3.0);
                bonus.setAtkSpeed(bonus.getAtkSpeed() + eagleEye * 0.06);
                bonus.setElemDmgBonus(bonus.getElemDmgBonus() + venomArrow * 8.0);
                bonus.setPhysDodge(bonus.getPhysDodge() + venomArrow * 3.0);
                bonus.setCritDmg(bonus.getCritDmg() + deadlySnipe * 15.0);
                bonus.setPhysAtk(bonus.getPhysAtk() + deadlySnipe * 8.0);
            }
            case MAGE -> {
                int manaFlow = skills.getOrDefault("mana_flow", 0);
                int pyroblast = skills.getOrDefault("pyroblast", 0);
                int voidBlizzard = skills.getOrDefault("void_blizzard", 0);

                bonus.setMagicAtk(bonus.getMagicAtk() + manaFlow * 12.0);
                bonus.setCdr(bonus.getCdr() + manaFlow * 3.0);
                bonus.setElemDmgBonus(bonus.getElemDmgBonus() + pyroblast * 10.0);
                bonus.setSpellEvasion(bonus.getSpellEvasion() + pyroblast * 4.0);
                bonus.setAtkPercent(bonus.getAtkPercent() + voidBlizzard * 5.0);
                bonus.setElemDmgBonus(bonus.getElemDmgBonus() + voidBlizzard * 8.0);
            }
            case PRIEST -> {
                int divineAura = skills.getOrDefault("divine_aura", 0);
                int purification = skills.getOrDefault("purification", 0);
                int eternalBless = skills.getOrDefault("eternal_blessing", 0);

                bonus.setHpRegen(bonus.getHpRegen() + divineAura * 12.0);
                bonus.setDmgReduction(bonus.getDmgReduction() + divineAura * 3.0);
                bonus.setChaosRes(bonus.getChaosRes() + purification * 8.0);
                bonus.setCdr(bonus.getCdr() + purification * 4.0);
                bonus.setMaxHp(bonus.getMaxHp() + eternalBless * 50.0);
                bonus.setFireRes(bonus.getFireRes() + eternalBless * 4.0);
                bonus.setColdRes(bonus.getColdRes() + eternalBless * 4.0);
                bonus.setLightningRes(bonus.getLightningRes() + eternalBless * 4.0);
            }
        }
        return bonus;
    }

    private List<SkillNodeDto> getSkillNodesForClass(HeroClass heroClass, Map<String, Integer> currentSkills) {
        List<SkillNodeDto> list = new ArrayList<>();

        switch (heroClass) {
            case WARRIOR -> {
                int lvl1 = currentSkills.getOrDefault("iron_wall", 0);
                int lvl2 = currentSkills.getOrDefault("berserk_strike", 0);
                int lvl3 = currentSkills.getOrDefault("whirlwind_slash", 0);

                list.add(SkillNodeDto.builder()
                        .id("iron_wall")
                        .name("Iron Wall")
                        .description("Reinforces armor and reduces damage taken.")
                        .icon("🛡️")
                        .maxLevel(MAX_SKILL_LEVEL)
                        .currentLevel(lvl1)
                        .goldCostNextLevel(500L * (lvl1 + 1))
                        .bonusDescription("+10 Armor • +2% Damage Reduction per level")
                        .build());

                list.add(SkillNodeDto.builder()
                        .id("berserk_strike")
                        .name("Berserk Strike")
                        .description("Boosts physical attack power and drains enemy life.")
                        .icon("🩸")
                        .maxLevel(MAX_SKILL_LEVEL)
                        .currentLevel(lvl2)
                        .goldCostNextLevel(500L * (lvl2 + 1))
                        .bonusDescription("+10 Phys ATK • +2% Lifesteal per level")
                        .build());

                list.add(SkillNodeDto.builder()
                        .id("whirlwind_slash")
                        .name("Whirlwind Slash")
                        .description("Sweeping cleave dealing massive critical damage.")
                        .icon("🌪️")
                        .maxLevel(MAX_SKILL_LEVEL)
                        .currentLevel(lvl3)
                        .goldCostNextLevel(500L * (lvl3 + 1))
                        .bonusDescription("+10% Crit DMG • +3% Total ATK per level")
                        .build());
            }
            case RANGER -> {
                int lvl1 = currentSkills.getOrDefault("eagle_eye", 0);
                int lvl2 = currentSkills.getOrDefault("venom_arrow", 0);
                int lvl3 = currentSkills.getOrDefault("deadly_sniping", 0);

                list.add(SkillNodeDto.builder()
                        .id("eagle_eye")
                        .name("Eagle Eye")
                        .description("Sharpens eyesight, boosting Critical Rate and Attack Speed.")
                        .icon("🦅")
                        .maxLevel(MAX_SKILL_LEVEL)
                        .currentLevel(lvl1)
                        .goldCostNextLevel(500L * (lvl1 + 1))
                        .bonusDescription("+3% Crit Rate • +0.06 Attack Speed per level")
                        .build());

                list.add(SkillNodeDto.builder()
                        .id("venom_arrow")
                        .name("Venom Arrow")
                        .description("Enchants arrows with poison and increases dodge chance.")
                        .icon("🏹")
                        .maxLevel(MAX_SKILL_LEVEL)
                        .currentLevel(lvl2)
                        .goldCostNextLevel(500L * (lvl2 + 1))
                        .bonusDescription("+8% Elemental DMG • +3% Physical Dodge per level")
                        .build());

                list.add(SkillNodeDto.builder()
                        .id("deadly_sniping")
                        .name("Deadly Sniping")
                        .description("Armor-piercing sniping shot dealing lethal critical damage.")
                        .icon("🎯")
                        .maxLevel(MAX_SKILL_LEVEL)
                        .currentLevel(lvl3)
                        .goldCostNextLevel(500L * (lvl3 + 1))
                        .bonusDescription("+15% Crit DMG • +8 Phys ATK per level")
                        .build());
            }
            case MAGE -> {
                int lvl1 = currentSkills.getOrDefault("mana_flow", 0);
                int lvl2 = currentSkills.getOrDefault("pyroblast", 0);
                int lvl3 = currentSkills.getOrDefault("void_blizzard", 0);

                list.add(SkillNodeDto.builder()
                        .id("mana_flow")
                        .name("Mana Flow")
                        .description("Amplifies magic power and accelerates cooldown recovery.")
                        .icon("🔮")
                        .maxLevel(MAX_SKILL_LEVEL)
                        .currentLevel(lvl1)
                        .goldCostNextLevel(500L * (lvl1 + 1))
                        .bonusDescription("+12 Magic ATK • +3% Cooldown Reduction per level")
                        .build());

                list.add(SkillNodeDto.builder()
                        .id("pyroblast")
                        .name("Pyroblast")
                        .description("Summons devastating fireballs and enhances spell evasion.")
                        .icon("🔥")
                        .maxLevel(MAX_SKILL_LEVEL)
                        .currentLevel(lvl2)
                        .goldCostNextLevel(500L * (lvl2 + 1))
                        .bonusDescription("+10% Fire DMG • +4% Spell Evasion per level")
                        .build());

                list.add(SkillNodeDto.builder()
                        .id("void_blizzard")
                        .name("Void Blizzard")
                        .description("Unleashes an abyssal blizzard increasing overall damage.")
                        .icon("❄️")
                        .maxLevel(MAX_SKILL_LEVEL)
                        .currentLevel(lvl3)
                        .goldCostNextLevel(500L * (lvl3 + 1))
                        .bonusDescription("+5% Total ATK • +8% Elemental DMG per level")
                        .build());
            }
            case PRIEST -> {
                int lvl1 = currentSkills.getOrDefault("divine_aura", 0);
                int lvl2 = currentSkills.getOrDefault("purification", 0);
                int lvl3 = currentSkills.getOrDefault("eternal_blessing", 0);

                list.add(SkillNodeDto.builder()
                        .id("divine_aura")
                        .name("Divine Aura")
                        .description("Radiates holy light, regenerating HP and shielding the party.")
                        .icon("✨")
                        .maxLevel(MAX_SKILL_LEVEL)
                        .currentLevel(lvl1)
                        .goldCostNextLevel(500L * (lvl1 + 1))
                        .bonusDescription("+12 HP/s Regen • +3% Damage Reduction per level")
                        .build());

                list.add(SkillNodeDto.builder()
                        .id("purification")
                        .name("Purification")
                        .description("Cleanses curses and grants Chaos resistance.")
                        .icon("🕯️")
                        .maxLevel(MAX_SKILL_LEVEL)
                        .currentLevel(lvl2)
                        .goldCostNextLevel(500L * (lvl2 + 1))
                        .bonusDescription("+8% Chaos Res • +4% Cooldown Reduction per level")
                        .build());

                list.add(SkillNodeDto.builder()
                        .id("eternal_blessing")
                        .name("Eternal Blessing")
                        .description("Empowers vitality, boosting Max HP and all Elemental Resistances.")
                        .icon("💖")
                        .maxLevel(MAX_SKILL_LEVEL)
                        .currentLevel(lvl3)
                        .goldCostNextLevel(500L * (lvl3 + 1))
                        .bonusDescription("+50 Max HP • +4% All Resistances per level")
                        .build());
            }
        }
        return list;
    }

    private Map<String, Integer> parseSkills(String json) {
        if (json == null || json.isBlank() || json.equals("{}")) {
            return new HashMap<>();
        }
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<Map<String, Integer>>() {});
        } catch (JsonProcessingException e) {
            return new HashMap<>();
        }
    }

    private String serializeSkills(Map<String, Integer> map) {
        try {
            return OBJECT_MAPPER.writeValueAsString(map != null ? map : new HashMap<>());
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private String getHeroName(HeroClass heroClass) {
        return switch (heroClass) {
            case WARRIOR -> "Arthur (Đấu Sĩ)";
            case RANGER -> "Robin (Xạ Thủ)";
            case MAGE -> "Merlin (Pháp Sư)";
            case PRIEST -> "Elena (Mục Sư)";
        };
    }
}
