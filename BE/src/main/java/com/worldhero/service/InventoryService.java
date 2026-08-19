package com.worldhero.service;

import com.worldhero.dto.EquipRequestDto;
import com.worldhero.dto.HeroDetailDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.OpenChestRequestDto;
import com.worldhero.dto.OpenChestResponseDto;
import com.worldhero.dto.UnequipRequestDto;

import java.util.List;
import java.util.UUID;

public interface InventoryService {
    List<ItemInstanceDto> getBagItems(UUID userId);
    HeroDetailDto equipItem(EquipRequestDto request);
    HeroDetailDto unequipItem(UnequipRequestDto request);
    OpenChestResponseDto openChest(OpenChestRequestDto request);
    int unlockSlots(UUID userId, int targetSlots);
}
