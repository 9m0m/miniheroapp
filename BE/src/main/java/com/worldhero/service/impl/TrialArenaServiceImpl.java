package com.worldhero.service.impl;

import com.worldhero.dto.BuildInspectResponseDto;
import com.worldhero.dto.TrialLeaderboardEntryDto;
import com.worldhero.dto.TrialSubmitRequestDto;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.TrialRecordEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.QuestActionType;
import com.worldhero.model.enums.TrialType;
import com.worldhero.repository.TrialRecordRepository;
import com.worldhero.service.QuestService;
import com.worldhero.service.TrialArenaService;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrialArenaServiceImpl implements TrialArenaService {

    private final TrialRecordRepository trialRecordRepository;
    private final UserService userService;
    private final QuestService questService;

    private String getWeeklyKey() {
        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        int weekNumber = now.get(weekFields.weekOfWeekBasedYear());
        int year = now.get(weekFields.weekBasedYear());
        return year + "-W" + (weekNumber < 10 ? "0" + weekNumber : weekNumber);
    }

    @Override
    @Transactional
    public TrialLeaderboardEntryDto submitTrialRecord(TrialSubmitRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());
        String weeklyKey = getWeeklyKey();

        double currentScore = request.getTrialType() == TrialType.DPS_30S ? request.getDpsPeak() : request.getTimeTakenSec();

        TrialRecordEntity record = trialRecordRepository
                .findByUserIdAndTrialTypeAndPeriodKey(user.getId(), request.getTrialType(), weeklyKey)
                .orElseGet(() -> TrialRecordEntity.builder()
                        .user(user)
                        .trialType(request.getTrialType())
                        .periodKey(weeklyKey)
                        .score(request.getTrialType() == TrialType.DPS_30S ? 0.0 : 9999.0)
                        .isBuildPublic(true)
                        .build());

        boolean isNewBest = false;
        if (request.getTrialType() == TrialType.DPS_30S) {
            if (currentScore > record.getScore()) {
                record.setScore(currentScore);
                record.setDpsPeak(request.getDpsPeak());
                record.setTotalDamage(request.getTotalDamage());
                record.setTimeTakenSec(30.0);
                record.setHeroesSnapshotJson(request.getHeroesSnapshotJson());
                record.setRecordedAt(Instant.now());
                isNewBest = true;
            }
        } else {
            // Speedrun: lower time is better
            if (currentScore < record.getScore() && currentScore > 0.0) {
                record.setScore(currentScore);
                record.setTimeTakenSec(request.getTimeTakenSec());
                record.setDpsPeak(request.getDpsPeak());
                record.setTotalDamage(request.getTotalDamage());
                record.setHeroesSnapshotJson(request.getHeroesSnapshotJson());
                record.setRecordedAt(Instant.now());
                isNewBest = true;
            }
        }

        record = trialRecordRepository.save(record);

        // Trigger weekly trial quest
        try {
            questService.recordQuestAction(user.getId(), QuestActionType.TRIAL_RUN, 1);
        } catch (Exception e) {
            log.warn("Failed to record quest for trial run: {}", e.getMessage());
        }

        log.info("🎯 User {} submitted {} record: Score {} (New Best: {})",
                user.getId(), request.getTrialType(), currentScore, isNewBest);

        return toLeaderboardDto(record, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrialLeaderboardEntryDto> getLeaderboard(TrialType trialType) {
        String weeklyKey = getWeeklyKey();
        List<TrialRecordEntity> records;

        if (trialType == TrialType.DPS_30S) {
            records = trialRecordRepository.findByTrialTypeAndPeriodKeyOrderByScoreDesc(trialType, weeklyKey);
        } else {
            records = trialRecordRepository.findByTrialTypeAndPeriodKeyOrderByScoreAsc(trialType, weeklyKey);
        }

        List<TrialLeaderboardEntryDto> list = new ArrayList<>();
        int rank = 1;
        for (TrialRecordEntity r : records) {
            list.add(toLeaderboardDto(r, rank++));
            if (rank > 100) break; // Top 100
        }
        return list;
    }

    @Override
    @Transactional
    public void toggleBuildPrivacy(UUID userId, boolean isPublic) {
        String weeklyKey = getWeeklyKey();
        trialRecordRepository.findByUserIdAndTrialTypeAndPeriodKey(userId, TrialType.DPS_30S, weeklyKey)
                .ifPresent(r -> { r.setBuildPublic(isPublic); trialRecordRepository.save(r); });

        trialRecordRepository.findByUserIdAndTrialTypeAndPeriodKey(userId, TrialType.BOSS_SPEEDRUN, weeklyKey)
                .ifPresent(r -> { r.setBuildPublic(isPublic); trialRecordRepository.save(r); });

        log.info("🔒 User {} updated Build Privacy to: {}", userId, isPublic);
    }

    @Override
    @Transactional(readOnly = true)
    public BuildInspectResponseDto inspectBuild(UUID targetUserId, boolean isAdmin) {
        UserEntity target = userService.getUserOrThrow(targetUserId);
        String weeklyKey = getWeeklyKey();

        Optional<TrialRecordEntity> recordOpt = trialRecordRepository.findByUserIdAndTrialTypeAndPeriodKey(targetUserId, TrialType.DPS_30S, weeklyKey);
        if (recordOpt.isEmpty()) {
            recordOpt = trialRecordRepository.findByUserIdAndTrialTypeAndPeriodKey(targetUserId, TrialType.BOSS_SPEEDRUN, weeklyKey);
        }

        boolean isPublic = recordOpt.map(TrialRecordEntity::isBuildPublic).orElse(true);

        if (!isPublic && !isAdmin) {
            return BuildInspectResponseDto.builder()
                    .userId(target.getId())
                    .username(target.getDisplayName() != null ? target.getDisplayName() : "Hero " + target.getId().toString().substring(0, 6))
                    .isBuildPublic(false)
                    .heroesSnapshotJson(null)
                    .message("🔒 This Champion chose to keep their tactical build secret.")
                    .build();
        }

        String snapshot = recordOpt.map(TrialRecordEntity::getHeroesSnapshotJson).orElse(null);

        return BuildInspectResponseDto.builder()
                .userId(target.getId())
                .username(target.getDisplayName() != null ? target.getDisplayName() : "Hero " + target.getId().toString().substring(0, 6))
                .isBuildPublic(isPublic)
                .heroesSnapshotJson(snapshot)
                .message(isAdmin ? "🛡️ SuperAdmin Anti-Cheat Inspection Granted" : "✨ Build Inspection Verified")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrialLeaderboardEntryDto> getAdminAuditList() {
        String weeklyKey = getWeeklyKey();
        List<TrialRecordEntity> allRecords = trialRecordRepository.findByPeriodKeyOrderByRecordedAtDesc(weeklyKey);
        return allRecords.stream().map(r -> toLeaderboardDto(r, 0)).collect(Collectors.toList());
    }

    private TrialLeaderboardEntryDto toLeaderboardDto(TrialRecordEntity r, int rank) {
        String name = r.getUser().getDisplayName() != null ? r.getUser().getDisplayName() : "Hero " + r.getUser().getId().toString().substring(0, 6);
        return TrialLeaderboardEntryDto.builder()
                .rank(rank)
                .userId(r.getUser().getId())
                .username(name)
                .score(Math.round(r.getScore() * 100.0) / 100.0)
                .dpsPeak(Math.round(r.getDpsPeak() * 10.0) / 10.0)
                .totalDamage(Math.round(r.getTotalDamage()))
                .timeTakenSec(Math.round(r.getTimeTakenSec() * 100.0) / 100.0)
                .isBuildPublic(r.isBuildPublic())
                .recordedAt(r.getRecordedAt().toString())
                .build();
    }
}
