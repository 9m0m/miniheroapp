package com.worldhero.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldhero.dto.CombatStatsDto;
import com.worldhero.dto.HeroDetailDto;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.model.entity.HeroEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.HeroBusyStatus;
import com.worldhero.repository.HeroRepository;
import com.worldhero.repository.ResourceMutationLedgerRepository;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.HeroProgressionService;
import com.worldhero.service.HeroService;
import com.worldhero.service.IdempotencyHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class HeroProgressionServiceImpl implements HeroProgressionService {

    private final HeroRepository heroRepository;
    private final UserRepository userRepository;
    private final HeroService heroService;
    private final ResourceMutationLedgerRepository mutationLedgerRepository;
    private final ObjectMapper objectMapper;

    public static int calculateEssenceForNextLevel(int currentLevel) {
        double raw = 20.0 * Math.pow(currentLevel, 1.25);
        return (int) Math.ceil(raw / 5.0) * 5;
    }

    @Override
    public LevelCost calculateLevelCost(int fromLevel, int toLevel) {
        if (fromLevel >= toLevel || fromLevel < 1 || toLevel > MAX_HERO_LEVEL) {
            return new LevelCost(0, 0);
        }
        int totalEssence = 0;
        for (int lvl = fromLevel; lvl < toLevel; lvl++) {
            totalEssence += calculateEssenceForNextLevel(lvl);
        }
        return new LevelCost(totalEssence, totalEssence * 4);
    }

    @Override
    public StarCost getStarCost(int targetStar) {
        return switch (targetStar) {
            case 1 -> new StarCost(20, 0, 0, 0.0);
            case 2 -> new StarCost(30, 20, 2000, 0.03);
            case 3 -> new StarCost(40, 50, 5000, 0.03);
            case 4 -> new StarCost(45, 100, 10000, 0.07);
            case 5 -> new StarCost(50, 180, 20000, 0.10);
            default -> throw new GameRuleViolationException("Invalid star tier: " + targetStar);
        };
    }

    @Override
    public CombatStatsDto computeHeroStats(CombatStatsDto baseStats, int level, int stars) {
        return HeroProgressionService.calculateHeroProgressionStats(baseStats, level, stars);
    }

    // -------------------------------------------------------------------------
    // Level-up (operationKey required)
    // -------------------------------------------------------------------------

    /**
     * @deprecated Use {@link #levelUpHero(UUID, UUID, int, String)} with an explicit operationKey.
     */
    @Override
    @Transactional
    @Deprecated
    public HeroDetailDto levelUpHero(UUID userId, UUID heroId, int targetLevel) {
        throw new GameRuleViolationException(
                "operationKey is required for LEVEL_UP. Use the levelUpHero overload with operationKey.");
    }

    @Override
    @Transactional
    public HeroDetailDto levelUpHero(UUID userId, UUID heroId, int targetLevel, String operationKey) {
        IdempotencyHelper.requireKey(operationKey, "LEVEL_UP");

        UserEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new GameRuleViolationException("User not found"));

        String inputHash = IdempotencyHelper.computeHash("LEVEL_UP", userId, heroId, targetLevel);
        HeroDetailDto cached = IdempotencyHelper.checkAndReturn(
                mutationLedgerRepository, objectMapper, userId, "LEVEL_UP", operationKey, inputHash, HeroDetailDto.class);
        if (cached != null) return cached;

        HeroEntity hero = heroRepository.findById(heroId)
                .orElseThrow(() -> new GameRuleViolationException("Hero not found"));

        if (!hero.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Hero does not belong to current user");
        }

        if (hero.getBusyStatus() == HeroBusyStatus.EXPEDITION_BUSY) {
            throw new GameRuleViolationException("Hero is currently on an Expedition and cannot level up");
        }

        int currentLevel = hero.getLevel();
        int currentStars = Math.max(1, hero.getStars());
        int maxAllowedLevel = getStarCost(currentStars).levelCap();

        if (targetLevel <= currentLevel) {
            throw new GameRuleViolationException("Target level must be higher than current level: " + currentLevel);
        }
        if (targetLevel > maxAllowedLevel) {
            throw new GameRuleViolationException("Hero with " + currentStars + " star(s) is capped at level " + maxAllowedLevel + ". Star-up required.");
        }
        if (targetLevel > MAX_HERO_LEVEL) {
            throw new GameRuleViolationException("Cannot exceed max level " + MAX_HERO_LEVEL);
        }

        LevelCost cost = calculateLevelCost(currentLevel, targetLevel);
        if (user.getGold() < cost.gold()) {
            throw new GameRuleViolationException("Insufficient gold: requires " + cost.gold() + ", has " + user.getGold());
        }
        if (user.getEssence() < cost.essence()) {
            throw new GameRuleViolationException("Insufficient essence: requires " + cost.essence() + ", has " + user.getEssence());
        }

        user.setGold(user.getGold() - cost.gold());
        user.setEssence(user.getEssence() - cost.essence());
        hero.setLevel(targetLevel);
        heroRepository.save(hero);

        HeroDetailDto result = heroService.buildHeroDetailDto(hero);
        IdempotencyHelper.persist(mutationLedgerRepository, objectMapper, user, "LEVEL_UP", operationKey, inputHash, result);
        return result;
    }

    // -------------------------------------------------------------------------
    // Star-up (operationKey required)
    // -------------------------------------------------------------------------

    /**
     * @deprecated Use {@link #starUpHero(UUID, UUID, String)} with an explicit operationKey.
     */
    @Override
    @Transactional
    @Deprecated
    public HeroDetailDto starUpHero(UUID userId, UUID heroId) {
        throw new GameRuleViolationException(
                "operationKey is required for STAR_UP. Use the starUpHero overload with operationKey.");
    }

    @Override
    @Transactional
    public HeroDetailDto starUpHero(UUID userId, UUID heroId, String operationKey) {
        IdempotencyHelper.requireKey(operationKey, "STAR_UP");

        UserEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new GameRuleViolationException("User not found"));

        String inputHash = IdempotencyHelper.computeHash("STAR_UP", userId, heroId);
        HeroDetailDto cached = IdempotencyHelper.checkAndReturn(
                mutationLedgerRepository, objectMapper, userId, "STAR_UP", operationKey, inputHash, HeroDetailDto.class);
        if (cached != null) return cached;

        HeroEntity hero = heroRepository.findById(heroId)
                .orElseThrow(() -> new GameRuleViolationException("Hero not found"));

        if (!hero.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Hero does not belong to current user");
        }

        if (hero.getBusyStatus() == HeroBusyStatus.EXPEDITION_BUSY) {
            throw new GameRuleViolationException("Hero is currently on an Expedition and cannot star up");
        }

        int currentStars = Math.max(1, hero.getStars());
        if (currentStars >= MAX_HERO_STARS) {
            throw new GameRuleViolationException("Hero is already at maximum " + MAX_HERO_STARS + " stars");
        }

        int nextStar = currentStars + 1;
        StarCost cost = getStarCost(nextStar);

        if (user.getGold() < cost.gold()) {
            throw new GameRuleViolationException("Insufficient gold for star up: requires " + cost.gold() + ", has " + user.getGold());
        }
        if (hero.getShards() < cost.shards()) {
            throw new GameRuleViolationException("Insufficient hero shards: requires " + cost.shards() + ", has " + hero.getShards());
        }

        user.setGold(user.getGold() - cost.gold());
        hero.setShards(hero.getShards() - cost.shards());
        hero.setStars(nextStar);
        heroRepository.save(hero);

        HeroDetailDto result = heroService.buildHeroDetailDto(hero);
        IdempotencyHelper.persist(mutationLedgerRepository, objectMapper, user, "STAR_UP", operationKey, inputHash, result);
        return result;
    }
}
