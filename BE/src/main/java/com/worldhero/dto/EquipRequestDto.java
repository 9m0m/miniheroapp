package com.worldhero.dto;

import com.worldhero.model.enums.ItemSlot;
import jakarta.validation.constraints.NotBlank;
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
    private UUID userId;

    @NotNull(message = "heroId is required")
    private UUID heroId;

    @NotBlank(message = "itemInstanceId is required")
    private String itemInstanceId;

    private ItemSlot targetSlot; // optional: if null, defaults to template's slotType
}
