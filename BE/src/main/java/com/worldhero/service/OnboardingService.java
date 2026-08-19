package com.worldhero.service;

import com.worldhero.dto.OnboardingAdvanceRequestDto;
import com.worldhero.dto.OnboardingStateDto;
import com.worldhero.model.enums.OnboardingStep;

import java.util.UUID;

public interface OnboardingService {
    OnboardingStateDto getOnboardingState(UUID userId);
    OnboardingStateDto advanceOnboarding(UUID userId, OnboardingAdvanceRequestDto request);
    void syncOnboardingStep(UUID userId, OnboardingStep newStep);
}
