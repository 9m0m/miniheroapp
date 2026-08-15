package com.worldhero.dto;

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
public class CraftRequestDto {
    @NotNull(message = "userId is required")
    private UUID userId;

    @NotBlank(message = "recipeId is required (e.g. acc_ruby_ring, acc_emerald_ring, acc_heart_amulet, acc_dragon_talisman, SCROLL_OF_MIGHT)")
    private String recipeId;
}
