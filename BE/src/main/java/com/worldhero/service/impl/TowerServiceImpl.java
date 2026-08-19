package com.worldhero.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldhero.dto.*;
import com.worldhero.engine.tower.*;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.model.entity.*;
import com.worldhero.model.enums.*;
import com.worldhero.repository.*;
import com.worldhero.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TowerServiceImpl implements TowerService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static final String CATALOG_VERSION = "hero-v1";
    public static final String BALANCE_VERSION = "tower-v1";

    private final TowerProgressRepository progressRepository;
    private final TowerPartyRepository partyRepository;
    private final TowerAttemptRepository attemptRepository;
    private final TowerRewardLedgerRepository rewardLedgerRepository;
    private final UserRepository userRepository;
    private final HeroRepository heroRepository;
    private final UserService userService;
    private final HeroCatalogService heroCatalogService;
    private final TowerFloorConfigService floorConfigService;
    private final TurnBattleEngine turnBattleEngine;
    private final HeroProgressionService heroProgressionService;
    private final TowerGearService towerGearService;

    @Value("${tower.progress.enabled:true}")
    private boolean towerProgressEnabled;

    @Value("${tower.v2.enabled:true}")
    private boolean towerV2Enabled;

    @Value("${tower.reward.enabled:true}")
    private boolean towerRewardEnabled;

    @Value("${tower.paid.enabled:false}")
    private boolean towerPaidEnabled;

    @Override
    @Transactional(readOnly = true)
    public TowerProgressDto getProgress(UUID userId) {
        UserEntity user = userService.getUserOrThrow(userId);
        TowerProgressEntity progress = getOrCreateProgress(user);

        TowerPartyV2Dto partyV2Dto = getPartyV2(userId);

        TowerAttemptResponseDto unacknowledgedAttempt = attemptRepository
                .findTopByUserIdAndIsAcknowledgedFalseOrderByCreatedAtDesc(user.getId())
                .map(this::mapAttemptToResponseDto)
                .orElse(null);

        return TowerProgressDto.builder()
                .seasonId(progress.getSeasonId())
                .currentFloor(progress.getCurrentFloor())
                .highestFloorCleared(progress.getHighestFloorCleared())
                .bestScore(progress.getBestScore())
                .totalAttempts(progress.getTotalAttempts())
                .savedPartyV2(partyV2Dto)
                .unacknowledgedAttempt(unacknowledgedAttempt)
                .catalogVersion(CATALOG_VERSION)
                .balanceVersion(BALANCE_VERSION)
                .build();
    }

    private TowerProgressEntity getOrCreateProgress(UserEntity user) {
        return progressRepository.findByUserIdAndSeasonId(user.getId(), CURRENT_SEASON_ID)
                .orElseGet(() -> progressRepository.save(TowerProgressEntity.builder()
                        .user(user)
                        .seasonId(CURRENT_SEASON_ID)
                        .currentFloor(1)
                        .highestFloorCleared(0)
                        .bestScore(0)
                        .totalAttempts(0)
                        .build()));
    }

    @Override
    @Transactional
    public TowerPartyV2Dto savePartyV2(UUID userId, TowerPartyV2Dto partyDto) {
        if (!towerV2Enabled || !towerProgressEnabled) {
            throw new GameRuleViolationException("Tower v2 feature is currently disabled by server configuration");
        }
        UserEntity user = userService.getUserOrThrow(userId);

        List<TowerPartyGridSlotDto> slots = partyDto.getSlots();
        if (slots == null || slots.size() != 3) {
            throw new GameRuleViolationException("Tower 3v3 party requires exactly 3 hero grid placements");
        }

        // Validate cell uniqueness
        Set<String> cellCoordinates = new HashSet<>();
        Set<UUID> heroIds = new HashSet<>();
        for (TowerPartyGridSlotDto slot : slots) {
            if (slot.getHeroId() == null || slot.getRow() == null || slot.getCol() == null) {
                throw new GameRuleViolationException("Slot must contain heroId, row, and col");
            }
            String cell = slot.getRow().name() + "_" + slot.getCol().name();
            if (!cellCoordinates.add(cell)) {
                throw new GameRuleViolationException("Multiple heroes cannot occupy the same grid cell: " + cell);
            }
            UUID heroId = slot.getHeroId();
            if (!heroIds.add(heroId)) {
                throw new GameRuleViolationException("Cannot place duplicate hero in party: " + heroId);
            }
        }

        for (UUID heroId : heroIds) {
            HeroEntity hero = heroRepository.findById(heroId)
                    .orElseThrow(() -> new GameRuleViolationException("Hero not found: " + heroId));
            if (!hero.getUser().getId().equals(user.getId())) {
                throw new GameRuleViolationException("Hero does not belong to user: " + heroId);
            }
            String templateId = hero.getHeroTemplateId();
            if (templateId == null || templateId.isBlank()) {
                throw new GameRuleViolationException("Hero template is required for Tower: " + heroId);
            }
            HeroTemplateDto template = heroCatalogService.getTemplateById(templateId)
                    .orElseThrow(() -> new GameRuleViolationException("Template not found: " + templateId));
            if (!template.isEnabled()) {
                throw new GameRuleViolationException("Hero template " + templateId + " is disabled");
            }
            if (hero.getBusyStatus() == HeroBusyStatus.EXPEDITION_BUSY) {
                throw new GameRuleViolationException("Hero " + templateId + " is currently on an Expedition and cannot enter Tower");
            }
        }

        TowerPartyEntity party = partyRepository.findByUserId(user.getId())
                .orElseGet(() -> TowerPartyEntity.builder().user(user).build());

        party.setGridSlotsJson(writeJson(slots));
        party.setTactic(partyDto.getTactic() != null ? partyDto.getTactic() : TeamTactic.BALANCED);
        party.setHeroPoliciesJson(writeJson(partyDto.getHeroPolicies() != null ? partyDto.getHeroPolicies() : Map.of()));
        party.setEnergyPriorityJson(writeJson(partyDto.getEnergyPriority() != null ? partyDto.getEnergyPriority() : List.of()));

        partyRepository.save(party);

        return TowerPartyV2Dto.builder()
                .slots(slots)
                .tactic(party.getTactic())
                .heroPolicies(partyDto.getHeroPolicies())
                .energyPriority(partyDto.getEnergyPriority())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TowerPartyV2Dto getPartyV2(UUID userId) {
        return partyRepository.findByUserId(userId)
                .map(p -> {
                    List<TowerPartyGridSlotDto> slots = parseGridSlots(p.getGridSlotsJson());
                    Map<UUID, SkillPolicy> policies = parsePolicies(p.getHeroPoliciesJson());
                    List<UUID> energyPriority = parseUUIDList(p.getEnergyPriorityJson());

                    return TowerPartyV2Dto.builder()
                            .slots(slots)
                            .tactic(p.getTactic() != null ? p.getTactic() : TeamTactic.BALANCED)
                            .heroPolicies(policies)
                            .energyPriority(energyPriority)
                            .updatedAt(p.getUpdatedAt())
                            .build();
                })
                .orElse(null);
    }

    @Override
    @Transactional
    public TowerAttemptResponseDto createAttempt(UUID userId, TowerAttemptRequestDto request) {
        if (!towerV2Enabled || !towerProgressEnabled) {
            throw new GameRuleViolationException("Tower v2 feature is currently disabled by server configuration");
        }

        if (request.getIdempotencyKey() == null || request.getIdempotencyKey().isBlank()) {
            throw new GameRuleViolationException("idempotencyKey is required for Tower attempt");
        }

        // 1. Acquire pessimistic write lock on User
        UserEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new GameRuleViolationException("User not found: " + userId));

        // 2. Idempotency check under lock
        if (request.getIdempotencyKey() == null || request.getIdempotencyKey().isBlank()) {
            throw new IllegalArgumentException("idempotencyKey is required for tower attempt");
        }

        List<TowerPartyGridSlotDto> sortedSlots = request.getSlots() != null
                ? request.getSlots().stream()
                .sorted(Comparator.comparing((TowerPartyGridSlotDto s) -> s.getHeroId() != null ? s.getHeroId().toString() : ""))
                .toList()
                : List.of();

        Map<String, SkillPolicy> sortedPolicies = request.getHeroPolicies() != null
                ? new TreeMap<>(request.getHeroPolicies().entrySet().stream()
                .collect(Collectors.toMap(e -> e.getKey().toString(), Map.Entry::getValue)))
                : Collections.emptyMap();

        List<String> sortedEnergyPriority = request.getEnergyPriority() != null
                ? request.getEnergyPriority().stream().map(UUID::toString).toList()
                : List.of();

        String inputHash = IdempotencyHelper.computeHash(
                request.getFloorNumber() + ":" +
                writeJson(sortedSlots) + ":" +
                (request.getTactic() != null ? request.getTactic().name() : "BALANCED") + ":" +
                writeJson(sortedPolicies) + ":" +
                writeJson(sortedEnergyPriority) + ":" +
                "CORE_V2_GRID"
        );

        Optional<TowerAttemptEntity> cachedAttempt = attemptRepository.findByUserIdAndIdempotencyKey(
                user.getId(), request.getIdempotencyKey()
        );
        if (cachedAttempt.isPresent()) {
            TowerAttemptEntity existingAttempt = cachedAttempt.get();
            if (existingAttempt.getInputHash() != null && !inputHash.equals(existingAttempt.getInputHash())) {
                throw new com.worldhero.exception.IdempotencyConflictException("TOWER_ATTEMPT", request.getIdempotencyKey());
            }
            log.info("Returning cached attempt for idempotencyKey: {}", request.getIdempotencyKey());
            return mapAttemptToResponseDto(existingAttempt);
        }

        TowerProgressEntity progress = getOrCreateProgress(user);

        int floorNum = request.getFloorNumber();
        TowerFloorDto floorConfig = floorConfigService.getFloorByNumber(floorNum)
                .orElseThrow(() -> new GameRuleViolationException("Invalid floor number: " + floorNum));

        if (floorNum > progress.getHighestFloorCleared() + 1) {
            throw new GameRuleViolationException("Floor " + floorNum + " is locked. Highest cleared: " + progress.getHighestFloorCleared());
        }

        // Build player combatants from the Core v2 grid.
        List<TowerEntity> combatants = new ArrayList<>();
        List<TowerPartyGridSlotDto> slots = request.getSlots();

        if (slots != null && slots.size() == 3) {
            for (int i = 0; i < slots.size(); i++) {
                TowerPartyGridSlotDto slot = slots.get(i);
                UUID hid = slot.getHeroId();
                SkillPolicy policy = request.getHeroPolicies() != null ? request.getHeroPolicies().getOrDefault(hid, SkillPolicy.AUTO) : SkillPolicy.AUTO;
                int priority = request.getEnergyPriority() != null ? (request.getEnergyPriority().indexOf(hid) != -1 ? request.getEnergyPriority().indexOf(hid) + 1 : i + 1) : i + 1;
                combatants.add(buildPlayerCombatantV2(user, hid, slot.getRow(), slot.getCol(), policy, priority, "player_" + (i + 1)));
            }
        } else {
            throw new GameRuleViolationException("Tower attempt requires exactly 3 Core v2 grid slots");
        }

        // Build Enemy Combatants
        for (int i = 0; i < floorConfig.getBotTrio().size(); i++) {
            TowerFloorDto.BotPreviewDto bot = floorConfig.getBotTrio().get(i);
            combatants.add(buildEnemyCombatantV2(bot, "bot_" + (i + 1)));
        }

        // Deterministic Seed derived from user, floor, and idempotency
        long seed = Objects.hash(user.getId(), CURRENT_SEASON_ID, floorNum, request.getIdempotencyKey());

        log.info("Starting Tower Attempt - User: {}, Floor: {}, Seed: {}, Modifiers: {}",
                user.getId(), floorNum, seed, floorConfig.getModifiers());

        // Resolve combat authoritative with tactic
        com.worldhero.model.enums.TeamTactic tactic = request.getTactic() != null ? request.getTactic() : com.worldhero.model.enums.TeamTactic.BALANCED;
        TowerBattleResult battleResult = turnBattleEngine.resolveBattle(
                combatants, floorConfig.getModifiers(), seed, floorConfig.getBaseScore(), tactic
        );

        // Snapshot initial post-modifier combatants from battleResult (captured pre-round 1)
        List<TowerEntity> initialCombatantsSnapshot = battleResult.getInitialCombatants();

        // Update progress
        progress.setTotalAttempts(progress.getTotalAttempts() + 1);

        boolean isFirstClear = false;
        TowerFloorDto.RewardPreviewDto rewardsGranted = null;

        if (battleResult.getWinner() == TowerSide.PLAYER) {
            if (floorNum > progress.getHighestFloorCleared()) {
                progress.setHighestFloorCleared(floorNum);
                progress.setCurrentFloor(Math.min(TowerFloorConfigService.TOTAL_FLOORS, floorNum + 1));
            }
            if (battleResult.getCalculatedScore() > progress.getBestScore()) {
                progress.setBestScore(battleResult.getCalculatedScore());
            }

            // Check and grant first clear reward atomically with duplicate protection
            Optional<TowerRewardLedgerEntity> existingClaim = rewardLedgerRepository
                    .findByUserIdAndSeasonIdAndFloorNumber(user.getId(), CURRENT_SEASON_ID, floorNum);

            if (existingClaim.isEmpty()) {
                isFirstClear = true;
                rewardsGranted = floorConfig.getFirstClearReward();

                if (rewardsGranted != null) {
                    if (rewardsGranted.getGold() > 0) user.setGold(user.getGold() + rewardsGranted.getGold());
                    if (rewardsGranted.getEssence() > 0) user.setEssence(user.getEssence() + rewardsGranted.getEssence());
                    if (rewardsGranted.getStones() > 0) user.setEnhanceStones(user.getEnhanceStones() + rewardsGranted.getStones());
                    userRepository.save(user);

                    rewardLedgerRepository.save(TowerRewardLedgerEntity.builder()
                            .user(user)
                            .seasonId(CURRENT_SEASON_ID)
                            .floorNumber(floorNum)
                            .goldReward(rewardsGranted.getGold())
                            .essenceReward(rewardsGranted.getEssence())
                            .stonesReward(rewardsGranted.getStones())
                            .shardsReward(rewardsGranted.getShards())
                            .build());
                }
            }
        }

        progressRepository.save(progress);

        TowerAttemptEntity attempt = TowerAttemptEntity.builder()
                .user(user)
                .seasonId(CURRENT_SEASON_ID)
                .floorNumber(floorNum)
                .idempotencyKey(request.getIdempotencyKey())
                .inputHash(inputHash)
                .winner(battleResult.getWinner())
                .roundsUsed(battleResult.getRoundsUsed())
                .score(battleResult.getCalculatedScore())
                .remainingHpPercent(battleResult.getRemainingPlayerHpPercent())
                .isFirstClear(isFirstClear)
                .rewardsGrantedJson(rewardsGranted != null ? writeJson(rewardsGranted) : null)
                .combatantsSnapshotJson(writeJson(initialCombatantsSnapshot))
                .replayEventsJson(writeJson(battleResult.getReplayEvents()))
                .catalogVersion(CATALOG_VERSION)
                .balanceVersion(BALANCE_VERSION)
                .isAcknowledged(false)
                .build();

        try {
            attempt = attemptRepository.save(attempt);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return attemptRepository.findByUserIdAndIdempotencyKey(user.getId(), request.getIdempotencyKey())
                    .map(this::mapAttemptToResponseDto)
                    .orElseThrow(() -> ex);
        }

        return TowerAttemptResponseDto.builder()
                .attemptId(attempt.getId())
                .floorNumber(floorNum)
                .winner(battleResult.getWinner())
                .roundsUsed(battleResult.getRoundsUsed())
                .remainingHpPercent(battleResult.getRemainingPlayerHpPercent())
                .score(battleResult.getCalculatedScore())
                .isFirstClear(isFirstClear)
                .rewardsGranted(rewardsGranted)
                .combatants(initialCombatantsSnapshot)
                .replayEvents(battleResult.getReplayEvents())
                .catalogVersion(CATALOG_VERSION)
                .balanceVersion(BALANCE_VERSION)
                .isAcknowledged(false)
                .createdAt(attempt.getCreatedAt())
                .build();
    }

    private TowerEntity buildPlayerCombatantV2(
            UserEntity user, UUID heroId, GridRow row, GridCol col, SkillPolicy policy, int priority, String entityId
    ) {
        HeroEntity hero = heroRepository.findById(heroId)
                .orElseThrow(() -> new GameRuleViolationException("Hero not found: " + heroId));

        if (!hero.getUser().getId().equals(user.getId())) {
            throw new GameRuleViolationException("Hero does not belong to user: " + heroId);
        }

        String templateId = hero.getHeroTemplateId();
        if (templateId == null || templateId.isBlank()) {
            throw new GameRuleViolationException("Hero template is required for Tower: " + heroId);
        }
        HeroTemplateDto template = heroCatalogService.getTemplateById(templateId)
                .orElseThrow(() -> new GameRuleViolationException("STALE_TEMPLATE: Template not found: " + templateId));

        if (!template.isEnabled()) {
            throw new GameRuleViolationException("HERO_DISABLED: Hero template " + templateId + " is disabled for player use");
        }

        if (hero.getBusyStatus() == HeroBusyStatus.EXPEDITION_BUSY) {
            throw new GameRuleViolationException("HERO_BUSY: Hero " + templateId + " is currently on an Expedition and cannot enter Tower");
        }

        CombatStatsDto baseStats = template.getBaseStats();
        CombatStatsDto statsWithLevelAndStars = heroProgressionService.computeHeroStats(baseStats, hero.getLevel(), hero.getStars());

        List<ItemInstanceEntity> equipped = hero.getEquippedItems() != null ? hero.getEquippedItems() : Collections.emptyList();
        CombatStatsDto gearStats = towerGearService.computeTotalGearStats(equipped);

        CombatStatsDto finalEffectiveStats = CombatStatsDto.builder()
                .atk(statsWithLevelAndStars.getAtk() + gearStats.getAtk())
                .maxHp(statsWithLevelAndStars.getMaxHp() + gearStats.getMaxHp())
                .armor(statsWithLevelAndStars.getArmor() + gearStats.getArmor())
                .speed(Math.max(60, Math.min(180, statsWithLevelAndStars.getSpeed() + gearStats.getSpeed())))
                .critRate(Math.min(TowerCombatMath.MAX_CRIT_RATE, statsWithLevelAndStars.getCritRate() + gearStats.getCritRate()))
                .critDmg(statsWithLevelAndStars.getCritDmg() + (gearStats.getCritDmg() - 150.0))
                .build();

        TowerEntity entity = TowerEntity.builder()
                .entityId(entityId)
                .templateId(template.getId())
                .name(template.getName())
                .role(template.getRole())
                .side(TowerSide.PLAYER)
                .gridRow(row)
                .gridCol(col)
                .skillPolicy(policy != null ? policy : SkillPolicy.AUTO)
                .energyPriority(priority)
                .level(hero.getLevel())
                .stars(hero.getStars())
                .baseStats(baseStats)
                .effectiveStats(finalEffectiveStats)
                .maxHp(finalEffectiveStats.getMaxHp())
                .currentHp(finalEffectiveStats.getMaxHp())
                .shield(0)
                .evadeCharges(0)
                .regenStacks(0)
                .isDowned(false)
                .build();

        turnBattleEngine.attachSkillsForTemplate(entity, template);
        return entity;
    }

    private TowerEntity buildEnemyCombatantV2(TowerFloorDto.BotPreviewDto bot, String entityId) {
        HeroTemplateDto template = heroCatalogService.getTemplateById(bot.getTemplateId())
                .orElse(null);

        CombatStatsDto base = template != null ? template.getBaseStats() : CombatStatsDto.forRole(bot.getRole());
        CombatStatsDto stats = heroProgressionService.computeHeroStats(base, bot.getLevel(), 1);

        if (bot.getMaxHp() > stats.getMaxHp()) {
            stats.setMaxHp(bot.getMaxHp());
        }
        if (bot.getSpeed() > 0) {
            stats.setSpeed(bot.getSpeed());
        }

        GridRow row = bot.getRow();
        GridCol col = bot.getCol();
        if (row == null || col == null) {
            throw new GameRuleViolationException("Tower bot requires grid coordinates");
        }

        TowerEntity entity = TowerEntity.builder()
                .entityId(entityId)
                .templateId(bot.getTemplateId())
                .name(bot.getName())
                .role(bot.getRole())
                .side(TowerSide.ENEMY)
                .gridRow(row)
                .gridCol(col)
                .skillPolicy(SkillPolicy.AUTO)
                .energyPriority(1)
                .level(bot.getLevel())
                .stars(1)
                .baseStats(base)
                .effectiveStats(stats)
                .maxHp(stats.getMaxHp())
                .currentHp(stats.getMaxHp())
                .shield(0)
                .evadeCharges(0)
                .regenStacks(0)
                .isDowned(false)
                .build();

        turnBattleEngine.attachSkillsForTemplate(entity, template);
        return entity;
    }

    @Override
    @Transactional(readOnly = true)
    public TowerAttemptResponseDto getAttempt(UUID userId, UUID attemptId) {
        TowerAttemptEntity attempt = attemptRepository.findByIdAndUserId(attemptId, userId)
                .orElseThrow(() -> new GameRuleViolationException("Attempt not found: " + attemptId));
        return mapAttemptToResponseDto(attempt);
    }

    @Override
    @Transactional
    public TowerAttemptResponseDto acknowledgeAttempt(UUID userId, UUID attemptId) {
        TowerAttemptEntity attempt = attemptRepository.findByIdAndUserId(attemptId, userId)
                .orElseThrow(() -> new GameRuleViolationException("Attempt not found: " + attemptId));
        attempt.setAcknowledged(true);
        attempt = attemptRepository.save(attempt);
        return mapAttemptToResponseDto(attempt);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TowerLeaderboardEntryDto> getLeaderboard(String seasonId) {
        String effectiveSeason = (seasonId != null && !seasonId.isBlank()) ? seasonId : CURRENT_SEASON_ID;
        List<TowerProgressEntity> top = progressRepository.findTop50BySeasonIdOrderByHighestFloorClearedDescBestScoreDesc(effectiveSeason);

        List<TowerLeaderboardEntryDto> result = new ArrayList<>();
        int rank = 1;
        for (TowerProgressEntity p : top) {
            result.add(TowerLeaderboardEntryDto.builder()
                    .rank(rank++)
                    .userId(p.getUser().getId())
                    .displayName(p.getUser().getDisplayName() != null ? p.getUser().getDisplayName() : "Hero_" + p.getUser().getId().toString().substring(0, 6))
                    .highestFloorCleared(p.getHighestFloorCleared())
                    .bestScore(p.getBestScore())
                    .build());
        }
        return result;
    }

    private TowerAttemptResponseDto mapAttemptToResponseDto(TowerAttemptEntity entity) {
        TowerFloorDto.RewardPreviewDto rewards = parseFloorReward(entity.getRewardsGrantedJson());
        List<TowerEntity> combatants = parseCombatants(entity.getCombatantsSnapshotJson());
        List<TowerReplayEvent> replay = parseReplay(entity.getReplayEventsJson());

        return TowerAttemptResponseDto.builder()
                .attemptId(entity.getId())
                .floorNumber(entity.getFloorNumber())
                .winner(entity.getWinner())
                .roundsUsed(entity.getRoundsUsed())
                .remainingHpPercent(entity.getRemainingHpPercent())
                .score(entity.getScore())
                .isFirstClear(entity.isFirstClear())
                .rewardsGranted(rewards)
                .combatants(combatants)
                .replayEvents(replay)
                .catalogVersion(entity.getCatalogVersion())
                .balanceVersion(entity.getBalanceVersion())
                .isAcknowledged(entity.isAcknowledged())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private String writeJson(Object obj) {
        try {
            return OBJECT_MAPPER.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }

    private TowerFloorDto.RewardPreviewDto parseFloorReward(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return OBJECT_MAPPER.readValue(json, TowerFloorDto.RewardPreviewDto.class);
        } catch (Exception e) {
            return null;
        }
    }

    private List<TowerEntity> parseCombatants(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<List<TowerEntity>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<TowerReplayEvent> parseReplay(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<List<TowerReplayEvent>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<TowerPartyGridSlotDto> parseGridSlots(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<List<TowerPartyGridSlotDto>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private Map<UUID, SkillPolicy> parsePolicies(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<Map<UUID, SkillPolicy>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private List<UUID> parseUUIDList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<List<UUID>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
