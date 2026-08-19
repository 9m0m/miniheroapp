package com.worldhero.service;

import com.worldhero.dto.CombatStatsDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.ItemTemplateDto;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.ItemSlot;

import java.util.List;
import java.util.UUID;

public interface TowerGearService {
    int MAX_ENHANCE_LEVEL = 15;

    record EnhanceCost(int gold, int stones) {}

    EnhanceCost getEnhanceCost(int currentEnhanceLevel);

    int getTotalGoldSpentOnEnhance(int enhanceLevel);

    int getTotalStonesSpentOnEnhance(int enhanceLevel);

    CombatStatsDto computeGearCombatStats(ItemSlot slot, ItemRarity rarity, int itemLevel, int enhanceLevel);

    CombatStatsDto computeTotalGearStats(List<com.worldhero.model.entity.ItemInstanceEntity> equippedItems);

    ItemInstanceDto enhanceItem(UUID userId, UUID itemInstanceId);

    ItemInstanceDto enhanceItem(UUID userId, UUID itemInstanceId, String operationKey);

    ItemInstanceDto transferEnhance(UUID userId, UUID sourceItemId, UUID targetItemId);

    ItemInstanceDto transferEnhance(UUID userId, UUID sourceItemId, UUID targetItemId, String operationKey);

    int salvageItems(UUID userId, List<UUID> itemInstanceIds);

    int salvageItems(UUID userId, List<UUID> itemInstanceIds, String operationKey);
}
