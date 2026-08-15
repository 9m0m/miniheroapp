package com.worldhero.dto;

import com.worldhero.model.enums.ItemSlot;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipRequestDto {
    @NotNull(message = "userId is required")
    private UUID userId;

    @NotNull(message = "heroId is required")
    private UUID heroId;

    @NotNull(message = "itemInstanceId is required")
    private UUID itemInstanceId;

    private ItemSlot targetSlot; // optional: if null, defaults to template's slotType
}
