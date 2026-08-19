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

import java.util.List;
import java.util.UUID;
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
    private final com.worldhero.service.TowerGearService towerGearService;

    @Override
    @Transactional
    public EnhanceResponseDto enhanceItem(EnhanceRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        UUID itemUuid;
        try {
            itemUuid = UUID.fromString(request.getItemInstanceId());
        } catch (IllegalArgumentException e) {
            List<ItemInstanceEntity> userItems = itemInstanceRepository.findBagItemsWithTemplateByUserId(user.getId());
            ItemInstanceEntity found = userItems.stream()
                    .filter(i -> i.getTemplate().getId().equalsIgnoreCase(request.getItemInstanceId()) || i.getId().toString().equalsIgnoreCase(request.getItemInstanceId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Vật phẩm không tồn tại: " + request.getItemInstanceId()));
            itemUuid = found.getId();
        }

        // Delegate to single deterministic TowerGearService (+1.5%/lvl, max +15, 100% success)
        ItemInstanceDto updated = towerGearService.enhanceItem(user.getId(), itemUuid, request.getOperationKey());

        // Fetch refreshed user
        user = userService.getUserOrThrow(request.getUserId());

        return EnhanceResponseDto.builder()
                .success(true)
                .status(EnhanceResponseDto.EnhanceStatus.SUCCESS)
                .oldEnhanceLevel(updated.getEnhanceLevel() - 1)
                .newEnhanceLevel(updated.getEnhanceLevel())
                .remainingGold(user.getGold())
                .remainingStones(user.getEnhanceStones())
                .updatedItem(updated)
                .build();
    }
}
