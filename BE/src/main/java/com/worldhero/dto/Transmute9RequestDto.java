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
public class Transmute9RequestDto {
    @NotNull(message = "userId is required")
    private UUID userId;

    @NotNull(message = "itemInstanceIds is required")
    @Size(min = 9, max = 9, message = "The Cube 9-Item Matrix requires exactly 9 item instances of the same rarity")
    private List<String> itemInstanceIds;

    private String category; // EQUIPMENT, ACCESSORY, MATERIAL, GEM
}
