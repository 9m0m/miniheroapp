package com.worldhero.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldhero.dto.MockWldPayRequestDto;
import com.worldhero.dto.MonetizationStatusDto;
import com.worldhero.dto.UserProfileDto;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.exception.InsufficientResourceException;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.ItemTemplateEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.repository.ItemInstanceRepository;
import com.worldhero.repository.ItemTemplateRepository;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.MonetizationService;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MonetizationServiceImpl implements MonetizationService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final UserRepository userRepository;
    private final ItemTemplateRepository templateRepository;
    private final ItemInstanceRepository instanceRepository;
    private final UserService userService;

    @Override
    @Transactional(readOnly = true)
    public MonetizationStatusDto getStatus(UUID userId) {
        UserEntity user = userService.getUserOrThrow(userId);
        List<Integer> claimedStages = parseClaimedStages(user.getGrowthFundClaimedStages());

        boolean canClaimToday = true;
        if (user.getLoginLastClaimedAt() != null) {
            canClaimToday = !user.getLoginLastClaimedAt().toLocalDate().isEqual(LocalDate.now());
        }

        return MonetizationStatusDto.builder()
                .piggyBankGems(user.getPiggyBankGems())
                .isPiggyBankFull(user.getPiggyBankGems() >= 1000)
                .isGoldenPassActive(user.isGoldenPassActive())
                .loginDayIndex(user.getLoginDayIndex())
                .loginLastClaimedAt(user.getLoginLastClaimedAt())
                .canClaimToday(canClaimToday)
                .growthFundUnlocked(user.isGrowthFundUnlocked())
                .claimedGrowthFundStages(claimedStages)
                .maxClearedStage(user.getMaxClearedStage())
                .build();
    }

    @Override
    @Transactional
    public UserProfileDto smashPiggyBank(UUID userId) {
        UserEntity user = userService.getUserOrThrow(userId);
        int gemsToClaim = user.getPiggyBankGems();

        if (gemsToClaim <= 0) {
            throw new GameRuleViolationException("Piggy Bank is currently empty!");
        }

        user.setGems(user.getGems() + gemsToClaim);
        user.setPiggyBankGems(0);
        user = userRepository.save(user);

        log.info("🐷 User {} smashed Piggy Bank and claimed {} gems!", user.getId(), gemsToClaim);
        return userService.getProfile(user.getId());
    }

    @Override
    @Transactional
    public UserProfileDto claimDailyPass(UUID userId) {
        UserEntity user = userService.getUserOrThrow(userId);

        if (user.getLoginLastClaimedAt() != null &&
                user.getLoginLastClaimedAt().toLocalDate().isEqual(LocalDate.now())) {
            throw new GameRuleViolationException("Phần thưởng hàng ngày đã được nhận hôm nay. Vui lòng quay lại vào ngày mai!");
        }

        int currentDay = user.getLoginDayIndex(); // 0 to 6
        boolean isGolden = user.isGoldenPassActive();

        // 1. Grant Free Rewards
        long goldReward = 1000L * (currentDay + 1);
        int stoneReward = currentDay + 1;
        int gemReward = 10 * (currentDay + 1);

        // 2. Multiplier & Special Items if Golden Pass Active
        if (isGolden) {
            goldReward *= 5;
            stoneReward *= 5;
            gemReward *= 5;

            // Day 7 Grand Prize: Guaranteed Epic Equipment Box
            if (currentDay == 6) {
                grantEpicGuaranteedChest(user);
            }
        }

        user.setGold(user.getGold() + goldReward);
        user.setEnhanceStones(user.getEnhanceStones() + stoneReward);
        user.setGems(user.getGems() + gemReward);

        user.setLoginLastClaimedAt(LocalDateTime.now());
        user.setLoginDayIndex((currentDay + 1) % 7);

        user = userRepository.save(user);
        log.info("🎁 User {} claimed Awakening Pass Day {} (Golden: {})", user.getId(), currentDay + 1, isGolden);

        return userService.getProfile(user.getId());
    }

    @Override
    @Transactional
    public UserProfileDto claimGrowthFund(UUID userId, int stageMilestone) {
        UserEntity user = userService.getUserOrThrow(userId);

        if (!user.isGrowthFundUnlocked()) {
            throw new GameRuleViolationException("Bạn chưa mở khóa Quỹ Thám Hiểm (2.0 WLD)!");
        }

        if (user.getMaxClearedStage() < stageMilestone) {
            throw new GameRuleViolationException("Chưa đạt mốc Ải " + stageMilestone + " (Kỷ lục hiện tại: Ải " + user.getMaxClearedStage() + ")");
        }

        List<Integer> claimed = parseClaimedStages(user.getGrowthFundClaimedStages());
        if (claimed.contains(stageMilestone)) {
            throw new GameRuleViolationException("Cổ tức mốc Ải " + stageMilestone + " đã được nhận trước đó!");
        }

        // Rewards: 250 Gems + 10 Stones per milestone
        user.setGems(user.getGems() + 250);
        user.setEnhanceStones(user.getEnhanceStones() + 10);

        claimed.add(stageMilestone);
        user.setGrowthFundClaimedStages(serializeClaimedStages(claimed));

        user = userRepository.save(user);
        log.info("📈 User {} claimed Growth Fund milestone Stage {}", user.getId(), stageMilestone);

        return userService.getProfile(user.getId());
    }

    @Override
    @Transactional
    public UserProfileDto processMockWldPayment(MockWldPayRequestDto request) {
        UserEntity user = userService.getUserOrThrow(request.getUserId());

        log.info("💳 Processing MiniKit Pay Sandbox: Feature={}, Amount={} WLD, User={}",
                request.getFeatureKey(), request.getAmountWld(), user.getId());

        switch (request.getFeatureKey()) {
            case "PIGGY_BANK" -> {
                int gems = Math.max(500, user.getPiggyBankGems());
                user.setGems(user.getGems() + gems);
                user.setPiggyBankGems(0);
                log.info("🐷 Smashed Piggy Bank via WLD Pay for user {}: +{} Gems", user.getId(), gems);
            }
            case "GOLDEN_PASS" -> {
                user.setGoldenPassActive(true);
                log.info("👑 Activated 7-Day Awakening Golden Pass for user {}", user.getId());
            }
            case "GROWTH_FUND" -> {
                user.setGrowthFundUnlocked(true);
                log.info("📈 Unlocked 500% Growth Fund for user {}", user.getId());
            }
            default -> log.warn("Unknown featureKey for WLD Pay: {}", request.getFeatureKey());
        }

        user = userRepository.save(user);
        return userService.getProfile(user.getId());
    }

    private void grantEpicGuaranteedChest(UserEntity user) {
        List<ItemTemplateEntity> epicTemplates = templateRepository.findAll().stream()
                .filter(t -> t.getBaseRarity() == ItemRarity.EPIC)
                .toList();

        if (!epicTemplates.isEmpty()) {
            ItemTemplateEntity tmpl = epicTemplates.get(0);
            ItemInstanceEntity item = ItemInstanceEntity.builder()
                    .user(user)
                    .template(tmpl)
                    .itemLevel(Math.max(10, user.getCurrentStage()))
                    .currentRarity(ItemRarity.EPIC)
                    .enhanceLevel(0)
                    .sockets("[]")
                    .subStats("{}")
                    .build();
            instanceRepository.save(item);
            log.info("🎁 Day 7 Grand Prize: Granted Epic {} to user {}", tmpl.getName(), user.getId());
        }
    }

    private List<Integer> parseClaimedStages(String json) {
        if (json == null || json.isBlank() || json.equals("[]")) {
            return new ArrayList<>();
        }
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<List<Integer>>() {});
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }

    private String serializeClaimedStages(List<Integer> list) {
        try {
            return OBJECT_MAPPER.writeValueAsString(list != null ? list : new ArrayList<>());
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }
}
