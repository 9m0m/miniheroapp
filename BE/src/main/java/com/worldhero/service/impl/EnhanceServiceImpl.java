package com.worldhero.service.impl;

import com.worldhero.dto.*;
import com.worldhero.engine.StatEvaluator;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.InsufficientResourceException;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.repository.ItemInstanceRepository;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.EnhanceService;
import com.worldhero.service.HeroService;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnhanceServiceImpl implements EnhanceService {

    public static final int MAX_ENHANCE_LEVEL = 15;

    private final ItemInstanceRepository itemInstanceRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final HeroService heroService;
    private final StatEvaluator statEvaluator;

    @Override
    @Transactional
    public EnhanceResponseDto enhanceItem(EnhanceRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        ItemInstanceEntity instance = itemInstanceRepository.findById(request.getItemInstanceId())
                .orElseThrow(() -> new ResourceNotFoundException("Item instance not found: " + request.getItemInstanceId()));

        if (!instance.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("User does not own this item instance.");
        }

        int currentLvl = instance.getEnhanceLevel();
        if (currentLvl >= MAX_ENHANCE_LEVEL) {
            throw new GameRuleViolationException("Trang bị đã đạt cấp cường hóa tối đa (+15)!");
        }

        // Calculate Cost & Success Chance
        long goldCost;
        int stonesCost;
        double successChance;

        if (currentLvl < 5) {
            goldCost = 200L * (currentLvl + 1);
            stonesCost = 1;
            successChance = 100.0;
        } else if (currentLvl < 10) {
            goldCost = 500L * (currentLvl + 1);
            stonesCost = 2;
            successChance = Math.max(50.0, 85.0 - (currentLvl - 5) * 7.0);
        } else {
            goldCost = 1000L * (currentLvl + 1);
            stonesCost = 3;
            successChance = Math.max(20.0, 40.0 - (currentLvl - 10) * 5.0);
        }

        // Validate Balances
        if (user.getGold() < goldCost) {
            throw new InsufficientResourceException("Không đủ Gold! Cần: " + goldCost + ", Hiện có: " + user.getGold());
        }
        if (user.getEnhanceStones() < stonesCost) {
            throw new InsufficientResourceException("Không đủ Đá Cường Hóa! Cần: " + stonesCost + ", Hiện có: " + user.getEnhanceStones());
        }

        // Deduct Resources
        user.setGold(user.getGold() - goldCost);
        user.setEnhanceStones(user.getEnhanceStones() - stonesCost);
        userRepository.save(user);

        // Roll Success
        boolean isSuccess = ThreadLocalRandom.current().nextDouble(0.0, 100.0) < successChance;
        EnhanceResponseDto.EnhanceStatus status;
        int newLvl = currentLvl;

        if (isSuccess) {
            newLvl = currentLvl + 1;
            status = EnhanceResponseDto.EnhanceStatus.SUCCESS;
            log.info("🔨 Enhance SUCCESS: Item {} upgraded from +{} to +{}", instance.getId(), currentLvl, newLvl);
        } else {
            if (currentLvl >= 10 && !request.isUseInsurance()) {
                newLvl = Math.max(10, currentLvl - 1);
                status = EnhanceResponseDto.EnhanceStatus.FAILED_DOWNGRADED;
                log.info("💥 Enhance FAILED with Downgrade: Item {} dropped from +{} to +{}", instance.getId(), currentLvl, newLvl);
            } else {
                status = EnhanceResponseDto.EnhanceStatus.FAILED_KEPT;
                log.info("🛡️ Enhance FAILED with Level Kept: Item {} stayed at +{}", instance.getId(), currentLvl);
            }
        }

        instance.setEnhanceLevel(newLvl);
        instance = itemInstanceRepository.save(instance);

        ItemTemplateDto templateDto = instance.getTemplate().toTemplateDto();
        ItemInstanceDto instanceDto = instance.toInstanceDto();
        StatsDto updatedStats = statEvaluator.computeItemStats(templateDto, instanceDto);
        instanceDto.setComputedStats(updatedStats);

        HeroDetailDto updatedHeroDto = null;
        if (instance.getHero() != null) {
            updatedHeroDto = heroService.buildHeroDetailDto(instance.getHero());
        }

        return EnhanceResponseDto.builder()
                .success(isSuccess)
                .status(status)
                .oldEnhanceLevel(currentLvl)
                .newEnhanceLevel(newLvl)
                .successChance(successChance)
                .goldCost(goldCost)
                .stonesCost(stonesCost)
                .updatedItem(instanceDto)
                .updatedHero(updatedHeroDto)
                .remainingGold(user.getGold())
                .remainingStones(user.getEnhanceStones())
                .build();
    }
}
