package com.worldhero.service.impl;

import com.worldhero.dto.OnboardingAdvanceRequestDto;
import com.worldhero.dto.OnboardingStateDto;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.OnboardingStateEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.OnboardingStep;
import com.worldhero.repository.OnboardingStateRepository;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.OnboardingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OnboardingServiceImpl implements OnboardingService {

    private final OnboardingStateRepository onboardingRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OnboardingStateDto getOnboardingState(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        OnboardingStateEntity state = onboardingRepository.findByUserId(userId)
                .orElseGet(() -> {
                    OnboardingStateEntity newState = OnboardingStateEntity.builder()
                            .user(user)
                            .step(OnboardingStep.WELCOME)
                            .lifetimePulls(0)
                            .knightSummoned(false)
                            .rangerSummoned(false)
                            .thirdSummonCompleted(false)
                            .firstExpeditionClaimed(false)
                            .build();
                    return onboardingRepository.save(newState);
                });

        return mapToDto(state, user);
    }

    @Override
    @Transactional
    public OnboardingStateDto advanceOnboarding(UUID userId, OnboardingAdvanceRequestDto request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        OnboardingStateEntity state = onboardingRepository.findByUserId(userId)
                .orElseGet(() -> OnboardingStateEntity.builder()
                        .user(user)
                        .step(OnboardingStep.WELCOME)
                        .lifetimePulls(0)
                        .build());

        OnboardingStep currentStep = state.getStep();
        OnboardingStep targetStep = request.getTargetStep();

        // Forward-only idempotency guard — WELCOME resets are not supported in production.
        // A targetStep at or before currentStep is silently accepted and returns the current state.
        if (targetStep == null || currentStep.ordinal() >= targetStep.ordinal()) {
            return mapToDto(state, user);
        }

        // Validate and apply forward step progression
        if (targetStep == OnboardingStep.SUMMON_KNIGHT_REQUIRED) {
            // Grant 1 ticket for scripted Knight pull if none available
            if (!state.isKnightSummoned() && user.getStandardSummonTickets() == 0) {
                user.setStandardSummonTickets(user.getStandardSummonTickets() + 1);
                userRepository.save(user);
            }
            state.setStep(OnboardingStep.SUMMON_KNIGHT_REQUIRED);
        } else if (targetStep == OnboardingStep.SUMMON_RANGER_REQUIRED) {
            if (state.isKnightSummoned()) {
                if (!state.isRangerSummoned() && user.getStandardSummonTickets() == 0) {
                    user.setStandardSummonTickets(user.getStandardSummonTickets() + 1);
                    userRepository.save(user);
                }
                state.setStep(OnboardingStep.SUMMON_RANGER_REQUIRED);
            }
        } else if (targetStep == OnboardingStep.FIRST_EXPEDITION_REQUIRED) {
            if (state.isKnightSummoned() && state.isRangerSummoned()) {
                state.setStep(OnboardingStep.FIRST_EXPEDITION_REQUIRED);
            }
        } else if (targetStep == OnboardingStep.FIRST_EXPEDITION_RUNNING) {
            state.setStep(OnboardingStep.FIRST_EXPEDITION_RUNNING);
        } else if (targetStep == OnboardingStep.FIRST_EXPEDITION_CLAIM_REQUIRED) {
            state.setStep(OnboardingStep.FIRST_EXPEDITION_CLAIM_REQUIRED);
        } else if (targetStep == OnboardingStep.THIRD_SUMMON_REQUIRED) {
            state.setStep(OnboardingStep.THIRD_SUMMON_REQUIRED);
        } else if (targetStep == OnboardingStep.COMPLETE) {
            if (state.isThirdSummonCompleted()) {
                state.setStep(OnboardingStep.COMPLETE);
            }
        }

        onboardingRepository.save(state);
        return mapToDto(state, user);
    }

    @Override
    @Transactional
    public void syncOnboardingStep(UUID userId, OnboardingStep newStep) {
        onboardingRepository.findByUserId(userId).ifPresent(state -> {
            if (state.getStep().ordinal() < newStep.ordinal()) {
                state.setStep(newStep);
                onboardingRepository.save(state);
            }
        });
    }

    private OnboardingStateDto mapToDto(OnboardingStateEntity state, UserEntity user) {
        boolean towerUnlocked = state.getStep() == OnboardingStep.COMPLETE || state.isThirdSummonCompleted();
        return OnboardingStateDto.builder()
                .step(state.getStep())
                .lifetimePulls(state.getLifetimePulls())
                .knightSummoned(state.isKnightSummoned())
                .rangerSummoned(state.isRangerSummoned())
                .thirdSummonCompleted(state.isThirdSummonCompleted())
                .firstExpeditionClaimed(state.isFirstExpeditionClaimed())
                .towerUnlocked(towerUnlocked)
                .standardSummonTickets(user.getStandardSummonTickets())
                .build();
    }
}
