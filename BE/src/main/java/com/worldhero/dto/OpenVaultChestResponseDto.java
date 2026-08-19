package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenVaultChestResponseDto {
    private ItemInstanceDto openedItem;
    private ChestVaultDto chestVault;
    private String message;
}
