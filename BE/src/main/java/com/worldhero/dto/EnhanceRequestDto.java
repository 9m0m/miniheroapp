package com.worldhero.dto;

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
public class EnhanceRequestDto {
    @NotNull(message = "userId is required")
    private UUID userId;

    @NotNull(message = "itemInstanceId is required")
    private UUID itemInstanceId;

    private boolean useInsurance; // Lucky Forge Protection (0.1 WLD or token)
}
