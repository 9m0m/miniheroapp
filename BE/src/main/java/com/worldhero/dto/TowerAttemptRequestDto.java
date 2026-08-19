package com.worldhero.dto;

import com.worldhero.model.enums.SkillPolicy;
import com.worldhero.model.enums.TeamTactic;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TowerAttemptRequestDto {
    private int floorNumber;
    private List<TowerPartyGridSlotDto> slots;
    private TeamTactic tactic;
    private Map<UUID, SkillPolicy> heroPolicies;
    private List<UUID> energyPriority;
    private String idempotencyKey;
}
