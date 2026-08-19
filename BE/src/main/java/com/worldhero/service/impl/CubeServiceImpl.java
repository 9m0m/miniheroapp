package com.worldhero.service.impl;

import com.worldhero.dto.GemFusionRequestDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.ItemTemplateDto;
import com.worldhero.dto.SmartFusionRequestDto;
import com.worldhero.dto.StatsDto;
import com.worldhero.dto.Transmute9RequestDto;
import com.worldhero.dto.Transmute9ResponseDto;
import com.worldhero.engine.CubeEngine;
import com.worldhero.engine.StatEvaluator;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.InsufficientResourceException;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.repository.ItemInstanceRepository;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.CubeService;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CubeServiceImpl implements CubeService {

    private final ItemInstanceRepository itemInstanceRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final CubeEngine cubeEngine;
    private final StatEvaluator statEvaluator;

    private ItemInstanceEntity findUserItemSafely(UserEntity user, String itemIdStr) {
        ItemInstanceEntity instance = null;
        try {
            UUID itemUuid = UUID.fromString(itemIdStr);
            instance = itemInstanceRepository.findById(itemUuid).orElse(null);
        } catch (IllegalArgumentException ignored) {}

        if (instance == null) {
            List<ItemInstanceEntity> userItems = itemInstanceRepository.findBagItemsWithTemplateByUserId(user.getId());
            instance = userItems.stream()
                    .filter(i -> i.getTemplate().getId().equalsIgnoreCase(itemIdStr) || i.getId().toString().equalsIgnoreCase(itemIdStr))
                    .findFirst()
                    .orElse(null);
        }
        return instance;
    }

    @Override
    @Transactional
    public ItemInstanceDto smartFusion(SmartFusionRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        List<ItemInstanceEntity> inputItems = new ArrayList<>();
        for (String itemId : request.getItemInstanceIds()) {
            ItemInstanceEntity item = findUserItemSafely(user, itemId);
            if (item == null) {
                throw new ResourceNotFoundException("Vật phẩm không tồn tại: " + itemId);
            }

            if (!item.getUser().getId().equals(user.getId())) {
                throw new GameRuleViolationException("Vật phẩm không thuộc sở hữu của người chơi.");
            }
            if (item.getHero() != null) {
                throw new GameRuleViolationException("Không thể ghép trang bị đang được Tướng sử dụng. Vui lòng tháo đồ trước!");
            }
            inputItems.add(item);
        }

        ItemRarity baseRarity = inputItems.get(0).getCurrentRarity();
        if (baseRarity == ItemRarity.ANCIENT) {
            throw new GameRuleViolationException("Trang bị Cổ Đại (Ancient) đã đạt phẩm cấp tối đa!");
        }

        for (ItemInstanceEntity item : inputItems) {
            if (item.getCurrentRarity() != baseRarity) {
                throw new GameRuleViolationException("Cả 3 trang bị đưa vào The Cube phải có cùng phẩm cấp!");
            }
        }

        long costGold = switch (baseRarity) {
            case COMMON -> 200L;
            case UNCOMMON -> 500L;
            case RARE -> 1500L;
            case EPIC -> 5000L;
            case LEGENDARY -> 15000L;
            case MYTHIC -> 50000L;
            case ANCIENT -> 0L;
        };

        if (user.getGold() < costGold) {
            throw new InsufficientResourceException("Không đủ Gold để kích hoạt The Cube! Cần: " + costGold + ", Hiện có: " + user.getGold());
        }

        user.setGold(user.getGold() - costGold);
        userRepository.save(user);

        ItemRarity nextRarity = baseRarity.getNextTier();
        int avgILvl = (int) Math.round(inputItems.stream().mapToInt(ItemInstanceEntity::getItemLevel).average().orElse(1));
        var targetTemplate = inputItems.get(0).getTemplate();

        itemInstanceRepository.deleteAll(inputItems);

        ItemInstanceEntity fusedItem = ItemInstanceEntity.builder()
                .user(user)
                .hero(null)
                .equippedSlot(null)
                .template(targetTemplate)
                .itemLevel(avgILvl)
                .currentRarity(nextRarity)
                .enhanceLevel(0)
                .sockets("[]")
                .subStats("{}")
                .build();

        fusedItem = itemInstanceRepository.save(fusedItem);
        log.info("🎲 Smart Fusion SUCCESS: Created {} ({}) for User {}",
                targetTemplate.getName(), nextRarity, user.getId());

        ItemTemplateDto templateDto = fusedItem.getTemplate().toTemplateDto();
        ItemInstanceDto resultDto = fusedItem.toInstanceDto();
        StatsDto stats = statEvaluator.computeItemStats(templateDto, resultDto);
        resultDto.setComputedStats(stats);

        return resultDto;
    }

    @Override
    @Transactional
    public Transmute9ResponseDto transmuteCube9(Transmute9RequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        if (request.getItemInstanceIds() == null || request.getItemInstanceIds().size() != 9) {
            throw new GameRuleViolationException("Ma trận The Cube 9 món yêu cầu chính xác 9 vật phẩm!");
        }

        List<ItemInstanceEntity> inputItems = new ArrayList<>();
        for (String itemId : request.getItemInstanceIds()) {
            ItemInstanceEntity item = findUserItemSafely(user, itemId);
            if (item == null) {
                throw new ResourceNotFoundException("Vật phẩm không tồn tại: " + itemId);
            }

            if (!item.getUser().getId().equals(user.getId())) {
                throw new GameRuleViolationException("Vật phẩm không thuộc sở hữu của người chơi.");
            }
            if (item.getHero() != null) {
                throw new GameRuleViolationException("Không thể ghép trang bị đang được Tướng sử dụng. Vui lòng tháo đồ trước!");
            }
            inputItems.add(item);
        }

        ItemRarity baseRarity = inputItems.get(0).getCurrentRarity();
        if (baseRarity == ItemRarity.ANCIENT) {
            throw new GameRuleViolationException("Trang bị Cổ Đại (Ancient) đã đạt phẩm cấp tối cao nhất!");
        }

        for (ItemInstanceEntity item : inputItems) {
            if (item.getCurrentRarity() != baseRarity) {
                throw new GameRuleViolationException("Cả 9 vật phẩm đưa vào The Cube phải có cùng phẩm cấp!");
            }
        }

        long costGold = switch (baseRarity) {
            case COMMON -> 300L;
            case UNCOMMON -> 800L;
            case RARE -> 2500L;
            case EPIC -> 8000L;
            case LEGENDARY -> 25000L;
            case MYTHIC -> 80000L;
            case ANCIENT -> 0L;
        };

        if (user.getGold() < costGold) {
            throw new InsufficientResourceException("Không đủ Gold để kích hoạt Ma trận The Cube! Cần: " + costGold + ", Hiện có: " + user.getGold());
        }

        user.setGold(user.getGold() - costGold);
        userRepository.save(user);

        CubeEngine.TransmuteResult rates = cubeEngine.calculateTransmuteRates(baseRarity);
        ItemRarity targetRarity = rates.targetRarity;
        int avgILvl = (int) Math.round(inputItems.stream().mapToInt(ItemInstanceEntity::getItemLevel).average().orElse(1));
        var targetTemplate = inputItems.get(0).getTemplate();

        itemInstanceRepository.deleteAll(inputItems);

        ItemInstanceEntity transmutedItem = ItemInstanceEntity.builder()
                .user(user)
                .hero(null)
                .equippedSlot(null)
                .template(targetTemplate)
                .itemLevel(avgILvl)
                .currentRarity(targetRarity)
                .enhanceLevel(0)
                .sockets("[]")
                .subStats("{}")
                .build();

        transmutedItem = itemInstanceRepository.save(transmutedItem);
        log.info("🎲 The Cube 9-Item Matrix SUCCESS: Transmuted 9 {} items into {} ({}) [Jackpot={}, Fallback={}] for User {}",
                baseRarity, targetTemplate.getName(), targetRarity, rates.isJackpot, rates.isFallback, user.getId());

        ItemTemplateDto templateDto = transmutedItem.getTemplate().toTemplateDto();
        ItemInstanceDto resultDto = transmutedItem.toInstanceDto();
        StatsDto stats = statEvaluator.computeItemStats(templateDto, resultDto);
        resultDto.setComputedStats(stats);

        String message = rates.isJackpot
                ? "🌟 JACKPOT TRANSMUTATION! Bạn đã nhảy vọt lên phẩm cấp " + targetRarity.getDisplayName() + "!"
                : rates.isFallback
                ? "⚠️ Phẩm cấp giữ nguyên ở mức " + targetRarity.getDisplayName() + "."
                : "✨ Ghép thành công 9 món lên " + targetRarity.getDisplayName() + "!";

        return Transmute9ResponseDto.builder()
                .resultItem(resultDto)
                .isJackpot(rates.isJackpot)
                .isFallback(rates.isFallback)
                .remainingGold(user.getGold())
                .message(message)
                .build();
    }

    @Override
    @Transactional
    public String gemFusion(GemFusionRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        if (request.getSourceTier() < 1 || request.getSourceTier() >= 5) {
            throw new GameRuleViolationException("Ngọc chỉ có thể ghép từ Tier 1 lên tối đa Tier 5!");
        }

        long goldCost = 300L * request.getSourceTier();
        if (user.getGold() < goldCost) {
            throw new InsufficientResourceException("Không đủ Gold để ghép Ngọc! Cần: " + goldCost + ", Hiện có: " + user.getGold());
        }

        user.setGold(user.getGold() - goldCost);
        userRepository.save(user);

        String resultGem = cubeEngine.fuseGems(request.getGemType(), request.getSourceTier());
        log.info("💎 Gem Fusion SUCCESS: Created {} for User {}", resultGem, user.getId());

        return resultGem;
    }
}
