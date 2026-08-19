package com.worldhero.dto;

import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpeditionClaimResponseDto {
    private UUID expeditionRunId;
    private int slotIndex;
    private Map<String, Object> rewardsGranted;
    private List<UUID> releasedHeroIds;
    private UUID ledgerId;
}
