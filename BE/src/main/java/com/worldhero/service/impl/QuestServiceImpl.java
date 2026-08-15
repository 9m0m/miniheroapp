package com.worldhero.service.impl;

import com.worldhero.dto.MilestoneRewardDto;
import com.worldhero.dto.QuestDto;
import com.worldhero.dto.QuestOverviewResponseDto;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.*;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.QuestActionType;
import com.worldhero.model.enums.QuestType;
import com.worldhero.repository.*;
import com.worldhero.service.QuestService;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestServiceImpl implements QuestService {

    private final QuestTemplateRepository questTemplateRepository;
    private final UserQuestProgressRepository userQuestProgressRepository;
    private final UserMilestoneClaimRepository userMilestoneClaimRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ItemTemplateRepository itemTemplateRepository;
    private final ItemInstanceRepository itemInstanceRepository;

    private String getDailyKey() {
        return DateTimeFormatter.ISO_LOCAL_DATE.format(LocalDate.now(ZoneOffset.UTC));
    }

    private String getWeeklyKey() {
        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        int weekNumber = now.get(weekFields.weekOfWeekBasedYear());
        int year = now.get(weekFields.weekBasedYear());
        return year + "-W" + (weekNumber < 10 ? "0" + weekNumber : weekNumber);
    }

    @Override
    @Transactional
    public QuestOverviewResponseDto getQuestOverview(UUID userId) {
        UserEntity user = userService.getUserOrThrow(userId);
        String dailyKey = getDailyKey();
        String weeklyKey = getWeeklyKey();

        // 1. Fetch all active templates
        List<QuestTemplateEntity> dailyTemplates = questTemplateRepository.findByQuestTypeAndIsActiveTrueOrderBySortOrderAsc(QuestType.DAILY);
        List<QuestTemplateEntity> weeklyTemplates = questTemplateRepository.findByQuestTypeAndIsActiveTrueOrderBySortOrderAsc(QuestType.WEEKLY);

        // 2. Sync / get progress for Daily Quests
        List<QuestDto> dailyDtos = new ArrayList<>();
        int dailyPoints = 0;
        for (QuestTemplateEntity t : dailyTemplates) {
            UserQuestProgressEntity progress = userQuestProgressRepository
                    .findByUserIdAndQuestTemplateIdAndPeriodKey(userId, t.getId(), dailyKey)
                    .orElseGet(() -> userQuestProgressRepository.save(UserQuestProgressEntity.builder()
                            .user(user)
                            .questTemplate(t)
                            .questType(QuestType.DAILY)
                            .periodKey(dailyKey)
                            .currentCount(0)
                            .isCompleted(false)
                            .isClaimed(false)
                            .build()));

            boolean isDone = progress.getCurrentCount() >= t.getTargetCount();
            if (isDone && !progress.isCompleted()) {
                progress.setCompleted(true);
                userQuestProgressRepository.save(progress);
            }

            if (progress.isCompleted()) {
                dailyPoints += t.getActivityPoints();
            }

            dailyDtos.add(toQuestDto(t, progress));
        }

        // 3. Sync / get progress for Weekly Quests
        List<QuestDto> weeklyDtos = new ArrayList<>();
        int weeklyPoints = 0;
        for (QuestTemplateEntity t : weeklyTemplates) {
            UserQuestProgressEntity progress = userQuestProgressRepository
                    .findByUserIdAndQuestTemplateIdAndPeriodKey(userId, t.getId(), weeklyKey)
                    .orElseGet(() -> userQuestProgressRepository.save(UserQuestProgressEntity.builder()
                            .user(user)
                            .questTemplate(t)
                            .questType(QuestType.WEEKLY)
                            .periodKey(weeklyKey)
                            .currentCount(0)
                            .isCompleted(false)
                            .isClaimed(false)
                            .build()));

            boolean isDone = progress.getCurrentCount() >= t.getTargetCount();
            if (isDone && !progress.isCompleted()) {
                progress.setCompleted(true);
                userQuestProgressRepository.save(progress);
            }

            if (progress.isCompleted()) {
                weeklyPoints += t.getActivityPoints();
            }

            weeklyDtos.add(toQuestDto(t, progress));
        }

        // 4. Build 6 Daily Milestones & 6 Weekly Milestones
        List<UserMilestoneClaimEntity> dailyClaims = userMilestoneClaimRepository.findByUserIdAndQuestTypeAndPeriodKey(userId, QuestType.DAILY, dailyKey);
        Set<Integer> dailyClaimedIndices = dailyClaims.stream().map(UserMilestoneClaimEntity::getMilestoneIndex).collect(Collectors.toSet());

        List<UserMilestoneClaimEntity> weeklyClaims = userMilestoneClaimRepository.findByUserIdAndQuestTypeAndPeriodKey(userId, QuestType.WEEKLY, weeklyKey);
        Set<Integer> weeklyClaimedIndices = weeklyClaims.stream().map(UserMilestoneClaimEntity::getMilestoneIndex).collect(Collectors.toSet());

        List<MilestoneRewardDto> dailyMilestones = buildDailyMilestones(dailyPoints, dailyClaimedIndices);
        List<MilestoneRewardDto> weeklyMilestones = buildWeeklyMilestones(weeklyPoints, weeklyClaimedIndices);

        return QuestOverviewResponseDto.builder()
                .dailyQuests(dailyDtos)
                .weeklyQuests(weeklyDtos)
                .dailyActivityPoints(dailyPoints)
                .weeklyActivityPoints(weeklyPoints)
                .dailyMilestones(dailyMilestones)
                .weeklyMilestones(weeklyMilestones)
                .dailyPeriodKey(dailyKey)
                .weeklyPeriodKey(weeklyKey)
                .build();
    }

    @Override
    @Transactional
    public QuestOverviewResponseDto claimQuestReward(UUID userId, String questId) {
        UserEntity user = userService.getUserOrThrow(userId);
        QuestTemplateEntity template = questTemplateRepository.findById(questId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhiệm vụ: " + questId));

        String periodKey = template.getQuestType() == QuestType.DAILY ? getDailyKey() : getWeeklyKey();

        UserQuestProgressEntity progress = userQuestProgressRepository
                .findByUserIdAndQuestTemplateIdAndPeriodKey(userId, questId, periodKey)
                .orElseThrow(() -> new GameRuleViolationException("Chưa có tiến trình cho nhiệm vụ này!"));

        if (progress.isClaimed()) {
            throw new GameRuleViolationException("Nhiệm vụ này đã được nhận thưởng rồi!");
        }

        if (progress.getCurrentCount() < template.getTargetCount()) {
            throw new GameRuleViolationException("Nhiệm vụ chưa hoàn thành!");
        }

        // Grant rewards
        if (template.getGoldReward() > 0) user.setGold(user.getGold() + template.getGoldReward());
        if (template.getGemsReward() > 0) user.setGems(user.getGems() + template.getGemsReward());
        if (template.getStonesReward() > 0) user.setEnhanceStones(user.getEnhanceStones() + template.getStonesReward());
        userRepository.save(user);

        progress.setClaimed(true);
        progress.setCompleted(true);
        userQuestProgressRepository.save(progress);

        log.info("🎁 User {} claimed quest reward for: {}", userId, template.getTitle());
        return getQuestOverview(userId);
    }

    @Override
    @Transactional
    public QuestOverviewResponseDto claimMilestoneReward(UUID userId, QuestType questType, int milestoneIndex) {
        UserEntity user = userService.getUserOrThrow(userId);
        String periodKey = questType == QuestType.DAILY ? getDailyKey() : getWeeklyKey();

        if (userMilestoneClaimRepository.findByUserIdAndQuestTypeAndPeriodKeyAndMilestoneIndex(userId, questType, periodKey, milestoneIndex).isPresent()) {
            throw new GameRuleViolationException("Mốc quà này đã được nhận rồi!");
        }

        // Calculate current activity points
        List<UserQuestProgressEntity> progressList = userQuestProgressRepository.findByUserIdAndQuestTypeAndPeriodKey(userId, questType, periodKey);
        int currentPoints = progressList.stream()
                .filter(UserQuestProgressEntity::isCompleted)
                .mapToInt(p -> p.getQuestTemplate().getActivityPoints())
                .sum();

        int requiredPoints = questType == QuestType.DAILY ? (milestoneIndex * 20) : (milestoneIndex * 100);
        if (currentPoints < requiredPoints) {
            throw new GameRuleViolationException("Chưa đủ điểm năng động để mở khóa mốc quà này! (Cần " + requiredPoints + " điểm)");
        }

        // Grant milestone rewards
        if (questType == QuestType.DAILY) {
            switch (milestoneIndex) {
                case 1 -> { user.setGold(user.getGold() + 300); user.setGems(user.getGems() + 10); }
                case 2 -> { user.setGold(user.getGold() + 500); user.setGems(user.getGems() + 20); user.setEnhanceStones(user.getEnhanceStones() + 1); }
                case 3 -> { user.setGold(user.getGold() + 800); user.setGems(user.getGems() + 30); }
                case 4 -> { user.setGold(user.getGold() + 1200); user.setGems(user.getGems() + 50); user.setEnhanceStones(user.getEnhanceStones() + 2); }
                case 5 -> { user.setGold(user.getGold() + 2000); user.setGems(user.getGems() + 80); }
                case 6 -> {
                    user.setGold(user.getGold() + 3500);
                    user.setGems(user.getGems() + 120);
                    spawnRewardItem(user, ItemRarity.EPIC);
                }
            }
        } else {
            switch (milestoneIndex) {
                case 1 -> { user.setGold(user.getGold() + 2000); user.setGems(user.getGems() + 100); user.setEnhanceStones(user.getEnhanceStones() + 5); }
                case 2 -> { user.setGold(user.getGold() + 4000); user.setGems(user.getGems() + 200); }
                case 3 -> { user.setGold(user.getGold() + 6000); user.setGems(user.getGems() + 350); user.setEnhanceStones(user.getEnhanceStones() + 10); }
                case 4 -> { user.setGold(user.getGold() + 8000); user.setGems(user.getGems() + 500); }
                case 5 -> { user.setGold(user.getGold() + 12000); user.setGems(user.getGems() + 800); spawnRewardItem(user, ItemRarity.EPIC); }
                case 6 -> {
                    user.setGold(user.getGold() + 20000);
                    user.setGems(user.getGems() + 1500);
                    spawnRewardItem(user, ItemRarity.LEGENDARY);
                }
            }
        }
        userRepository.save(user);

        userMilestoneClaimRepository.save(UserMilestoneClaimEntity.builder()
                .user(user)
                .questType(questType)
                .periodKey(periodKey)
                .milestoneIndex(milestoneIndex)
                .build());

        log.info("🏆 User {} claimed milestone {} reward for period: {}", userId, milestoneIndex, periodKey);
        return getQuestOverview(userId);
    }

    private void spawnRewardItem(UserEntity user, ItemRarity rarity) {
        List<ItemTemplateEntity> templates = itemTemplateRepository.findAll().stream()
                .filter(t -> t.getBaseRarity() == rarity)
                .collect(Collectors.toList());

        if (templates.isEmpty()) templates = itemTemplateRepository.findAll();
        if (!templates.isEmpty()) {
            ItemTemplateEntity tmpl = templates.get(ThreadLocalRandom.current().nextInt(templates.size()));
            int ilvl = Math.max(1, (user.getCurrentWorld() - 1) * 10 + user.getCurrentStage());
            ItemInstanceEntity item = ItemInstanceEntity.builder()
                    .user(user)
                    .template(tmpl)
                    .itemLevel(ilvl)
                    .currentRarity(tmpl.getBaseRarity())
                    .enhanceLevel(0)
                    .sockets("[]")
                    .subStats("{}")
                    .build();
            itemInstanceRepository.save(item);
        }
    }

    @Override
    @Transactional
    public void recordQuestAction(UUID userId, QuestActionType actionType, int amount) {
        if (userId == null || amount <= 0) return;
        String dailyKey = getDailyKey();
        String weeklyKey = getWeeklyKey();

        List<QuestTemplateEntity> templates = questTemplateRepository.findByActionTypeAndIsActiveTrue(actionType);
        for (QuestTemplateEntity t : templates) {
            String periodKey = t.getQuestType() == QuestType.DAILY ? dailyKey : weeklyKey;
            userQuestProgressRepository.findByUserIdAndQuestTemplateIdAndPeriodKey(userId, t.getId(), periodKey)
                    .ifPresent(p -> {
                        if (!p.isCompleted()) {
                            int newCount = p.getCurrentCount() + amount;
                            p.setCurrentCount(newCount);
                            if (newCount >= t.getTargetCount()) {
                                p.setCompleted(true);
                            }
                            userQuestProgressRepository.save(p);
                        }
                    });
        }
    }

    // ==========================================
    // 🛠️ ADMIN APIS
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<QuestTemplateEntity> getAllQuestTemplates() {
        return questTemplateRepository.findByIsActiveTrueOrderByQuestTypeAscSortOrderAsc();
    }

    @Override
    @Transactional
    public QuestTemplateEntity createQuestTemplate(QuestTemplateEntity template) {
        if (template.getId() == null || template.getId().isBlank()) {
            template.setId("quest_" + System.currentTimeMillis());
        }
        return questTemplateRepository.save(template);
    }

    @Override
    @Transactional
    public QuestTemplateEntity updateQuestTemplate(String id, QuestTemplateEntity template) {
        QuestTemplateEntity entity = questTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhiệm vụ: " + id));

        entity.setTitle(template.getTitle());
        entity.setDescription(template.getDescription());
        entity.setIcon(template.getIcon());
        entity.setQuestType(template.getQuestType());
        entity.setActionType(template.getActionType());
        entity.setTargetCount(template.getTargetCount());
        entity.setActivityPoints(template.getActivityPoints());
        entity.setGoldReward(template.getGoldReward());
        entity.setGemsReward(template.getGemsReward());
        entity.setStonesReward(template.getStonesReward());
        entity.setItemTemplateId(template.getItemTemplateId());
        entity.setActive(template.isActive());
        entity.setSortOrder(template.getSortOrder());

        return questTemplateRepository.save(entity);
    }

    @Override
    @Transactional
    public void deleteQuestTemplate(String id) {
        questTemplateRepository.deleteById(id);
    }

    // ==========================================
    // 🛠️ HELPERS
    // ==========================================

    private QuestDto toQuestDto(QuestTemplateEntity t, UserQuestProgressEntity p) {
        return QuestDto.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .icon(t.getIcon())
                .questType(t.getQuestType())
                .actionType(t.getActionType())
                .targetCount(t.getTargetCount())
                .currentCount(p.getCurrentCount())
                .activityPoints(t.getActivityPoints())
                .goldReward(t.getGoldReward())
                .gemsReward(t.getGemsReward())
                .stonesReward(t.getStonesReward())
                .itemTemplateId(t.getItemTemplateId())
                .isCompleted(p.isCompleted())
                .isClaimed(p.isClaimed())
                .build();
    }

    private List<MilestoneRewardDto> buildDailyMilestones(int points, Set<Integer> claimed) {
        return List.of(
            MilestoneRewardDto.builder().milestoneIndex(1).pointsRequired(20).goldReward(300).gemsReward(10).stonesReward(0).icon("🥉").isClaimed(claimed.contains(1)).canClaim(points >= 20 && !claimed.contains(1)).build(),
            MilestoneRewardDto.builder().milestoneIndex(2).pointsRequired(40).goldReward(500).gemsReward(20).stonesReward(1).icon("🥈").isClaimed(claimed.contains(2)).canClaim(points >= 40 && !claimed.contains(2)).build(),
            MilestoneRewardDto.builder().milestoneIndex(3).pointsRequired(60).goldReward(800).gemsReward(30).stonesReward(0).icon("🥇").isClaimed(claimed.contains(3)).canClaim(points >= 60 && !claimed.contains(3)).build(),
            MilestoneRewardDto.builder().milestoneIndex(4).pointsRequired(80).goldReward(1200).gemsReward(50).stonesReward(2).icon("💎").isClaimed(claimed.contains(4)).canClaim(points >= 80 && !claimed.contains(4)).build(),
            MilestoneRewardDto.builder().milestoneIndex(5).pointsRequired(100).goldReward(2000).gemsReward(80).stonesReward(0).icon("👑").isClaimed(claimed.contains(5)).canClaim(points >= 100 && !claimed.contains(5)).build(),
            MilestoneRewardDto.builder().milestoneIndex(6).pointsRequired(120).goldReward(3500).gemsReward(120).stonesReward(0).itemRewardName("Epic Gear Chest").icon("🎁").isClaimed(claimed.contains(6)).canClaim(points >= 120 && !claimed.contains(6)).build()
        );
    }

    private List<MilestoneRewardDto> buildWeeklyMilestones(int points, Set<Integer> claimed) {
        return List.of(
            MilestoneRewardDto.builder().milestoneIndex(1).pointsRequired(100).goldReward(2000).gemsReward(100).stonesReward(5).icon("🥉").isClaimed(claimed.contains(1)).canClaim(points >= 100 && !claimed.contains(1)).build(),
            MilestoneRewardDto.builder().milestoneIndex(2).pointsRequired(200).goldReward(4000).gemsReward(200).stonesReward(0).icon("🥈").isClaimed(claimed.contains(2)).canClaim(points >= 200 && !claimed.contains(2)).build(),
            MilestoneRewardDto.builder().milestoneIndex(3).pointsRequired(300).goldReward(6000).gemsReward(350).stonesReward(10).icon("🥇").isClaimed(claimed.contains(3)).canClaim(points >= 300 && !claimed.contains(3)).build(),
            MilestoneRewardDto.builder().milestoneIndex(4).pointsRequired(400).goldReward(8000).gemsReward(500).stonesReward(0).icon("💎").isClaimed(claimed.contains(4)).canClaim(points >= 400 && !claimed.contains(4)).build(),
            MilestoneRewardDto.builder().milestoneIndex(5).pointsRequired(500).goldReward(12000).gemsReward(800).stonesReward(0).itemRewardName("Epic Gear Chest").icon("👑").isClaimed(claimed.contains(5)).canClaim(points >= 500 && !claimed.contains(5)).build(),
            MilestoneRewardDto.builder().milestoneIndex(6).pointsRequired(600).goldReward(20000).gemsReward(1500).stonesReward(0).itemRewardName("Legendary Gear Chest").icon("🏆").isClaimed(claimed.contains(6)).canClaim(points >= 600 && !claimed.contains(6)).build()
        );
    }
}
