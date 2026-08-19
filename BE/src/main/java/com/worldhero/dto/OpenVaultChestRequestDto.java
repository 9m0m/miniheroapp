package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenVaultChestRequestDto {
    private UUID chestId;
    private String chestTier;
    private String idempotencyKey;
}
