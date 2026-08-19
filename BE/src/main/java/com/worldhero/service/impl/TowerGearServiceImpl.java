package com.worldhero.service.impl;

import com.worldhero.dto.CombatStatsDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.ItemSlot;
import com.worldhero.repository.ItemInstanceRepository;
import com.worldhero.repository.ResourceMutationLedgerRepository;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.IdempotencyHelper;
import com.worldhero.service.TowerGearService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TowerGearServiceImpl implements TowerGearService {

    private final ItemInstanceRepository itemInstanceRepository;
    private final UserRepository userRepository;
    private final ResourceMutationLedgerRepository mutationLedgerRepository;
    private final ObjectMapper objectMapper;

    private static final int[] ENHANCE_GOLD_COSTS = {
            100, 200, 300, 500, 800, 1200, 1700, 2300, 3000, 4000, 5500, 7500, 10000, 14000, 20000
    };

    private static final int[] ENHANCE_STONE_COSTS = {
            1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 18, 25
    };

    @Override
    public EnhanceCost getEnhanceCost(int currentEnhanceLevel) {
        if (currentEnhanceLevel < 0 || currentEnhanceLevel >= MAX_ENHANCE_LEVEL) {
            return new EnhanceCost(0, 0);
        }
        return new EnhanceCost(ENHANCE_GOLD_COSTS[currentEnhanceLevel], ENHANCE_STONE_COSTS[currentEnhanceLevel]);
    }

    @Override
    public int getTotalGoldSpentOnEnhance(int enhanceLevel) {
        int total = 0;
        for (int i = 0; i < Math.min(enhanceLevel, MAX_ENHANCE_LEVEL); i++) {
            total += ENHANCE_GOLD_COSTS[i];
        }
        return total;
    }

    @Override
    public int getTotalStonesSpentOnEnhance(int enhanceLevel) {
        int total = 0;
        for (int i = 0; i < Math.min(enhanceLevel, MAX_ENHANCE_LEVEL); i++) {
            total += ENHANCE_STONE_COSTS[i];
        }
        return total;
    }

    public static double getRarityMultiplier(ItemRarity rarity) {
        if (rarity == null) return 1.0;
        return switch (rarity) {
            case COMMON -> 1.00;
            case UNCOMMON -> 1.06;
            case RARE -> 1.14;
            case EPIC -> 1.24;
            case LEGENDARY, MYTHIC, ANCIENT -> 1.35;
        };
    }

    @Override
    public CombatStatsDto computeGearCombatStats(ItemSlot slot, ItemRarity rarity, int itemLevel, int enhanceLevel) {
        int safeLevel = Math.max(1, Math.min(50, itemLevel));
        int safeEnhance = Math.max(0, Math.min(MAX_ENHANCE_LEVEL, enhanceLevel));
        double rarityMult = getRarityMultiplier(rarity);

        CombatStatsDto.CombatStatsDtoBuilder builder = CombatStatsDto.builder();

        if (slot == null) return builder.build();

        switch (slot) {
            case MAIN_HAND -> {
                // WPN: Base 12 ATK
                int atk = (int) Math.round(12.0 * (1.0 + 0.030 * (safeLevel - 1)) * rarityMult * (1.0 + 0.015 * safeEnhance));
                builder.atk(atk);
            }
            case OFF_HAND -> {
                // OFF: Base 12 Armor or 7 ATK
                int armor = (int) Math.round(12.0 * (1.0 + 0.030 * (safeLevel - 1)) * rarityMult * (1.0 + 0.015 * safeEnhance));
                builder.armor(armor);
            }
            case HELMET -> {
                // HLM: Base 90 HP
                int hp = (int) Math.round(90.0 * (1.0 + 0.030 * (safeLevel - 1)) * rarityMult * (1.0 + 0.015 * safeEnhance));
                builder.maxHp(hp);
            }
            case ARMOR -> {
                // ARM: Base 18 Armor
                int armor = (int) Math.round(18.0 * (1.0 + 0.030 * (safeLevel - 1)) * rarityMult * (1.0 + 0.015 * safeEnhance));
                builder.armor(armor);
            }
            case PANTS -> {
                // PNT: Base 70 HP
                int hp = (int) Math.round(70.0 * (1.0 + 0.030 * (safeLevel - 1)) * rarityMult * (1.0 + 0.015 * safeEnhance));
                builder.maxHp(hp);
            }
            case BOOTS -> {
                // Discrete Speed: 4/5/6/7/8 + bonus at +5, +10, +15
                int baseSpeed = switch (rarity != null ? rarity : ItemRarity.COMMON) {
                    case COMMON -> 4;
                    case UNCOMMON -> 5;
                    case RARE -> 6;
                    case EPIC -> 7;
                    case LEGENDARY, MYTHIC, ANCIENT -> 8;
                };
                int enhanceSpeedBonus = (safeEnhance >= 15 ? 3 : (safeEnhance >= 10 ? 2 : (safeEnhance >= 5 ? 1 : 0)));
                builder.speed(baseSpeed + enhanceSpeedBonus);
            }
            case RING_1 -> {
                // Discrete Crit Rate: 2/3/4/5/6% + 1% at +5, +10, +15
                double baseCritRate = switch (rarity != null ? rarity : ItemRarity.COMMON) {
                    case COMMON -> 2.0;
                    case UNCOMMON -> 3.0;
                    case RARE -> 4.0;
                    case EPIC -> 5.0;
                    case LEGENDARY, MYTHIC, ANCIENT -> 6.0;
                };
                double enhanceCritBonus = (safeEnhance >= 15 ? 3.0 : (safeEnhance >= 10 ? 2.0 : (safeEnhance >= 5 ? 1.0 : 0.0)));
                builder.critRate(baseCritRate + enhanceCritBonus);
            }
            case TALISMAN -> {
                // Discrete Crit DMG bonus: 5/6/8/10/12% + 2% at +5, +10, +15
                double baseCritDmg = switch (rarity != null ? rarity : ItemRarity.COMMON) {
                    case COMMON -> 5.0;
                    case UNCOMMON -> 6.0;
                    case RARE -> 8.0;
                    case EPIC -> 10.0;
                    case LEGENDARY, MYTHIC, ANCIENT -> 12.0;
                };
                double enhanceCritDmgBonus = (safeEnhance >= 15 ? 6.0 : (safeEnhance >= 10 ? 4.0 : (safeEnhance >= 5 ? 2.0 : 0.0)));
                builder.critDmg(baseCritDmg + enhanceCritDmgBonus);
            }
        }

        return builder.build();
    }

    @Override
    public CombatStatsDto computeTotalGearStats(List<ItemInstanceEntity> equippedItems) {
        if (equippedItems == null || equippedItems.isEmpty()) {
            return CombatStatsDto.builder().build();
        }

        int totalAtk = 0;
        int totalArmor = 0;
        int totalHp = 0;
        int totalSpeed = 0;
        double totalCritRate = 0.0;
        double totalCritDmgBonus = 0.0;

        for (ItemInstanceEntity item : equippedItems) {
            if (item == null || item.getTemplate() == null) continue;
            ItemSlot slot = item.getTemplate().getSlotType();
            ItemRarity rarity = item.getCurrentRarity() != null ? item.getCurrentRarity() : item.getTemplate().getBaseRarity();
            CombatStatsDto stats = computeGearCombatStats(slot, rarity, item.getItemLevel(), item.getEnhanceLevel());

            totalAtk += stats.getAtk();
            totalArmor += stats.getArmor();
            totalHp += stats.getMaxHp();
            totalSpeed += stats.getSpeed();
            totalCritRate += stats.getCritRate();
            totalCritDmgBonus += stats.getCritDmg();
        }

        return CombatStatsDto.builder()
                .atk(totalAtk)
                .armor(totalArmor)
                .maxHp(totalHp)
                .speed(totalSpeed)
                .critRate(totalCritRate)
                .critDmg(150.0 + totalCritDmgBonus)
                .build();
    }

    /**
     * @deprecated Use {@link #enhanceItem(UUID, UUID, String)} with an explicit operationKey.
     */
    @Override
    @Transactional
    @Deprecated
    public ItemInstanceDto enhanceItem(UUID userId, UUID itemInstanceId) {
        throw new GameRuleViolationException(
                "operationKey is required for ENHANCE. Use the enhanceItem overload with operationKey.");
    }

    @Override
    @Transactional
    public ItemInstanceDto enhanceItem(UUID userId, UUID itemInstanceId, String operationKey) {
        IdempotencyHelper.requireKey(operationKey, "ENHANCE");

        UserEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new GameRuleViolationException("User not found"));

        String inputHash = IdempotencyHelper.computeHash("ENHANCE", userId, itemInstanceId);
        ItemInstanceDto cached = IdempotencyHelper.checkAndReturn(
                mutationLedgerRepository, objectMapper, userId, "ENHANCE", operationKey, inputHash, ItemInstanceDto.class);
        if (cached != null) return cached;

        ItemInstanceEntity item = itemInstanceRepository.findById(itemInstanceId)
                .orElseThrow(() -> new GameRuleViolationException("Item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Item does not belong to user");
        }

        int currentEnhance = item.getEnhanceLevel();
        if (currentEnhance >= MAX_ENHANCE_LEVEL) {
            throw new GameRuleViolationException("Item already at max enhance level +" + MAX_ENHANCE_LEVEL);
        }

        EnhanceCost cost = getEnhanceCost(currentEnhance);
        if (user.getGold() < cost.gold()) {
            throw new GameRuleViolationException("Insufficient gold: requires " + cost.gold() + ", has " + user.getGold());
        }
        if (user.getEnhanceStones() < cost.stones()) {
            throw new GameRuleViolationException("Insufficient enhance stones: requires " + cost.stones() + ", has " + user.getEnhanceStones());
        }

        user.setGold(user.getGold() - cost.gold());
        user.setEnhanceStones(user.getEnhanceStones() - cost.stones());
        item.setEnhanceLevel(currentEnhance + 1);
        itemInstanceRepository.save(item);

        ItemInstanceDto result = item.toInstanceDto();
        IdempotencyHelper.persist(mutationLedgerRepository, objectMapper, user, "ENHANCE", operationKey, inputHash, result);
        return result;
    }


    /**
     * @deprecated Use {@link #transferEnhance(UUID, UUID, UUID, String)} with an explicit operationKey.
     */
    @Override
    @Transactional
    @Deprecated
    public ItemInstanceDto transferEnhance(UUID userId, UUID sourceItemId, UUID targetItemId) {
        throw new GameRuleViolationException(
                "operationKey is required for TRANSFER. Use the transferEnhance overload with operationKey.");
    }

    @Override
    @Transactional
    public ItemInstanceDto transferEnhance(UUID userId, UUID sourceItemId, UUID targetItemId, String operationKey) {
        IdempotencyHelper.requireKey(operationKey, "TRANSFER");

        UserEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new GameRuleViolationException("User not found"));

        String inputHash = IdempotencyHelper.computeHash("TRANSFER", userId, sourceItemId, targetItemId);
        ItemInstanceDto cached = IdempotencyHelper.checkAndReturn(
                mutationLedgerRepository, objectMapper, userId, "TRANSFER", operationKey, inputHash, ItemInstanceDto.class);
        if (cached != null) return cached;

        if (sourceItemId.equals(targetItemId)) {
            throw new GameRuleViolationException("Cannot transfer enhance level to the same item");
        }

        ItemInstanceEntity source = itemInstanceRepository.findById(sourceItemId)
                .orElseThrow(() -> new GameRuleViolationException("Source item not found"));
        ItemInstanceEntity target = itemInstanceRepository.findById(targetItemId)
                .orElseThrow(() -> new GameRuleViolationException("Target item not found"));

        if (!source.getUser().getId().equals(user.getId()) || !target.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Both items must belong to user");
        }

        if (source.getTemplate() == null || target.getTemplate() == null) {
            throw new GameRuleViolationException("Item template missing for enhance transfer");
        }

        if (source.getTemplate().getSlotType() != target.getTemplate().getSlotType()) {
            throw new GameRuleViolationException("Items must have matching slot for transfer: " +
                    source.getTemplate().getSlotType() + " vs " + target.getTemplate().getSlotType());
        }

        int sourceEnhance = source.getEnhanceLevel();
        if (sourceEnhance <= 0) {
            throw new GameRuleViolationException("Source item has no enhance level to transfer");
        }

        if (target.getEnhanceLevel() > 0) {
            throw new GameRuleViolationException("Target item must be +0 (unenhanced) to receive enhancement transfer without losing invested stones");
        }

        int totalGoldSpent = getTotalGoldSpentOnEnhance(sourceEnhance);
        int fee = (int) Math.round(totalGoldSpent * 0.10);

        if (user.getGold() < fee) {
            throw new GameRuleViolationException("Insufficient gold for transfer fee: requires " + fee + ", has " + user.getGold());
        }

        user.setGold(user.getGold() - fee);
        target.setEnhanceLevel(sourceEnhance);
        source.setEnhanceLevel(0);
        itemInstanceRepository.save(source);
        itemInstanceRepository.save(target);

        ItemInstanceDto result = target.toInstanceDto();
        IdempotencyHelper.persist(mutationLedgerRepository, objectMapper, user, "TRANSFER", operationKey, inputHash, result);
        return result;
    }

    /**
     * @deprecated Use {@link #salvageItems(UUID, List, String)} with an explicit operationKey.
     */
    @Override
    @Transactional
    @Deprecated
    public int salvageItems(UUID userId, List<UUID> itemInstanceIds) {
        throw new GameRuleViolationException(
                "operationKey is required for SALVAGE. Use the salvageItems overload with operationKey.");
    }

    @Override
    @Transactional
    public int salvageItems(UUID userId, List<UUID> itemInstanceIds, String operationKey) {
        IdempotencyHelper.requireKey(operationKey, "SALVAGE");

        UserEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new GameRuleViolationException("User not found"));
        if (itemInstanceIds == null || itemInstanceIds.isEmpty()) {
            return 0;
        }

        for (UUID id : itemInstanceIds) {
            if (id == null) {
                throw new GameRuleViolationException("Null item ID found in salvage list");
            }
        }

        java.util.Set<UUID> uniqueSet = new java.util.HashSet<>(itemInstanceIds);
        if (uniqueSet.size() != itemInstanceIds.size()) {
            throw new GameRuleViolationException("Duplicate item IDs found in salvage list");
        }

        // Canonical sort for deterministic hash and processing order
        List<UUID> sorted = uniqueSet.stream().sorted().toList();
        String inputHash = IdempotencyHelper.computeHash("SALVAGE", userId,
                sorted.stream().map(UUID::toString).reduce("", (a, b) -> a + "," + b));

        Integer cached = IdempotencyHelper.checkAndReturn(
                mutationLedgerRepository, objectMapper, userId, "SALVAGE", operationKey, inputHash, Integer.class);
        if (cached != null) return cached;

        int totalStonesGained = 0;
        for (UUID id : sorted) {
            ItemInstanceEntity item = itemInstanceRepository.findById(id)
                    .orElseThrow(() -> new GameRuleViolationException("Item not found for salvage: " + id));

            if (!item.getUser().getId().equals(user.getId())) {
                throw new GameRuleViolationException("Item " + id + " does not belong to user");
            }
            if (item.getHero() != null) {
                throw new GameRuleViolationException("Cannot salvage item " + item.getId() + " because it is currently equipped");
            }

            ItemRarity rarity = item.getCurrentRarity() != null ? item.getCurrentRarity() :
                    (item.getTemplate() != null ? item.getTemplate().getBaseRarity() : ItemRarity.COMMON);

            int baseStones = switch (rarity) {
                case COMMON -> 1;
                case UNCOMMON -> 2;
                case RARE -> 5;
                case EPIC -> 12;
                case LEGENDARY, MYTHIC, ANCIENT -> 30;
            };
            int spentStones = getTotalStonesSpentOnEnhance(item.getEnhanceLevel());
            totalStonesGained += baseStones + (int) Math.round(spentStones * 0.70);
            itemInstanceRepository.delete(item);
        }

        user.setEnhanceStones(user.getEnhanceStones() + totalStonesGained);
        userRepository.save(user);

        IdempotencyHelper.persist(mutationLedgerRepository, objectMapper, user, "SALVAGE", operationKey, inputHash, totalStonesGained);
        return totalStonesGained;
    }
}
