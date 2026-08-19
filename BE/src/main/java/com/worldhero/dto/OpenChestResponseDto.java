package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenChestResponseDto {
    private ItemInstanceDto openedItem;
    private String chestType;
    private String message;
}
