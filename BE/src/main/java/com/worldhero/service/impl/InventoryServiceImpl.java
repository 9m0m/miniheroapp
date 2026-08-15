package com.worldhero.service.impl;

import com.worldhero.dto.*;
import com.worldhero.engine.StatEvaluator;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.HeroEntity;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.ItemSlot;
import com.worldhero.repository.HeroRepository;
import com.worldhero.repository.ItemInstanceRepository;
import com.worldhero.service.HeroService;
import com.worldhero.service.InventoryService;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceImpl implements InventoryService {

    private final ItemInstanceRepository itemInstanceRepository;
    private final HeroRepository heroRepository;
    private final UserService userService;
    private final HeroService heroService;
    private final StatEvaluator statEvaluator;

    @Override
    @Transactional(readOnly = true)
    public List<ItemInstanceDto> getBagItems(UUID userId) {
        UserEntity user = userService.getUserOrThrow(userId);
        List<ItemInstanceEntity> bagEntities = itemInstanceRepository.findBagItemsWithTemplateByUserId(user.getId());

        List<ItemInstanceDto> result = new ArrayList<>();
        for (ItemInstanceEntity instance : bagEntities) {
            ItemTemplateDto templateDto = instance.getTemplate().toTemplateDto();
            ItemInstanceDto instanceDto = instance.toInstanceDto();
            StatsDto stats = statEvaluator.computeItemStats(templateDto, instanceDto);
            instanceDto.setComputedStats(stats);
            result.add(instanceDto);
        }

        return result;
    }

    @Override
    @Transactional
    public HeroDetailDto equipItem(EquipRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        ItemInstanceEntity instance = itemInstanceRepository.findById(request.getItemInstanceId())
                .orElseThrow(() -> new ResourceNotFoundException("Item instance not found: " + request.getItemInstanceId()));

        if (!instance.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("User does not own this item instance.");
        }

        HeroEntity hero = heroRepository.findById(request.getHeroId())
                .orElseThrow(() -> new ResourceNotFoundException("Hero not found: " + request.getHeroId()));

        if (!hero.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("User does not own this hero.");
        }

        // Validate Class Restriction
        if (instance.getTemplate().getRequiredClass() != null &&
                instance.getTemplate().getRequiredClass() != hero.getHeroClass()) {
            throw new GameRuleViolationException("Trang bị " + instance.getTemplate().getName() +
                    " yêu cầu class " + instance.getTemplate().getRequiredClass() +
                    ", nhưng tướng là " + hero.getHeroClass());
        }

        ItemSlot targetSlot = request.getTargetSlot() != null ?
                request.getTargetSlot() : instance.getTemplate().getSlotType();

        // Unequip current item in slot if exists
        Optional<ItemInstanceEntity> currentEquippedOpt = itemInstanceRepository
                .findByHeroIdAndEquippedSlot(hero.getId(), targetSlot);

        if (currentEquippedOpt.isPresent()) {
            ItemInstanceEntity oldItem = currentEquippedOpt.get();
            oldItem.setHero(null);
            oldItem.setEquippedSlot(null);
            itemInstanceRepository.save(oldItem);
        }

        instance.setHero(hero);
        instance.setEquippedSlot(targetSlot);
        itemInstanceRepository.save(instance);

        log.info("🛡️ Hero {} equipped item {} ({}) on slot {}",
                hero.getHeroClass(), instance.getTemplate().getName(), instance.getId(), targetSlot);

        return heroService.buildHeroDetailDto(hero);
    }

    @Override
    @Transactional
    public HeroDetailDto unequipItem(UnequipRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        ItemInstanceEntity instance = itemInstanceRepository.findById(request.getItemInstanceId())
                .orElseThrow(() -> new ResourceNotFoundException("Item instance not found: " + request.getItemInstanceId()));

        if (!instance.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("User does not own this item instance.");
        }

        HeroEntity hero = instance.getHero();
        if (hero == null) {
            throw new GameRuleViolationException("Item is not currently equipped on any hero.");
        }

        instance.setHero(null);
        instance.setEquippedSlot(null);
        itemInstanceRepository.save(instance);

        log.info("📦 Hero {} unequipped item {}", hero.getHeroClass(), instance.getId());

        return heroService.buildHeroDetailDto(hero);
    }
}
