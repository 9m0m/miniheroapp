package com.worldhero.service;

import com.worldhero.dto.ChestVaultDto;
import com.worldhero.dto.OpenVaultChestRequestDto;
import com.worldhero.dto.OpenVaultChestResponseDto;
import com.worldhero.model.entity.ChestInstanceEntity;
import com.worldhero.model.entity.UserEntity;

import java.util.UUID;

public interface ChestVaultService {
    ChestVaultDto getChestVault(UUID userId);
    OpenVaultChestResponseDto openChest(UUID userId, OpenVaultChestRequestDto request);
    ChestInstanceEntity persistChestDrop(UserEntity user, String templateId, int itemLevel);
}
