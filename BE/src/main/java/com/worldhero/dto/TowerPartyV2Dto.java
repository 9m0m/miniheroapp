package com.worldhero.dto;

import com.worldhero.model.enums.SkillPolicy;
import com.worldhero.model.enums.TeamTactic;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TowerPartyV2Dto {
    private List<TowerPartyGridSlotDto> slots;
    private TeamTactic tactic;
    private Map<UUID, SkillPolicy> heroPolicies;
    private List<UUID> energyPriority;
    private LocalDateTime updatedAt;
}
