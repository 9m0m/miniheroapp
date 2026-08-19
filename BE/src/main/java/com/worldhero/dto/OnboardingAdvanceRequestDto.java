package com.worldhero.dto;

import com.worldhero.model.enums.OnboardingStep;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingAdvanceRequestDto {
    private OnboardingStep targetStep;
    private String idempotencyKey;
}
