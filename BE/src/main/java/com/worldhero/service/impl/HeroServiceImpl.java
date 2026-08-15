package com.worldhero.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldhero.dto.HeroDetailDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.ItemTemplateDto;
import com.worldhero.dto.StatsDto;
import com.worldhero.engine.DamageCalculator;
import com.worldhero.engine.StatEvaluator;
import com.worldhero.model.entity.HeroEntity;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.repository.HeroRepository;
import com.worldhero.repository.ItemInstanceRepository;
import com.worldhero.service.HeroService;
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
public class HeroServiceImpl implements HeroService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final HeroRepository heroRepository;
    private final ItemInstanceRepository itemInstanceRepository;
    private final UserService userService;
    private final StatEvaluator statEvaluator;
    private final DamageCalculator damageCalculator;

    @Override
    @Transactional(readOnly = true)
    public List<HeroDetailDto> getHeroesForUser(UUID userId) {
        UserEntity user = userService.getUserOrThrow(userId);
        List<HeroEntity> heroes = heroRepository.findByUserId(user.getId());

        List<HeroDetailDto> result = new ArrayList<>();
        for (HeroEntity hero : heroes) {
            result.add(buildHeroDetailDto(hero));
        }

        return result;
    }

    @Override
    public HeroDetailDto buildHeroDetailDto(HeroEntity hero) {
        List<ItemInstanceEntity> equippedInstances = itemInstanceRepository.findEquippedItemsWithTemplateByHeroId(hero.getId());

        StatsDto combinedStats = createBaseStatsForHero(hero);
        List<ItemInstanceDto> equippedItemDtos = new ArrayList<>();

        for (ItemInstanceEntity instance : equippedInstances) {
            ItemTemplateDto templateDto = instance.getTemplate().toTemplateDto();
            ItemInstanceDto instanceDto = instance.toInstanceDto();

            StatsDto itemStats = statEvaluator.computeItemStats(templateDto, instanceDto);
            instanceDto.setComputedStats(itemStats);
            equippedItemDtos.add(instanceDto);
            combinedStats.add(itemStats);
        }

        // Add Skill Tree Bonus Stats
        Map<String, Integer> skillsMap = parseSkills(hero.getSkills());
        StatsDto skillBonus = calculateSkillBonus(hero.getHeroClass(), skillsMap);
        combinedStats.add(skillBonus);

        combinedStats.clamp();
        double dps = damageCalculator.calculateTheoreticalDPS(combinedStats);

        return HeroDetailDto.builder()
                .id(hero.getId())
                .heroClass(hero.getHeroClass())
                .level(hero.getLevel())
                .exp(hero.getExp())
                .isInParty(hero.isInParty())
                .slotIndex(hero.getSlotIndex())
                .equippedItems(equippedItemDtos)
                .skills(skillsMap)
                .computedStats(combinedStats)
                .liveDps(dps)
                .build();
    }

    private StatsDto createBaseStatsForHero(HeroEntity hero) {
        StatsDto base = new StatsDto();
        double levelScaling = 1.0 + (Math.max(1, hero.getLevel()) - 1) * 0.05;

        switch (hero.getHeroClass()) {
            case WARRIOR -> {
                base.setPhysAtk(30.0 * levelScaling);
                base.setMaxHp(150.0 * levelScaling);
                base.setArmor(20.0 * levelScaling);
                base.setHpRegen(5.0 * levelScaling);
                base.setAtkSpeed(1.0);
                base.setCritRate(5.0);
            }
            case RANGER -> {
                base.setPhysAtk(35.0 * levelScaling);
                base.setMaxHp(90.0 * levelScaling);
                base.setArmor(10.0 * levelScaling);
                base.setAtkSpeed(1.2);
                base.setCritRate(15.0);
                base.setCritDmg(160.0);
                base.setPhysDodge(10.0);
            }
            case MAGE -> {
                base.setMagicAtk(40.0 * levelScaling);
                base.setMaxHp(70.0 * levelScaling);
                base.setArmor(5.0 * levelScaling);
                base.setAtkSpeed(0.8);
                base.setCritRate(8.0);
                base.setSpellEvasion(10.0);
            }
            case PRIEST -> {
                base.setPhysAtk(10.0 * levelScaling);
                base.setMagicAtk(20.0 * levelScaling);
                base.setMaxHp(100.0 * levelScaling);
                base.setArmor(15.0 * levelScaling);
                base.setHpRegen(10.0 * levelScaling);
                base.setAtkSpeed(0.9);
            }
        }
        return base;
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

    private StatsDto calculateSkillBonus(HeroClass heroClass, Map<String, Integer> skills) {
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
}
