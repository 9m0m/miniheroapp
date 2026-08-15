package com.worldhero.dto;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DropTableDetailDto {
    private UUID id;
    private Integer worldIndex;
    private Integer stageIndex;
    private Double chestDropChance;
    private Double stoneDropChance;
    private Double goldMultiplier;
    private Double legendaryBonusRate;
}
