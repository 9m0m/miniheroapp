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
    public ItemInstanceDto inlayGem(SocketOperationRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        ItemInstanceEntity instance = itemInstanceRepository.findById(request.getItemInstanceId())
                .orElseThrow(() -> new ResourceNotFoundException("Trang bị không tồn tại: " + request.getItemInstanceId()));

        if (!instance.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Trang bị không thuộc sở hữu của người chơi.");
        }

        int maxSockets = instance.getCurrentRarity().getMaxSockets();
        if (maxSockets <= 0) {
            throw new GameRuleViolationException("Trang bị phẩm cấp " + instance.getCurrentRarity() + " không hỗ trợ khảm ngọc!");
        }

        List<String> sockets = instance.getSocketsList();
        if (sockets.size() >= maxSockets) {
            throw new GameRuleViolationException("Trang bị đã đạt số lượng lỗ khảm tối đa (" + maxSockets + " lỗ)!");
        }

        sockets.add(request.getGemId());
        instance.setSocketsList(sockets);
        instance = itemInstanceRepository.save(instance);

        log.info("💎 Inlay Gem SUCCESS: Inlaid {} into item {}", request.getGemId(), instance.getId());
        return mapToEvaluatedDto(instance);
    }

    @Override
    @Transactional
    public ItemInstanceDto removeGem(SocketOperationRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        ItemInstanceEntity instance = itemInstanceRepository.findById(request.getItemInstanceId())
                .orElseThrow(() -> new ResourceNotFoundException("Trang bị không tồn tại: " + request.getItemInstanceId()));

        if (!instance.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Trang bị không thuộc sở hữu của người chơi.");
        }

        List<String> sockets = instance.getSocketsList();
        if (request.getSocketIndex() >= 0 && request.getSocketIndex() < sockets.size()) {
            sockets.remove(request.getSocketIndex());
        } else if (request.getGemId() != null) {
            sockets.remove(request.getGemId());
        }

        instance.setSocketsList(sockets);
        instance = itemInstanceRepository.save(instance);

        log.info("💎 Remove Gem SUCCESS: Removed gem from item {}", instance.getId());
        return mapToEvaluatedDto(instance);
    }

    @Override
    @Transactional
    public ItemInstanceDto blessItem(BlessRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        ItemInstanceEntity instance = itemInstanceRepository.findById(request.getItemInstanceId())
                .orElseThrow(() -> new ResourceNotFoundException("Trang bị không tồn tại: " + request.getItemInstanceId()));

        if (!instance.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Trang bị không thuộc sở hữu của người chơi.");
        }

        instance.setBlessingId(request.getBlessingId());
        instance = itemInstanceRepository.save(instance);

        log.info("✨ Bless Item SUCCESS: Blessed item {} with {}", instance.getId(), request.getBlessingId());
        return mapToEvaluatedDto(instance);
    }

    @Override
    @Transactional
    public ItemInstanceDto craftAccessory(CraftRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        ItemTemplateEntity template = templateRepository.findById(request.getRecipeId())
                .orElseThrow(() -> new ResourceNotFoundException("Công thức phụ kiện không tồn tại: " + request.getRecipeId()));

        long goldCost = 1000L;
        int stonesCost = 5;

        if (user.getGold() < goldCost) {
            throw new InsufficientResourceException("Không đủ Gold để rèn phụ kiện! Cần: " + goldCost + ", Hiện có: " + user.getGold());
        }
        if (user.getEnhanceStones() < stonesCost) {
            throw new InsufficientResourceException("Không đủ Đá Cường Hóa để rèn! Cần: " + stonesCost + ", Hiện có: " + user.getEnhanceStones());
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
        log.info("⚒️ Blacksmith Craft SUCCESS: Crafted accessory {} for user {}", template.getName(), user.getId());

        return mapToEvaluatedDto(accessory);
    }

    @Override
    @Transactional
    public String brewAlchemy(CraftRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        long goldCost = 500L;
        int gemsCost = 20;

        if (user.getGold() < goldCost) {
            throw new InsufficientResourceException("Không đủ Gold để nấu Tiên Dược! Cần: " + goldCost + ", Hiện có: " + user.getGold());
        }
        if (user.getGems() < gemsCost) {
            throw new InsufficientResourceException("Không đủ Gems để nấu Tiên Dược! Cần: " + gemsCost + ", Hiện có: " + user.getGems());
        }

        user.setGold(user.getGold() - goldCost);
        user.setGems(user.getGems() - gemsCost);
        userRepository.save(user);

        log.info("🧪 Alchemy Brew SUCCESS: Brewed {} for user {}", request.getRecipeId(), user.getId());
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
