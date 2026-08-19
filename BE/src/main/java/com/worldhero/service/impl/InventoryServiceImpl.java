package com.worldhero.service.impl;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.*;
import com.worldhero.engine.StatEvaluator;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.HeroEntity;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.ItemTemplateEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.HeroBusyStatus;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.ItemSlot;
import com.worldhero.model.enums.ItemType;
import com.worldhero.repository.HeroRepository;
import com.worldhero.repository.ItemInstanceRepository;
import com.worldhero.repository.ItemTemplateRepository;
import com.worldhero.service.HeroService;
import com.worldhero.service.InventoryService;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceImpl implements InventoryService {

    private final ItemInstanceRepository itemInstanceRepository;
    private final ItemTemplateRepository itemTemplateRepository;
    private final com.worldhero.repository.DropTableConfigRepository dropTableConfigRepository;
    private final com.worldhero.service.ItemTemplateCacheService itemTemplateCacheService;
    private final HeroRepository heroRepository;
    private final UserService userService;
    private final HeroService heroService;
    private final StatEvaluator statEvaluator;

    private UUID getEffectiveUserId(UUID requestedUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal && principal.getId() != null) {
            return principal.getId();
        }
        return requestedUserId;
    }

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
    @Transactional(readOnly = true)
    public List<ItemInstanceDto> getBagItems(UUID userId) {
        UUID effectiveId = getEffectiveUserId(userId);
        UserEntity user = userService.getUserOrThrow(effectiveId);
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
        UUID effectiveId = getEffectiveUserId(request.getUserId());
        UserEntity user = userService.getUserOrThrow(effectiveId);

        ItemInstanceEntity instance = findUserItemSafely(user, request.getItemInstanceId());
        if (instance == null) {
            throw new ResourceNotFoundException("Vật phẩm không tồn tại: " + request.getItemInstanceId());
        }

        if (!instance.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Bạn không sở hữu vật phẩm này.");
        }

        HeroEntity hero = heroRepository.findById(request.getHeroId())
                .orElseThrow(() -> new ResourceNotFoundException("Tướng không tồn tại: " + request.getHeroId()));

        if (!hero.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Bạn không sở hữu Tướng này.");
        }

        if (hero.getBusyStatus() == HeroBusyStatus.EXPEDITION_BUSY) {
            throw new GameRuleViolationException("Tướng đang tham gia Thám Hiểm, không thể đổi trang bị.");
        }

        // Validate Class Restriction
        if (instance.getTemplate().getRequiredClass() != null &&
                instance.getTemplate().getRequiredClass() != hero.getHeroClass()) {
            throw new GameRuleViolationException("Trang bị " + instance.getTemplate().getName() +
                    " yêu cầu hệ " + instance.getTemplate().getRequiredClass() +
                    ", nhưng tướng là " + hero.getHeroClass());
        }

        // Validate Target Slot
        ItemSlot requiredSlot = instance.getTemplate().getSlotType();
        ItemSlot targetSlot = request.getTargetSlot() != null ? request.getTargetSlot() : requiredSlot;
        if (targetSlot != requiredSlot) {
            throw new GameRuleViolationException("Vật phẩm " + instance.getTemplate().getName() +
                    " chỉ có thể trang bị vào ô " + requiredSlot.getDisplayName());
        }

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
        UUID effectiveId = getEffectiveUserId(request.getUserId());
        UserEntity user = userService.getUserOrThrow(effectiveId);

        ItemInstanceEntity instance = findUserItemSafely(user, request.getItemInstanceId());
        if (instance == null) {
            throw new ResourceNotFoundException("Vật phẩm không tồn tại: " + request.getItemInstanceId());
        }

        if (!instance.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Bạn không sở hữu vật phẩm này.");
        }

        HeroEntity hero = instance.getHero();
        if (hero == null) {
            throw new GameRuleViolationException("Vật phẩm chưa được trang bị trên tướng.");
        }

        if (hero.getBusyStatus() == HeroBusyStatus.EXPEDITION_BUSY) {
            throw new GameRuleViolationException("Tướng đang tham gia Thám Hiểm, không thể gỡ trang bị.");
        }

        instance.setHero(null);
        instance.setEquippedSlot(null);
        itemInstanceRepository.save(instance);

        log.info("📦 Hero {} unequipped item {}", hero.getHeroClass(), instance.getId());

        return heroService.buildHeroDetailDto(hero);
    }

    @Override
    @Transactional
    public OpenChestResponseDto openChest(OpenChestRequestDto request) {
        UUID effectiveId = getEffectiveUserId(request.getUserId());
        UserEntity user = userService.getUserOrThrow(effectiveId);

        ItemInstanceEntity chestInstance = findUserItemSafely(user, request.getChestItemInstanceId());
        if (chestInstance == null) {
            throw new ResourceNotFoundException("Rương không tồn tại trong túi đồ!");
        }

        if (chestInstance.getHero() != null) {
            throw new GameRuleViolationException("Không thể mở rương đang được trang bị!");
        }

        if (chestInstance.getTemplate().getItemType() != ItemType.CHEST) {
            throw new GameRuleViolationException("Vật phẩm được chọn không phải là Rương!");
        }

        String chestTplId = chestInstance.getTemplate().getId();
        int itemLevel = Math.max(1, chestInstance.getItemLevel());

        // 1. Atomic consume chest from DB
        int deleted = itemInstanceRepository.consumeChestAtomic(chestInstance.getId(), user.getId());
        if (deleted != 1) {
            throw new GameRuleViolationException("Rương đã được mở hoặc không còn trong túi đồ!");
        }

        // 2. Fetch live drop table weights from database for user's current world/stage
        var dropConfig = dropTableConfigRepository.findByWorldIndexAndStageIndex(
                1,
                1
        ).orElse(null);

        ItemRarity chosenRarity = ItemRarity.COMMON;
        double roll = ThreadLocalRandom.current().nextDouble(0.0, 100.0);

        double cWeight = dropConfig != null ? dropConfig.getNormalCommonWeight() * 100.0 : 85.0;
        double uWeight = dropConfig != null ? dropConfig.getNormalUncommonWeight() * 100.0 : 12.0;
        double rWeight = dropConfig != null ? dropConfig.getNormalRareWeight() * 100.0 : 3.0;
        double eWeight = dropConfig != null ? dropConfig.getNormalEpicWeight() * 100.0 : 0.0;

        if (roll < cWeight) chosenRarity = ItemRarity.COMMON;
        else if (roll < cWeight + uWeight) chosenRarity = ItemRarity.UNCOMMON;
        else if (roll < cWeight + uWeight + rWeight) chosenRarity = ItemRarity.RARE;
        else if (roll < cWeight + uWeight + rWeight + eWeight) chosenRarity = ItemRarity.EPIC;
        else chosenRarity = ItemRarity.LEGENDARY;

        // 3. Pick template with matching rarity
        ItemTemplateEntity chosenTemplate = itemTemplateCacheService.getRandomTemplateByRarity(chosenRarity);
        if (chosenTemplate == null || chosenTemplate.getItemType() == ItemType.KEY || chosenTemplate.getItemType() == ItemType.CHEST) {
            List<ItemTemplateEntity> allTemplates = itemTemplateRepository.findAll();
            List<ItemTemplateEntity> validGearTemplates = allTemplates.stream()
                    .filter(t -> t.getItemType() == ItemType.EQUIPMENT || t.getItemType() == ItemType.ACCESSORY)
                    .toList();
            chosenTemplate = validGearTemplates.isEmpty()
                    ? (allTemplates.isEmpty() ? null : allTemplates.get(0))
                    : validGearTemplates.get(ThreadLocalRandom.current().nextInt(validGearTemplates.size()));
        }

        if (chosenTemplate == null) {
            throw new ResourceNotFoundException("Không tìm thấy trang bị phù hợp khi mở rương!");
        }

        // 4. Create new unboxed gear
        ItemInstanceEntity unboxedItem = ItemInstanceEntity.builder()
                .user(user)
                .hero(null)
                .equippedSlot(null)
                .template(chosenTemplate)
                .itemLevel(itemLevel)
                .currentRarity(chosenRarity)
                .enhanceLevel(0)
                .sockets("[]")
                .subStats("{}")
                .build();

        unboxedItem = itemInstanceRepository.save(unboxedItem);
        log.info("📦 Opened Chest {}: Unboxed {} ({}) for User {}",
                chestTplId, chosenTemplate.getName(), chosenRarity, user.getId());

        ItemTemplateDto templateDto = unboxedItem.getTemplate().toTemplateDto();
        ItemInstanceDto instanceDto = unboxedItem.toInstanceDto();
        StatsDto stats = statEvaluator.computeItemStats(templateDto, instanceDto);
        instanceDto.setComputedStats(stats);

        return OpenChestResponseDto.builder()
                .openedItem(instanceDto)
                .chestType(chestTplId)
                .message("Mở rương thành công: [" + chosenRarity.getDisplayName() + "] " + chosenTemplate.getName())
                .build();
    }

    @Override
    @Transactional
    public int unlockSlots(UUID userId, int targetSlots) {
        UUID effectiveId = getEffectiveUserId(userId);
        UserEntity user = userService.getUserOrThrow(effectiveId);
        int clamped = Math.max(18, Math.min(90, targetSlots));
        if (clamped > user.getInventorySlots()) {
            user.setInventorySlots(clamped);
            log.info("User {} unlocked inventory slots to: {}", user.getId(), clamped);
        }
        return user.getInventorySlots();
    }
}
