package com.worldhero.dto;

import com.worldhero.model.enums.SkillPolicy;
import com.worldhero.model.enums.TeamTactic;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    @Min(value = 1, message = "Floor number must be at least 1")
    @Max(value = 30, message = "Floor number cannot exceed 30")
    private int floorNumber;

    @NotNull(message = "Party slots are required")
    @Size(min = 3, max = 3, message = "Party must have exactly 3 slots")
    @Valid
    private List<TowerPartyGridSlotDto> slots;

    private TeamTactic tactic;
    private Map<UUID, SkillPolicy> heroPolicies;
    private List<UUID> energyPriority;

    @NotBlank(message = "Idempotency key is required")
    private String idempotencyKey;
}
