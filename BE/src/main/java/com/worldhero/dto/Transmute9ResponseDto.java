package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transmute9ResponseDto {
    private ItemInstanceDto resultItem;
    private boolean isJackpot;
    private boolean isFallback;
    private long remainingGold;
    private String message;
}
