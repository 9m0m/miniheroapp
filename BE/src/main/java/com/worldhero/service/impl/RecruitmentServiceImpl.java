package com.worldhero.service.impl;

import com.worldhero.dto.HeroTemplateDto;
import com.worldhero.dto.RecruitmentBannerDto;
import com.worldhero.dto.RecruitmentPullRequestDto;
import com.worldhero.dto.RecruitmentPullResponseDto;
import com.worldhero.dto.SummonHistoryDto;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.InsufficientResourceException;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.HeroEntity;
import com.worldhero.model.entity.OnboardingStateEntity;
import com.worldhero.model.entity.SummonLedgerEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.BannerType;
import com.worldhero.model.enums.HeroBusyStatus;
import com.worldhero.model.enums.OnboardingStep;
import com.worldhero.repository.HeroRepository;
import com.worldhero.repository.OnboardingStateRepository;
import com.worldhero.repository.SummonLedgerRepository;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.HeroCatalogService;
import com.worldhero.service.IdempotencyHelper;
import com.worldhero.service.RecruitmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecruitmentServiceImpl implements RecruitmentService {

    private final UserRepository userRepository;
    private final HeroRepository heroRepository;
    private final OnboardingStateRepository onboardingRepository;
    private final SummonLedgerRepository summonLedgerRepository;
    private final HeroCatalogService heroCatalogService;

    @Value("${recruitment.paid.enabled:false}")
    private boolean paidRecruitmentEnabled;

    @Value("${recruitment.free.enabled:true}")
    private boolean freeRecruitmentEnabled;

    @Value("${core.v2.enabled:true}")
    private boolean coreV2Enabled;

    private final Random random = new SecureRandom();

    @Override
    public List<RecruitmentBannerDto> getBanners() {
        if (!coreV2Enabled) {
            throw new GameRuleViolationException("Core Game v2 Recruitment is currently disabled.");
        }
        List<HeroTemplateDto> enabledTemplates = heroCatalogService.getEnabledTemplates();
        List<String> templateIds = enabledTemplates.stream()
                .map(HeroTemplateDto::getId)
                .collect(Collectors.toList());

        Map<String, String> ratesDisplay = new LinkedHashMap<>();
        ratesDisplay.put("Status", "DEV_PREVIEW / TBD");
        ratesDisplay.put("Pull 1 (Tutorial)", "Guaranteed Knight 1★");
        ratesDisplay.put("Pull 2 (Tutorial)", "Guaranteed Ranger 1★");
        ratesDisplay.put("Pull 3 (Protected)", "Guaranteed New Hero (1★)");
        ratesDisplay.put("Duplicates (Pull 4+)", "1 Hero Shard");

        RecruitmentBannerDto standardBanner = RecruitmentBannerDto.builder()
                .bannerId("STANDARD")
                .name("Standard Hero Summon")
                .description("")
                .type(BannerType.STANDARD)
                .ticketCost(1)
                .isPaid(false)
                .enabledHeroTemplateIds(templateIds)
                .ratesDisplay(ratesDisplay)
                .build();

        return List.of(standardBanner);
    }

    @Override
    @Transactional
    public RecruitmentPullResponseDto pull(UUID userId, RecruitmentPullRequestDto request) {
        if (!coreV2Enabled || !freeRecruitmentEnabled) {
            throw new GameRuleViolationException("Core Game v2 Recruitment is currently disabled.");
        }

        String idempotencyKey = request.getIdempotencyKey();
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("idempotencyKey is required for recruitment pull");
        }

        String inputHash = IdempotencyHelper.computeHash(request.getBannerId() + ":" + request.getTicketType());

        UserEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Optional<SummonLedgerEntity> existingLedger = summonLedgerRepository.findByUserIdAndIdempotencyKey(userId, idempotencyKey);
        if (existingLedger.isPresent()) {
            SummonLedgerEntity ledger = existingLedger.get();
            if (!inputHash.equals(ledger.getInputHash())) {
                throw new com.worldhero.exception.IdempotencyConflictException("RECRUITMENT", idempotencyKey);
            }
            HeroTemplateDto template = heroCatalogService.getTemplateById(ledger.getHeroTemplateId())
                    .orElse(null);
            return RecruitmentPullResponseDto.builder()
                    .heroTemplateId(ledger.getHeroTemplateId())
                    .heroName(template != null ? template.getName() : ledger.getHeroTemplateId())
                    .role(template != null ? template.getRole() : null)
                    .rarity("1★")
                    .isNew(!ledger.isDuplicate())
                    .shardsGranted(ledger.getShardsGranted())
                    .lifetimePulls(ledger.getPullIndex())
                    .remainingTickets(user.getStandardSummonTickets())
                    .ledgerId(ledger.getId())
                    .build();
        }

        if (user.getStandardSummonTickets() < 1) {
            throw new InsufficientResourceException("Not enough Standard Summon Tickets. Current balance: " + user.getStandardSummonTickets());
        }

        // Deduct ticket
        user.setStandardSummonTickets(user.getStandardSummonTickets() - 1);
        userRepository.save(user);

        // Fetch onboarding state
        OnboardingStateEntity onboarding = onboardingRepository.findByUserId(userId)
                .orElseGet(() -> onboardingRepository.save(OnboardingStateEntity.builder()
                        .user(user)
                        .step(OnboardingStep.WELCOME)
                        .lifetimePulls(0)
                        .build()));

        int pullIndex = onboarding.getLifetimePulls() + 1;
        String chosenTemplateId;

        if (pullIndex == 1) {
            // Scripted Ticket 1: Knight
            chosenTemplateId = "hero.knight";
            onboarding.setKnightSummoned(true);
            if (onboarding.getStep() == OnboardingStep.SUMMON_KNIGHT_REQUIRED) {
                onboarding.setStep(OnboardingStep.SUMMON_RANGER_REQUIRED);
                // Grant ticket for scripted Ranger pull
                user.setStandardSummonTickets(user.getStandardSummonTickets() + 1);
            }
        } else if (pullIndex == 2) {
            // Scripted Ticket 2: Ranger
            chosenTemplateId = "hero.ranger";
            onboarding.setRangerSummoned(true);
            if (onboarding.getStep() == OnboardingStep.SUMMON_RANGER_REQUIRED) {
                onboarding.setStep(OnboardingStep.FIRST_EXPEDITION_REQUIRED);
            }
        } else if (pullIndex == 3) {
            // Protected Pull 3: Choose randomly from enabled heroes NOT yet owned
            List<String> ownedTemplateIds = heroRepository.findByUserId(userId).stream()
                    .map(HeroEntity::getHeroTemplateId)
                    .collect(Collectors.toList());

            List<HeroTemplateDto> eligibleTemplates = heroCatalogService.getEnabledTemplates().stream()
                    .filter(t -> !ownedTemplateIds.contains(t.getId()))
                    .collect(Collectors.toList());

            if (eligibleTemplates.isEmpty()) {
                // Fallback to all enabled templates if somehow all are owned
                eligibleTemplates = heroCatalogService.getEnabledTemplates();
            }

            chosenTemplateId = eligibleTemplates.get(random.nextInt(eligibleTemplates.size())).getId();
            onboarding.setThirdSummonCompleted(true);
            if (onboarding.getStep().ordinal() < OnboardingStep.COMPLETE.ordinal()) {
                onboarding.setStep(OnboardingStep.COMPLETE);
            }
        } else {
            // Pull 4+: Full random over all 18 enabled heroes
            List<HeroTemplateDto> enabled = heroCatalogService.getEnabledTemplates();
            chosenTemplateId = enabled.get(random.nextInt(enabled.size())).getId();
        }

        onboarding.setLifetimePulls(pullIndex);
        onboardingRepository.save(onboarding);

        HeroTemplateDto heroTemplate = heroCatalogService.getTemplateById(chosenTemplateId)
                .orElseThrow(() -> new IllegalStateException("Template not found in catalog: " + chosenTemplateId));

        // Ownership & duplicate resolution
        Optional<HeroEntity> existingHeroOpt = heroRepository.findByUserIdAndHeroTemplateId(userId, chosenTemplateId);
        boolean isNew = existingHeroOpt.isEmpty();
        int shardsGranted = isNew ? 0 : 1;
        UUID heroInstanceId;

        if (isNew) {
            HeroEntity newHero = HeroEntity.builder()
                    .user(user)
                    .heroTemplateId(chosenTemplateId)
                    .heroClass(heroCatalogService.mapTemplateIdToLegacyClass(chosenTemplateId))
                    .level(1)
                    .stars(1)
                    .shards(0)
                    .busyStatus(HeroBusyStatus.IDLE)
                    .build();
            HeroEntity savedHero = heroRepository.save(newHero);
            heroInstanceId = savedHero.getId();
        } else {
            HeroEntity existingHero = existingHeroOpt.get();
            existingHero.setShards(existingHero.getShards() + 1);
            heroRepository.save(existingHero);
            heroInstanceId = existingHero.getId();
        }

        // Record immutable summon ledger
        SummonLedgerEntity ledger = SummonLedgerEntity.builder()
                .user(user)
                .idempotencyKey(idempotencyKey)
                .inputHash(inputHash)
                .bannerId(request.getBannerId() != null ? request.getBannerId() : "STANDARD")
                .ticketType(request.getTicketType() != null ? request.getTicketType() : "STANDARD")
                .heroTemplateId(chosenTemplateId)
                .isDuplicate(!isNew)
                .shardsGranted(shardsGranted)
                .pullIndex(pullIndex)
                .build();

        SummonLedgerEntity savedLedger = summonLedgerRepository.save(ledger);

        return RecruitmentPullResponseDto.builder()
                .heroTemplateId(chosenTemplateId)
                .heroName(heroTemplate.getName())
                .role(heroTemplate.getRole())
                .rarity("1★")
                .isNew(isNew)
                .shardsGranted(shardsGranted)
                .heroInstanceId(heroInstanceId)
                .lifetimePulls(pullIndex)
                .remainingTickets(user.getStandardSummonTickets())
                .ledgerId(savedLedger.getId())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SummonHistoryDto> getHistory(UUID userId) {
        if (userId == null) {
            return List.of();
        }
        return summonLedgerRepository.findByUserIdOrderByPulledAtDesc(userId).stream()
                .map(ledger -> {
                    var templateOpt = heroCatalogService.getTemplateById(ledger.getHeroTemplateId());
                    String heroName = templateOpt.map(HeroTemplateDto::getName).orElse(ledger.getHeroTemplateId());
                    String role = templateOpt.map(t -> t.getRole() != null ? t.getRole().name() : "HERO").orElse("HERO");

                    return SummonHistoryDto.builder()
                            .id(ledger.getId())
                            .heroTemplateId(ledger.getHeroTemplateId())
                            .heroName(heroName)
                            .role(role)
                            .stars(1)
                            .isDuplicate(ledger.isDuplicate())
                            .shardsGranted(ledger.getShardsGranted())
                            .ticketType(ledger.getTicketType())
                            .createdAt(ledger.getPulledAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
