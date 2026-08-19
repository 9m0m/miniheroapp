package com.worldhero.dto;

import com.worldhero.model.enums.HeroClass;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviveHeroResponseDto {
    private UUID userId;
    private HeroClass heroClass;
    private int remainingGems;
    private int cost;
    private String message;
}
