package com.worldhero.dto;

import jakarta.validation.constraints.NotBlank;
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
public class UpgradeSkillRequestDto {
    @NotNull(message = "userId is required")
    private UUID userId;

    @NotNull(message = "heroId is required")
    private UUID heroId;

    @NotBlank(message = "skillId is required")
    private String skillId;
}
