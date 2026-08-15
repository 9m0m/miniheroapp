package com.worldhero.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmartFusionRequestDto {
    @NotNull(message = "userId is required")
    private UUID userId;

    @NotNull(message = "itemInstanceIds is required")
    @Size(min = 3, max = 3, message = "Smart Fusion requires exactly 3 item instances of the same rarity")
    private List<UUID> itemInstanceIds;
}
