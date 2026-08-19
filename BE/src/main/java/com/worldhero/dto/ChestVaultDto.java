package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChestVaultDto {
    private int normalChests;
    private int totalChests;
    private List<ChestItemDetailDto> chests;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChestItemDetailDto {
        private UUID id;
        private String templateId;
        private int itemLevel;
        private LocalDateTime createdAt;
    }
}
