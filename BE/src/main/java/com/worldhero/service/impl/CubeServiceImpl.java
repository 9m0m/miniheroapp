package com.worldhero.service.impl;

import com.worldhero.dto.GemFusionRequestDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.ItemTemplateDto;
import com.worldhero.dto.SmartFusionRequestDto;
import com.worldhero.dto.StatsDto;
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

    @Override
    @Transactional
    public ItemInstanceDto smartFusion(SmartFusionRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        List<ItemInstanceEntity> inputItems = new ArrayList<>();
        for (UUID itemId : request.getItemInstanceIds()) {
            ItemInstanceEntity item = itemInstanceRepository.findById(itemId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vật phẩm không tồn tại: " + itemId));

            if (!item.getUser().getId().equals(user.getId())) {
                throw new GameRuleViolationException("Vật phẩm không thuộc sở hữu của người chơi.");
            }
            if (item.getHero() != null) {
                throw new GameRuleViolationException("Không thể ghép trang bị đang được Tướng sử dụng. Vui lòng tháo đồ trước!");
            }
            inputItems.add(item);
        }

        ItemRarity baseRarity = inputItems.get(0).getCurrentRarity();
        if (baseRarity == ItemRarity.LEGENDARY) {
            throw new GameRuleViolationException("Trang bị Huyền Thoại (Legendary) đã đạt phẩm cấp tối đa!");
        }

        for (ItemInstanceEntity item : inputItems) {
            if (item.getCurrentRarity() != baseRarity) {
                throw new GameRuleViolationException("Cả 3 trang bị đưa vào The Cube phải có cùng phẩm cấp!");
            }
        }

        // Fusion Cost in Gold
        long costGold = switch (baseRarity) {
            case COMMON -> 200L;
            case UNCOMMON -> 500L;
            case RARE -> 1500L;
            case EPIC -> 5000L;
            case LEGENDARY -> 0L;
        };

        if (user.getGold() < costGold) {
            throw new InsufficientResourceException("Không đủ Gold để kích hoạt The Cube! Cần: " + costGold + ", Hiện có: " + user.getGold());
        }

        user.setGold(user.getGold() - costGold);
        userRepository.save(user);

        // Calculate Result
        ItemRarity nextRarity = baseRarity.getNextTier();
        int avgILvl = (int) Math.round(inputItems.stream().mapToInt(ItemInstanceEntity::getItemLevel).average().orElse(1));
        var targetTemplate = inputItems.get(0).getTemplate();

        // Destroy 3 input materials
        itemInstanceRepository.deleteAll(inputItems);

        // Create 1 new fused item
        ItemInstanceEntity fusedItem = ItemInstanceEntity.builder()
                .user(user)
                .hero(null) // in bag
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
