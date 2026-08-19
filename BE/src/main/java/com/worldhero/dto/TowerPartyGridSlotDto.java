package com.worldhero.dto;

import com.worldhero.model.enums.GridCol;
import com.worldhero.model.enums.GridRow;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TowerPartyGridSlotDto {
    private UUID heroId;
    private GridRow row;
    private GridCol col;
}
