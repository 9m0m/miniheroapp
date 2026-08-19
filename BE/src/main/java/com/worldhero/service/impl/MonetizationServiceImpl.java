package com.worldhero.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.MockWldPayRequestDto;
import com.worldhero.dto.MonetizationStatusDto;
import com.worldhero.dto.PaymentVerifyRequestDto;
import com.worldhero.dto.UserProfileDto;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.model.entity.ItemInstanceEntity;
import com.worldhero.model.entity.ItemTemplateEntity;
import com.worldhero.model.entity.PaymentTransactionEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.repository.ItemInstanceRepository;
import com.worldhero.repository.PaymentTransactionRepository;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.MonetizationService;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MonetizationServiceImpl implements MonetizationService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    // Server-Authoritative WLD Pricing
    private static final Map<String, BigDecimal> SERVER_PRICES = Map.of(
            "PIGGY_BANK", new BigDecimal("0.5"),
            "SMASH_PIGGY_BANK", new BigDecimal("0.5"),
            "GOLDEN_PASS", new BigDecimal("1.0")
    );

    private final UserRepository userRepository;
    private final ItemInstanceRepository instanceRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final UserService userService;
    private final com.worldhero.service.ItemTemplateCacheService itemTemplateCacheService;
    private final Environment environment;

    private UUID getEffectiveUserId(UUID requestedUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal && principal.getId() != null) {
            return principal.getId();
        }
        return requestedUserId;
    }

    @Override
    @Transactional(readOnly = true)
    public MonetizationStatusDto getStatus(UUID userId) {
        UUID effectiveId = getEffectiveUserId(userId);
        UserEntity user = userService.getUserOrThrow(effectiveId);
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
                .build();
    }

    @Override
    @Transactional
    public UserProfileDto smashPiggyBank(UUID userId) {
        UUID effectiveId = getEffectiveUserId(userId);
        UserEntity user = userService.getUserOrThrow(effectiveId);
        int gemsToClaim = user.getPiggyBankGems();

        if (gemsToClaim <= 0) {
            throw new GameRuleViolationException("Két Sắt Thần Tài đang trống!");
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
        UUID effectiveId = getEffectiveUserId(userId);
        UserEntity user = userService.getUserOrThrow(effectiveId);

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
    public UserProfileDto verifyPayment(PaymentVerifyRequestDto request) {
        UUID effectiveId = getEffectiveUserId(request.getUserId());
        UserEntity user = userService.getUserOrThrow(effectiveId);

        String reference = request.getReference();
        // Check idempotency: If reference already processed, return current profile safely
        if (paymentTransactionRepository.existsByReference(reference)) {
            log.info("ℹ️ Payment reference {} already processed (Idempotent replay).", reference);
            return userService.getProfile(user.getId());
        }

        // Reject local mock transactions in production
        if (!isDevOrTest() && (request.getTransactionId() != null && request.getTransactionId().startsWith("local_tx_"))) {
            throw new GameRuleViolationException("Giao dịch giả lập không được chấp nhận trong môi trường Production!");
        }

        // Check if transaction_id was already claimed
        if (StringUtils.hasText(request.getTransactionId()) && paymentTransactionRepository.existsByTransactionId(request.getTransactionId())) {
            log.warn("⚠️ Transaction ID {} has already been claimed!", request.getTransactionId());
            return userService.getProfile(user.getId());
        }

        String featureKey = request.getFeatureKey().toUpperCase();
        BigDecimal expectedPrice = SERVER_PRICES.get(featureKey);
        if (expectedPrice == null) {
            throw new GameRuleViolationException("Gói thanh toán không hợp lệ: " + featureKey);
        }

        // Validate exact server price match
        if (request.getAmountWld() != null && request.getAmountWld().compareTo(expectedPrice) != 0) {
            log.warn("❌ Payment price mismatch: Client={} WLD, Expected={} WLD", request.getAmountWld(), expectedPrice);
            throw new GameRuleViolationException("Số tiền WLD không khớp với giá niêm yết của máy chủ (" + expectedPrice + " WLD)");
        }

        log.info("💳 Verifying MiniKit WLD Payment: Feature={}, Amount={} WLD, Ref={}, User={}",
                featureKey, expectedPrice, reference, user.getId());

        switch (featureKey) {
            case "PIGGY_BANK", "SMASH_PIGGY_BANK" -> {
                int gems = Math.max(100, user.getPiggyBankGems());
                user.setGems(user.getGems() + gems);
                user.setPiggyBankGems(0);
                log.info("🐷 Smashed Piggy Bank via verified WLD Pay for user {}: +{} Gems", user.getId(), gems);
            }
            case "GOLDEN_PASS" -> {
                user.setGoldenPassActive(true);
                log.info("👑 Activated 7-Day Awakening Golden Pass for user {}", user.getId());
            }
            default -> throw new GameRuleViolationException("Gói thanh toán không hợp lệ: " + featureKey);
        }

        user = userRepository.save(user);

        // Record Transaction to ledger with server-verified price
        PaymentTransactionEntity tx = PaymentTransactionEntity.builder()
                .user(user)
                .reference(reference)
                .transactionId(request.getTransactionId())
                .featureKey(featureKey)
                .amountWld(expectedPrice)
                .status("COMPLETED")
                .build();
        paymentTransactionRepository.save(tx);

        return userService.getProfile(user.getId());
    }

    @Override
    @Transactional
    public UserProfileDto processMockWldPayment(MockWldPayRequestDto request) {
        if (!environment.acceptsProfiles(Profiles.of("dev", "test"))) {
            throw new GameRuleViolationException("Mock WLD payment is strictly disabled in production!");
        }

        UUID effectiveId = getEffectiveUserId(request.getUserId());
        UserEntity user = userService.getUserOrThrow(effectiveId);

        log.info("💳 Processing Dev Sandbox Payment: Feature={}, Amount={} WLD, User={}",
                request.getFeatureKey(), request.getAmountWld(), user.getId());

        switch (request.getFeatureKey()) {
            case "PIGGY_BANK", "SMASH_PIGGY_BANK" -> {
                int gems = Math.max(100, user.getPiggyBankGems());
                user.setGems(user.getGems() + gems);
                user.setPiggyBankGems(0);
            }
            case "GOLDEN_PASS" -> user.setGoldenPassActive(true);
            default -> log.warn("Unknown featureKey: {}", request.getFeatureKey());
        }

        user = userRepository.save(user);
        return userService.getProfile(user.getId());
    }

    private void grantEpicGuaranteedChest(UserEntity user) {
        ItemTemplateEntity tmpl = itemTemplateCacheService.getRandomTemplateByRarity(ItemRarity.EPIC);

        if (tmpl != null) {
            ItemInstanceEntity item = ItemInstanceEntity.builder()
                    .user(user)
                    .template(tmpl)
                    .itemLevel(10)
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

    private boolean isDevOrTest() {
        return environment.acceptsProfiles(Profiles.of("dev", "test", "local", "default"));
    }
}
