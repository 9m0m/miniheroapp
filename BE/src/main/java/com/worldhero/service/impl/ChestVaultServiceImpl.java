package com.worldhero.service.impl;

import com.worldhero.dto.ChestVaultDto;
import com.worldhero.dto.OpenVaultChestRequestDto;
import com.worldhero.dto.OpenVaultChestResponseDto;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.ChestInstanceEntity;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.ItemTemplateEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.ItemType;
import com.worldhero.model.enums.QuestActionType;
import com.worldhero.repository.ChestInstanceRepository;
import com.worldhero.repository.DropTableConfigRepository;
import com.worldhero.repository.ItemInstanceRepository;
import com.worldhero.repository.ItemTemplateRepository;
import com.worldhero.service.ChestVaultService;
import com.worldhero.service.ItemTemplateCacheService;
import com.worldhero.service.QuestService;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChestVaultServiceImpl implements ChestVaultService {

    private final ChestInstanceRepository chestInstanceRepository;
    private final ItemInstanceRepository itemInstanceRepository;
    private final ItemTemplateRepository itemTemplateRepository;
    private final DropTableConfigRepository dropTableConfigRepository;
    private final ItemTemplateCacheService itemTemplateCacheService;
    private final UserService userService;
    private final QuestService questService;

    @Override
    @Transactional(readOnly = true)
    public ChestVaultDto getChestVault(UUID userId) {
        UserEntity user = userService.getUserOrThrow(userId);
        List<ChestInstanceEntity> activeChests = chestInstanceRepository.findByUser_IdAndIsOpenedFalseOrderByCreatedAtDesc(user.getId());

        int normal = 0;

        List<ChestVaultDto.ChestItemDetailDto> details = new java.util.ArrayList<>();
        for (ChestInstanceEntity c : activeChests) {
            String tpl = c.getTemplateId();
            normal++;
            details.add(ChestVaultDto.ChestItemDetailDto.builder()
                    .id(c.getId())
                    .templateId(c.getTemplateId())
                    .itemLevel(c.getItemLevel())
                    .createdAt(c.getCreatedAt())
                    .build());
        }

        return ChestVaultDto.builder()
                .normalChests(normal)
                .totalChests(activeChests.size())
                .chests(details)
                .build();
    }

    @Override
    @Transactional
    public ChestInstanceEntity persistChestDrop(UserEntity user, String templateId, int itemLevel) {
        ChestInstanceEntity chest = ChestInstanceEntity.builder()
                .user(user)
                .templateId(templateId != null ? templateId : "chest_normal")
                .itemLevel(Math.max(1, itemLevel))
                .isOpened(false)
                .build();

        chest = chestInstanceRepository.save(chest);
        log.info("🎁 Chest Vault Drop Persisted: User {} received [{}] (ID: {})",
                user.getId(), chest.getTemplateId(), chest.getId());
        return chest;
    }

    @Override
    @Transactional
    public OpenVaultChestResponseDto openChest(UUID userId, OpenVaultChestRequestDto request) {
        UserEntity user = userService.getUserOrThrow(userId);

        // 1. Capacity Check: Ensure user has room in bag for new reward item
        List<ItemInstanceEntity> bagItems = itemInstanceRepository.findBagItemsWithTemplateByUserId(user.getId());
        int maxSlots = user.getInventorySlots();
        if (bagItems.size() >= maxSlots) {
            throw new GameRuleViolationException("Túi đồ đã đầy (" + bagItems.size() + "/" + maxSlots + "). Vui lòng dọn túi trước khi mở rương.");
        }

        // 2. Locate chest to consume
        ChestInstanceEntity targetChest = null;
        if (request != null && request.getChestId() != null) {
            targetChest = chestInstanceRepository.findById(request.getChestId())
                    .filter(c -> c.getUser().getId().equals(user.getId()) && !c.isOpened())
                    .orElse(null);
        } else if (request != null && request.getChestTier() != null && !request.getChestTier().isBlank()) {
            targetChest = chestInstanceRepository.findFirstByUser_IdAndTemplateIdAndIsOpenedFalseOrderByCreatedAtAsc(
                    user.getId(), request.getChestTier()
            ).orElse(null);
        } else {
            List<ChestInstanceEntity> allUnopened = chestInstanceRepository.findByUser_IdAndIsOpenedFalseOrderByCreatedAtDesc(user.getId());
            if (!allUnopened.isEmpty()) {
                targetChest = allUnopened.get(0);
            }
        }

        if (targetChest == null) {
            throw new ResourceNotFoundException("Không tìm thấy rương hợp lệ trong Chest Vault để mở!");
        }

        // 3. Atomic consume chest
        int consumed = chestInstanceRepository.consumeChestAtomic(targetChest.getId(), user.getId(), LocalDateTime.now());
        if (consumed != 1) {
            throw new GameRuleViolationException("Rương đã được mở hoặc có thao tác xung đột!");
        }

        // 4. Determine loot rarity from drop config weights
        String chestTplId = targetChest.getTemplateId();
        var dropConfig = dropTableConfigRepository.findByWorldIndexAndStageIndex(1, 1).orElse(null);

        ItemRarity chosenRarity = ItemRarity.COMMON;
        double roll = ThreadLocalRandom.current().nextDouble(0.0, 100.0);

        if ("chest_normal".equalsIgnoreCase(chestTplId)) {
            double cWeight = dropConfig != null ? dropConfig.getNormalCommonWeight() * 100.0 : 85.0;
            double uWeight = dropConfig != null ? dropConfig.getNormalUncommonWeight() * 100.0 : 12.0;
            double rWeight = dropConfig != null ? dropConfig.getNormalRareWeight() * 100.0 : 3.0;
            double eWeight = dropConfig != null ? dropConfig.getNormalEpicWeight() * 100.0 : 0.0;

            if (roll < cWeight) chosenRarity = ItemRarity.COMMON;
            else if (roll < cWeight + uWeight) chosenRarity = ItemRarity.UNCOMMON;
            else if (roll < cWeight + uWeight + rWeight) chosenRarity = ItemRarity.RARE;
            else if (roll < cWeight + uWeight + rWeight + eWeight) chosenRarity = ItemRarity.EPIC;
            else chosenRarity = ItemRarity.LEGENDARY;
        }

        // 5. Pick equipment or accessory template
        ItemTemplateEntity chosenTemplate = itemTemplateCacheService.getRandomTemplateByRarity(chosenRarity);
        if (chosenTemplate == null || chosenTemplate.getItemType() == ItemType.KEY || chosenTemplate.getItemType() == ItemType.CHEST) {
            List<ItemTemplateEntity> allTemplates = itemTemplateRepository.findAll();
            List<ItemTemplateEntity> validGearTemplates = allTemplates.stream()
                    .filter(t -> t.getItemType() == ItemType.EQUIPMENT || t.getItemType() == ItemType.ACCESSORY)
                    .toList();
            chosenTemplate = validGearTemplates.isEmpty()
                    ? itemTemplateRepository.findById("wpn_iron_sword").orElseThrow()
                    : validGearTemplates.get(ThreadLocalRandom.current().nextInt(validGearTemplates.size()));
        }

        // 6. Create reward ItemInstanceEntity in user's inventory
        ItemInstanceEntity rewardItem = ItemInstanceEntity.builder()
                .user(user)
                .hero(null) // in bag
                .equippedSlot(null)
                .template(chosenTemplate)
                .itemLevel(1) // Level 1 base equipment
                .currentRarity(chosenRarity)
                .enhanceLevel(0)
                .sockets("[]")
                .subStats("{}")
                .build();

        rewardItem = itemInstanceRepository.save(rewardItem);
        log.info("🎉 Chest Opened: User {} consumed {} and received [{}] {} (ID: {})",
                user.getId(), targetChest.getTemplateId(), chosenRarity, chosenTemplate.getName(), rewardItem.getId());

        // 7. Record quest progress
        try {
            questService.recordQuestAction(user.getId(), QuestActionType.CHEST_OPEN, 1);
        } catch (Exception e) {
            log.warn("Failed to record quest progress for chest open: {}", e.getMessage());
        }

        // 8. Return response with remaining vault state
        ChestVaultDto updatedVault = getChestVault(user.getId());
        return OpenVaultChestResponseDto.builder()
                .openedItem(rewardItem.toInstanceDto())
                .chestVault(updatedVault)
                .message("Đã mở rương thành công!")
                .build();
    }
}
