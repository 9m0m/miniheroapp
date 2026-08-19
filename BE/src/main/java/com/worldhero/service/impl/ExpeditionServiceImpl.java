package com.worldhero.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldhero.dto.ExpeditionClaimResponseDto;
import com.worldhero.dto.ExpeditionConfigDto;
import com.worldhero.dto.ExpeditionDispatchDto;
import com.worldhero.dto.ExpeditionRunDto;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.*;
import com.worldhero.model.enums.ExpeditionRunStatus;
import com.worldhero.model.enums.HeroBusyStatus;
import com.worldhero.model.enums.OnboardingStep;
import com.worldhero.repository.*;
import com.worldhero.service.ExpeditionService;
import com.worldhero.service.IdempotencyHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpeditionServiceImpl implements ExpeditionService {

    private final ExpeditionRunRepository expeditionRunRepository;
    private final ExpeditionRewardLedgerRepository rewardLedgerRepository;
    private final UserRepository userRepository;
    private final HeroRepository heroRepository;
    private final OnboardingStateRepository onboardingRepository;
    private final ObjectMapper objectMapper;

    @Value("${expedition.paid-slots.enabled:false}")
    private boolean paidSlotsEnabled;

    @Value("${core.v2.enabled:true}")
    private boolean coreV2Enabled;

    public static final int TUTORIAL_DURATION_SECONDS = 10;
    public static final int NORMAL_DURATION_SECONDS = 28800; // 8 hours

    @Override
    public ExpeditionConfigDto getConfig() {
        return ExpeditionConfigDto.builder()
                .totalSlots(3)
                .unlockedSlots(paidSlotsEnabled ? 3 : 1)
                .tutorialDurationSeconds(TUTORIAL_DURATION_SECONDS)
                .normalDurationSeconds(NORMAL_DURATION_SECONDS)
                .paidSlotsEnabled(paidSlotsEnabled)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpeditionRunDto> getActiveRuns(UUID userId) {
        if (!coreV2Enabled) return List.of();
        List<ExpeditionRunEntity> runs = expeditionRunRepository.findByUserId(userId);
        return runs.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ExpeditionRunDto dispatch(UUID userId, ExpeditionDispatchDto request) {
        if (!coreV2Enabled) {
            throw new GameRuleViolationException("Core Game v2 Expeditions are currently disabled.");
        }
        String idempotencyKey = request.getIdempotencyKey();
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("idempotencyKey is required for expedition dispatch");
        }

        List<UUID> heroIds = request.getHeroIds();
        if (heroIds == null || heroIds.isEmpty() || heroIds.size() > 3) {
            throw new GameRuleViolationException("Expedition party must contain between 1 and 3 heroes.");
        }

        String sortedHeroIdsStr = heroIds.stream().sorted().map(UUID::toString).collect(Collectors.joining(","));
        String dispatchInputHash = IdempotencyHelper.computeHash(request.getSlotIndex() + ":" + sortedHeroIdsStr);

        // Lock user account pessimistically before validating slots, heroes, or idempotency
        UserEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Optional<ExpeditionRunEntity> existingRun = expeditionRunRepository
                .findByUserIdAndDispatchIdempotencyKey(userId, idempotencyKey);
        if (existingRun.isPresent()) {
            ExpeditionRunEntity run = existingRun.get();
            if (!dispatchInputHash.equals(run.getDispatchInputHash())) {
                throw new com.worldhero.exception.IdempotencyConflictException("EXPEDITION_DISPATCH", idempotencyKey);
            }
            return mapToDto(run);
        }

        int slotIndex = request.getSlotIndex();
        if (slotIndex < 0 || slotIndex > 2) {
            throw new GameRuleViolationException("Invalid slot index: " + slotIndex);
        }
        if (slotIndex > 0 && !paidSlotsEnabled) {
            throw new GameRuleViolationException("Paid expedition slots are currently disabled.");
        }

        // Check if slot is already occupied by an active run
        Optional<ExpeditionRunEntity> existingActive = expeditionRunRepository
                .findByUserIdAndSlotIndexAndStatus(userId, slotIndex, ExpeditionRunStatus.RUNNING);
        if (existingActive.isPresent()) {
            throw new GameRuleViolationException("Slot " + slotIndex + " already has an active Expedition run.");
        }

        // Verify distinct heroes
        Set<UUID> distinctHeroIds = new HashSet<>(heroIds);
        if (distinctHeroIds.size() != heroIds.size()) {
            throw new GameRuleViolationException("Duplicate heroes are not allowed in the same Expedition party.");
        }

        // Verify ownership and idle status
        List<HeroEntity> heroes = heroRepository.findByUserIdAndIdIn(userId, heroIds);
        if (heroes.size() != heroIds.size()) {
            throw new GameRuleViolationException("One or more selected heroes do not belong to the user.");
        }

        for (HeroEntity hero : heroes) {
            if (hero.getBusyStatus() == HeroBusyStatus.EXPEDITION_BUSY) {
                throw new GameRuleViolationException("Hero " + hero.getHeroTemplateId() + " is already busy on another Expedition.");
            }
        }

        OnboardingStateEntity onboarding = onboardingRepository.findByUserId(userId)
                .orElseGet(() -> onboardingRepository.save(OnboardingStateEntity.builder()
                        .user(user)
                        .step(OnboardingStep.WELCOME)
                        .lifetimePulls(0)
                        .build()));

        boolean isTutorial = !onboarding.isFirstExpeditionClaimed() &&
                (onboarding.getStep() == OnboardingStep.FIRST_EXPEDITION_REQUIRED ||
                 onboarding.getStep() == OnboardingStep.FIRST_EXPEDITION_RUNNING);

        int durationSeconds = isTutorial ? TUTORIAL_DURATION_SECONDS : NORMAL_DURATION_SECONDS;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime completesAt = now.plusSeconds(durationSeconds);

        // Lock heroes
        for (HeroEntity hero : heroes) {
            hero.setBusyStatus(HeroBusyStatus.EXPEDITION_BUSY);
        }
        heroRepository.saveAll(heroes);

        // Build snapshot rewards
        Map<String, Object> rewardSnapshot = new LinkedHashMap<>();
        if (isTutorial) {
            rewardSnapshot.put("gold", 1000L);
            rewardSnapshot.put("essence", 200L);
            rewardSnapshot.put("enhanceStones", 5);
            rewardSnapshot.put("standardSummonTickets", 1);
        } else {
            rewardSnapshot.put("gold", 5000L);
            rewardSnapshot.put("essence", 1000L);
            rewardSnapshot.put("enhanceStones", 15);
        }

        String heroIdsJson = writeJson(heroIds);
        String rewardSnapshotJson = writeJson(rewardSnapshot);

        ExpeditionRunEntity run = ExpeditionRunEntity.builder()
                .user(user)
                .slotIndex(slotIndex)
                .isTutorial(isTutorial)
                .status(ExpeditionRunStatus.RUNNING)
                .heroIdsJson(heroIdsJson)
                .rewardSnapshotJson(rewardSnapshotJson)
                .contentVersion("expedition-v1")
                .startedAt(now)
                .completesAt(completesAt)
                .dispatchIdempotencyKey(idempotencyKey)
                .dispatchInputHash(dispatchInputHash)
                .build();

        ExpeditionRunEntity savedRun = expeditionRunRepository.save(run);

        if (isTutorial && onboarding.getStep() == OnboardingStep.FIRST_EXPEDITION_REQUIRED) {
            onboarding.setStep(OnboardingStep.FIRST_EXPEDITION_RUNNING);
            onboardingRepository.save(onboarding);
        }

        return mapToDto(savedRun);
    }

    @Override
    @Transactional
    public ExpeditionClaimResponseDto claim(UUID userId, UUID runId, String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("idempotencyKey is required for expedition claim");
        }

        UserEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        String claimInputHash = IdempotencyHelper.computeHash(runId.toString());

        Optional<ExpeditionRewardLedgerEntity> existingLedger = rewardLedgerRepository
                .findByUserIdAndIdempotencyKey(userId, idempotencyKey);
        if (existingLedger.isPresent()) {
            ExpeditionRewardLedgerEntity ledger = existingLedger.get();
            if (!claimInputHash.equals(ledger.getClaimInputHash())) {
                throw new com.worldhero.exception.IdempotencyConflictException("EXPEDITION_CLAIM", idempotencyKey);
            }
            Map<String, Object> rewards = parseJson(ledger.getRewardPayloadJson());
            ExpeditionRunEntity run = expeditionRunRepository.findById(runId).orElse(null);
            List<UUID> heroIds = run != null ? parseHeroIds(run.getHeroIdsJson()) : List.of();
            return ExpeditionClaimResponseDto.builder()
                    .expeditionRunId(runId)
                    .slotIndex(run != null ? run.getSlotIndex() : 0)
                    .rewardsGranted(rewards)
                    .releasedHeroIds(heroIds)
                    .ledgerId(ledger.getId())
                    .build();
        }

        ExpeditionRunEntity run = expeditionRunRepository.findByIdAndUserId(runId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expedition run not found: " + runId));

        if (run.getStatus() == ExpeditionRunStatus.CLAIMED) {
            throw new GameRuleViolationException("Expedition run has already been claimed.");
        }
        if (run.getStatus() == ExpeditionRunStatus.CANCELLED) {
            throw new GameRuleViolationException("Expedition run was cancelled.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(run.getCompletesAt())) {
            long remaining = Duration.between(now, run.getCompletesAt()).getSeconds();
            throw new GameRuleViolationException("Expedition is still in progress. " + remaining + " seconds remaining.");
        }

        // Release heroes
        List<UUID> heroIds = parseHeroIds(run.getHeroIdsJson());
        List<HeroEntity> heroes = heroRepository.findByUserIdAndIdIn(userId, heroIds);
        for (HeroEntity hero : heroes) {
            hero.setBusyStatus(HeroBusyStatus.IDLE);
        }
        heroRepository.saveAll(heroes);

        // Grant rewards
        Map<String, Object> rewards = parseJson(run.getRewardSnapshotJson());
        if (rewards.containsKey("gold")) {
            user.setGold(user.getGold() + ((Number) rewards.get("gold")).longValue());
        }
        if (rewards.containsKey("essence")) {
            user.setEssence(user.getEssence() + ((Number) rewards.get("essence")).longValue());
        }
        if (rewards.containsKey("enhanceStones")) {
            user.setEnhanceStones(user.getEnhanceStones() + ((Number) rewards.get("enhanceStones")).intValue());
        }
        if (rewards.containsKey("standardSummonTickets")) {
            user.setStandardSummonTickets(user.getStandardSummonTickets() + ((Number) rewards.get("standardSummonTickets")).intValue());
        }
        userRepository.save(user);

        // Update onboarding if tutorial
        if (run.isTutorial()) {
            OnboardingStateEntity onboarding = onboardingRepository.findByUserId(userId).orElse(null);
            if (onboarding != null) {
                onboarding.setFirstExpeditionClaimed(true);
                onboarding.setStep(OnboardingStep.THIRD_SUMMON_REQUIRED);
                onboardingRepository.save(onboarding);
            }
        }

        run.setStatus(ExpeditionRunStatus.CLAIMED);
        run.setClaimedAt(now);
        expeditionRunRepository.save(run);

        // Record reward ledger
        ExpeditionRewardLedgerEntity ledger = ExpeditionRewardLedgerEntity.builder()
                .user(user)
                .expeditionRunId(run.getId())
                .idempotencyKey(idempotencyKey)
                .claimInputHash(claimInputHash)
                .rewardPayloadJson(run.getRewardSnapshotJson())
                .build();

        ExpeditionRewardLedgerEntity savedLedger = rewardLedgerRepository.save(ledger);

        return ExpeditionClaimResponseDto.builder()
                .expeditionRunId(run.getId())
                .slotIndex(run.getSlotIndex())
                .rewardsGranted(rewards)
                .releasedHeroIds(heroIds)
                .ledgerId(savedLedger.getId())
                .build();
    }

    @Override
    @Transactional
    public ExpeditionRunDto cancel(UUID userId, UUID runId) {
        UserEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        ExpeditionRunEntity run = expeditionRunRepository.findByIdAndUserId(runId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expedition run not found: " + runId));

        if (run.getStatus() == ExpeditionRunStatus.CLAIMED) {
            throw new GameRuleViolationException("Cannot cancel an already claimed Expedition.");
        }
        if (run.getStatus() == ExpeditionRunStatus.CANCELLED) {
            return mapToDto(run);
        }

        // Release heroes back to IDLE
        List<UUID> heroIds = parseHeroIds(run.getHeroIdsJson());
        List<HeroEntity> heroes = heroRepository.findByUserIdAndIdIn(userId, heroIds);
        for (HeroEntity hero : heroes) {
            hero.setBusyStatus(HeroBusyStatus.IDLE);
        }
        heroRepository.saveAll(heroes);

        run.setStatus(ExpeditionRunStatus.CANCELLED);
        run.setCancelledAt(LocalDateTime.now());
        ExpeditionRunEntity savedRun = expeditionRunRepository.save(run);

        log.info("Expedition run {} cancelled by user {}. Heroes released with 0 reward.", runId, userId);
        return mapToDto(savedRun);
    }

    private ExpeditionRunDto mapToDto(ExpeditionRunEntity entity) {
        LocalDateTime now = LocalDateTime.now();
        long remaining = Math.max(0, Duration.between(now, entity.getCompletesAt()).getSeconds());
        boolean isClaimable = entity.getStatus() == ExpeditionRunStatus.RUNNING && remaining == 0;

        List<UUID> heroIds = parseHeroIds(entity.getHeroIdsJson());
        List<String> heroTemplateIds = heroRepository.findByUserIdAndIdIn(entity.getUser().getId(), heroIds).stream()
                .map(HeroEntity::getHeroTemplateId)
                .collect(Collectors.toList());

        Map<String, Object> rewardPreview = entity.getStatus() == ExpeditionRunStatus.CLAIMED
                ? parseJson(entity.getRewardSnapshotJson())
                : Map.of(
                        "category", entity.isTutorial() ? "TUTORIAL_STARTER_SUPPLIES" : "EXPEDITION_PATROL_SUPPLIES",
                        "status", "DEV_BALANCE / TBD"
                );

        int durationSeconds = entity.isTutorial() ? TUTORIAL_DURATION_SECONDS : NORMAL_DURATION_SECONDS;

        return ExpeditionRunDto.builder()
                .id(entity.getId())
                .slotIndex(entity.getSlotIndex())
                .isTutorial(entity.isTutorial())
                .status(entity.getStatus())
                .heroIds(heroIds)
                .heroTemplateIds(heroTemplateIds)
                .startedAt(entity.getStartedAt())
                .completesAt(entity.getCompletesAt())
                .durationSeconds(durationSeconds)
                .remainingSeconds(remaining)
                .isClaimable(isClaimable)
                .rewardPreview(rewardPreview)
                .build();
    }

    private String writeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    private Map<String, Object> parseJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private List<UUID> parseHeroIds(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<UUID>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
