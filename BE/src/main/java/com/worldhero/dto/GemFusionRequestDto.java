package com.worldhero.dto;

import com.worldhero.model.enums.GemType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GemFusionRequestDto {
    @NotNull(message = "userId is required")
    private UUID userId;

    @NotNull(message = "gemType is required")
    private GemType gemType;

    @Min(value = 1, message = "sourceTier must be between 1 and 4")
    @Max(value = 4, message = "sourceTier must be between 1 and 4")
    private int sourceTier; // 1 to 4 -> Fuses 3 into Tier (sourceTier + 1)
}
