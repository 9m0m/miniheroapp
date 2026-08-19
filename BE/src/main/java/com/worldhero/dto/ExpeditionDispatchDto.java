package com.worldhero.dto;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpeditionDispatchDto {
    private int slotIndex;
    private List<UUID> heroIds;
    private String idempotencyKey;
}
