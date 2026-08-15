package com.worldhero.service.impl;

import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.WaveClearRequestDto;
import com.worldhero.dto.WaveClearResponseDto;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.ItemTemplateEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.repository.DropTableConfigRepository;
import com.worldhero.repository.ItemInstanceRepository;
import com.worldhero.repository.ItemTemplateRepository;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.BattleService;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleServiceImpl implements BattleService {

    public static final int PIGGY_BANK_CAP = 1000;

    private final UserRepository userRepository;
    private final ItemTemplateRepository templateRepository;
    private final ItemInstanceRepository instanceRepository;
    private final DropTableConfigRepository dropTableConfigRepository;
    private final UserService userService;
    private final com.worldhero.service.QuestService questService;

    @Override
    @Transactional
    public WaveClearResponseDto processWaveClear(WaveClearRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        int world = Math.max(1, request.getWorld() > 0 ? request.getWorld() : user.getCurrentWorld());
        int stage = Math.max(1, request.getStage() > 0 ? request.getStage() : user.getCurrentStage());
        int wave = Math.max(1, request.getWave() > 0 ? request.getWave() : user.getCurrentWave());
        boolean isBoss = request.isBossWave() || wave == 31;

        // Fetch Live Drop Config from Database (with fallback defaults)
        var dropConfig = dropTableConfigRepository.findByWorldIndexAndStageIndex(world, stage).orElse(null);
        double goldMult = dropConfig != null ? dropConfig.getGoldMultiplier() : 1.0;
        double normalChestChance = dropConfig != null ? dropConfig.getChestDropChance() : 0.03;
        double bossChestChance = dropConfig != null ? dropConfig.getBossChestDropChance() : 0.25;
        double stoneChance = dropConfig != null ? dropConfig.getStoneDropChance() : 0.40;

        // 1. Calculate Currencies Earned
        long baseGold = 50L * world * stage + (isBoss ? 500L * stage : 0L);
        long goldEarned = Math.round(baseGold * goldMult);
        int stonesEarned = isBoss ? 3 : (ThreadLocalRandom.current().nextDouble() < stoneChance ? 1 : 0);

        // 2. Piggy Bank Accumulation (+5 per wave, +20 for Boss, max 1000)
        int gemsToAdd = isBoss ? 20 : 5;
        int oldPiggy = user.getPiggyBankGems();
        int newPiggy = Math.min(PIGGY_BANK_CAP, oldPiggy + gemsToAdd);
        int actualGemsAdded = newPiggy - oldPiggy;

        // 3. Dynamic Rarity Chest Drop Mechanics
        double dropChance = isBoss ? bossChestChance : normalChestChance;
        boolean droppedChest = ThreadLocalRandom.current().nextDouble() < dropChance;
        ItemInstanceDto droppedItemDto = null;

        if (droppedChest) {
            // Determine target rarity from live config weights
            double commonW = isBoss ? (dropConfig != null ? dropConfig.getBossCommonWeight() : 0.0) : (dropConfig != null ? dropConfig.getNormalCommonWeight() : 0.60);
            double uncommonW = isBoss ? (dropConfig != null ? dropConfig.getBossUncommonWeight() : 0.20) : (dropConfig != null ? dropConfig.getNormalUncommonWeight() : 0.28);
            double rareW = isBoss ? (dropConfig != null ? dropConfig.getBossRareWeight() : 0.45) : (dropConfig != null ? dropConfig.getNormalRareWeight() : 0.10);
            double epicW = isBoss ? (dropConfig != null ? dropConfig.getBossEpicWeight() : 0.30) : (dropConfig != null ? dropConfig.getNormalEpicWeight() : 0.02);
            double legendaryW = isBoss ? (dropConfig != null ? dropConfig.getBossLegendaryWeight() : 0.05) : (dropConfig != null ? dropConfig.getNormalLegendaryWeight() : 0.00);

            double roll = ThreadLocalRandom.current().nextDouble();
            com.worldhero.model.enums.ItemRarity targetRarity = com.worldhero.model.enums.ItemRarity.COMMON;
            double cumulative = 0.0;
            if ((cumulative += legendaryW) >= roll) {
                targetRarity = com.worldhero.model.enums.ItemRarity.LEGENDARY;
            } else if ((cumulative += epicW) >= roll) {
                targetRarity = com.worldhero.model.enums.ItemRarity.EPIC;
            } else if ((cumulative += rareW) >= roll) {
                targetRarity = com.worldhero.model.enums.ItemRarity.RARE;
            } else if ((cumulative += uncommonW) >= roll) {
                targetRarity = com.worldhero.model.enums.ItemRarity.UNCOMMON;
            } else {
                targetRarity = com.worldhero.model.enums.ItemRarity.COMMON;
            }

            final com.worldhero.model.enums.ItemRarity selectedRarity = targetRarity;
            List<ItemTemplateEntity> matchingTemplates = templateRepository.findAll().stream()
                    .filter(t -> t.getBaseRarity() == selectedRarity)
                    .collect(Collectors.toList());

            if (matchingTemplates.isEmpty()) {
                matchingTemplates = templateRepository.findAll();
            }

            if (!matchingTemplates.isEmpty()) {
                ItemTemplateEntity randomTemplate = matchingTemplates.get(ThreadLocalRandom.current().nextInt(matchingTemplates.size()));
                int calculatedILvl = Math.max(1, (world - 1) * 10 + stage);

                ItemInstanceEntity droppedInstance = ItemInstanceEntity.builder()
                        .user(user)
                        .hero(null) // in bag
                        .equippedSlot(null)
                        .template(randomTemplate)
                        .itemLevel(calculatedILvl)
                        .currentRarity(randomTemplate.getBaseRarity())
                        .enhanceLevel(0)
                        .sockets("[]")
                        .subStats("{}")
                        .build();

                droppedInstance = instanceRepository.save(droppedInstance);
                droppedItemDto = droppedInstance.toInstanceDto();
                log.info("🎁 Drop Chest Triggered: User {} received [{}] {} (iLvl {})",
                        user.getId(), randomTemplate.getBaseRarity(), randomTemplate.getName(), calculatedILvl);
            }
        }

        // 4. Update Progression: Waves 1..30 are normal mob waves, Wave 31 is the Stage Boss
        int nextWave = wave;
        int nextStage = stage;
        int nextWorld = world;

        if (isBoss || wave >= 31) {
            int currentStageTotalIndex = (world - 1) * 10 + stage;
            user.setMaxClearedStage(Math.max(user.getMaxClearedStage(), currentStageTotalIndex));

            if (stage < 10) {
                nextStage = stage + 1;
                nextWave = 1;
            } else {
                if (world < 4) {
                    nextWorld = world + 1;
                    nextStage = 1;
                    nextWave = 1;
                } else {
                    // Stay on final loop
                    nextWave = 1;
                }
            }
        } else {
            nextWave = wave + 1;
        }

        // Apply to user state
        user.setGold(user.getGold() + goldEarned);
        user.setEnhanceStones(user.getEnhanceStones() + stonesEarned);
        user.setPiggyBankGems(newPiggy);
        user.setCurrentWorld(nextWorld);
        user.setCurrentStage(nextStage);
        user.setCurrentWave(nextWave);

        user = userRepository.save(user);

        // Record Quest Actions
        try {
            questService.recordQuestAction(user.getId(), com.worldhero.model.enums.QuestActionType.WAVE_CLEAR, 1);
            questService.recordQuestAction(user.getId(), com.worldhero.model.enums.QuestActionType.MONSTER_KILL, isBoss ? 1 : 4);
            questService.recordQuestAction(user.getId(), com.worldhero.model.enums.QuestActionType.GOLD_EARNED, (int) goldEarned);
            if (isBoss) {
                questService.recordQuestAction(user.getId(), com.worldhero.model.enums.QuestActionType.BOSS_KILL_W31, 1);
            }
            if (droppedChest) {
                questService.recordQuestAction(user.getId(), com.worldhero.model.enums.QuestActionType.CHEST_OPEN, 1);
            }
        } catch (Exception e) {
            log.warn("Failed to record quest action for user {}: {}", user.getId(), e.getMessage());
        }

        return WaveClearResponseDto.builder()
                .goldEarned(goldEarned)
                .enhanceStonesEarned(stonesEarned)
                .piggyBankGemsAdded(actualGemsAdded)
                .totalPiggyBankGems(newPiggy)
                .droppedChest(droppedChest)
                .droppedItem(droppedItemDto)
                .currentWorld(nextWorld)
                .currentStage(nextStage)
                .currentWave(nextWave)
                .totalGold(user.getGold())
                .totalGems(user.getGems())
                .totalStones(user.getEnhanceStones())
                .build();
    }
}
