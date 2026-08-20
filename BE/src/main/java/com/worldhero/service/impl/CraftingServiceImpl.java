package com.worldhero.service.impl;

import com.worldhero.dto.*;
import com.worldhero.engine.StatEvaluator;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.InsufficientResourceException;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.ItemTemplateEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.repository.ItemInstanceRepository;
import com.worldhero.repository.ItemTemplateRepository;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.CraftingService;
import com.worldhero.service.HeroService;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CraftingServiceImpl implements CraftingService {

    private final ItemInstanceRepository itemInstanceRepository;
    private final ItemTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final HeroService heroService;
    private final StatEvaluator statEvaluator;

    @Override
    @Transactional
    public ItemInstanceDto blessItem(BlessRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        ItemInstanceEntity instance = itemInstanceRepository.findById(request.getItemInstanceId())
                .orElseThrow(() -> new ResourceNotFoundException("Item does not exist: " + request.getItemInstanceId()));

        if (!instance.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Item is not owned by player.");
        }

        instance.setBlessingId(request.getBlessingId());
        instance = itemInstanceRepository.save(instance);

        log.info("Bless Item SUCCESS: Blessed item {} with {}", instance.getId(), request.getBlessingId());
        return mapToEvaluatedDto(instance);
    }

    @Override
    @Transactional
    public ItemInstanceDto craftAccessory(CraftRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        ItemTemplateEntity template = templateRepository.findById(request.getRecipeId())
                .orElseThrow(() -> new ResourceNotFoundException("Accessory blueprint does not exist: " + request.getRecipeId()));

        long goldCost = 1000L;
        int stonesCost = 5;

        if (user.getGold() < goldCost) {
            throw new InsufficientResourceException("Not enough Gold to forge accessory! Required: " + goldCost + ", Current: " + user.getGold());
        }
        if (user.getEnhanceStones() < stonesCost) {
            throw new InsufficientResourceException("Not enough Enhance Stones to forge! Required: " + stonesCost + ", Current: " + user.getEnhanceStones());
        }

        user.setGold(user.getGold() - goldCost);
        user.setEnhanceStones(user.getEnhanceStones() - stonesCost);
        userRepository.save(user);

        ItemInstanceEntity accessory = ItemInstanceEntity.builder()
                .user(user)
                .hero(null) // in bag
                .equippedSlot(null)
                .template(template)
                .itemLevel(1)
                .currentRarity(template.getBaseRarity())
                .enhanceLevel(0)
                .sockets("[]")
                .subStats("{}")
                .build();

        accessory = itemInstanceRepository.save(accessory);
        log.info("Blacksmith Craft SUCCESS: Crafted accessory {} for user {}", template.getName(), user.getId());

        return mapToEvaluatedDto(accessory);
    }

    @Override
    @Transactional
    public String brewAlchemy(CraftRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        long goldCost = 500L;
        int gemsCost = 20;

        if (user.getGold() < goldCost) {
            throw new InsufficientResourceException("Not enough Gold to brew potion! Required: " + goldCost + ", Current: " + user.getGold());
        }
        if (user.getGems() < gemsCost) {
            throw new InsufficientResourceException("Not enough Gems to brew potion! Required: " + gemsCost + ", Current: " + user.getGems());
        }

        user.setGold(user.getGold() - goldCost);
        user.setGems(user.getGems() - gemsCost);
        userRepository.save(user);

        log.info("Alchemy Brew SUCCESS: Brewed {} for user {}", request.getRecipeId(), user.getId());
        return request.getRecipeId();
    }

    private ItemInstanceDto mapToEvaluatedDto(ItemInstanceEntity instance) {
        ItemTemplateDto templateDto = instance.getTemplate().toTemplateDto();
        ItemInstanceDto instanceDto = instance.toInstanceDto();
        StatsDto stats = statEvaluator.computeItemStats(templateDto, instanceDto);
        instanceDto.setComputedStats(stats);
        return instanceDto;
    }
}
