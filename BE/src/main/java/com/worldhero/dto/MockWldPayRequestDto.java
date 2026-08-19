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
public class MockWldPayRequestDto {
    @NotNull(message = "userId is required")
    private UUID userId;

    @NotBlank(message = "featureKey is required (PIGGY_BANK, GOLDEN_PASS)")
    private String featureKey;

    private double amountWld; // e.g. 0.5, 1.0, 2.0
}
