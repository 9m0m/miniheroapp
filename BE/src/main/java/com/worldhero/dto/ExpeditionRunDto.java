package com.worldhero.dto;

import com.worldhero.model.enums.ExpeditionRunStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpeditionRunDto {
    private UUID id;
    private int slotIndex;
    private boolean isTutorial;
    private ExpeditionRunStatus status;
    private List<UUID> heroIds;
    private List<String> heroTemplateIds;
    private LocalDateTime startedAt;
    private LocalDateTime completesAt;
    private int durationSeconds;
    private long remainingSeconds;
    private boolean isClaimable;
    private Map<String, Object> rewardPreview;
}
