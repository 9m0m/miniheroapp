package com.worldhero.service.impl;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.worldhero.config.security.JwtTokenProvider;
import com.worldhero.dto.AuthResponseDto;
import com.worldhero.dto.UserProfileDto;
import com.worldhero.dto.WorldIdVerifyRequestDto;
import com.worldhero.exception.InvalidWorldProofException;
import com.worldhero.model.entity.HeroEntity;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.repository.HeroRepository;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.UserService;
import com.worldhero.service.WorldIdVerificationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorldIdVerificationServiceImpl implements WorldIdVerificationService {

    private final UserRepository userRepository;
    private final HeroRepository heroRepository;
    private final com.worldhero.repository.OnboardingStateRepository onboardingStateRepository;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final Environment environment;

    @Value("${app.worldcoin.app-id:app_staging_world_hero_2026}")
    private String worldcoinAppId;

    @Value("${app.worldcoin.action:world-hero-login}")
    private String worldcoinAction;

    @Value("${app.worldcoin.verify-url:https://developer.worldcoin.org/api/v2/verify}")
    private String worldcoinVerifyUrl;

    @Override
    @Transactional
    public AuthResponseDto verifyAndAuthenticate(WorldIdVerifyRequestDto request) {
        String nullifierHash = request.getNullifierHash();
        if (!StringUtils.hasText(nullifierHash)) {
            throw new InvalidWorldProofException("nullifier_hash is required for World ID verification!");
        }

        boolean isDevOrTest = environment.acceptsProfiles(Profiles.of("dev", "test"));

        // If proof is provided or running in production, perform external fail-closed verification
        if (!isDevOrTest || StringUtils.hasText(request.getProof())) {
            verifyProofWithWorldApi(request);
        } else {
            log.info("🧪 Dev profile active: Skipping external World ID network call for nullifier: {}", maskHash(nullifierHash));
        }

        // Masked logging for security compliance
        log.info("🌐 Authenticated World ID user with nullifier: {}", maskHash(nullifierHash));

        // Find or create User in PostgreSQL
        UserEntity user = userRepository.findByWorldIdHash(nullifierHash)
                .orElseGet(() -> createNewWorldUser(nullifierHash, request.getDisplayName()));

        // Generate JWT Bearer Token (1 hour access token)
        String token = jwtTokenProvider.generateToken(
                user.getId(),
                user.getWorldIdHash(),
                user.getDisplayName(),
                "ROLE_USER"
        );

        UserProfileDto profile = userService.getProfile(user.getId());

        return AuthResponseDto.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(3600) // 1 hour access token
                .userId(user.getId())
                .worldIdHash(user.getWorldIdHash())
                .displayName(user.getDisplayName())
                .role("ROLE_USER")
                .profile(profile)
                .build();
    }

    private void verifyProofWithWorldApi(WorldIdVerifyRequestDto request) {
        String targetAppId = StringUtils.hasText(worldcoinAppId) ? worldcoinAppId : "app_staging_world_hero_2026";
        String targetAction = StringUtils.hasText(request.getAction()) ? request.getAction() : worldcoinAction;
        String verifyEndpoint = worldcoinVerifyUrl + "/" + targetAppId;

        log.info("🛡️ Verifying World ID proof with Worldcoin API: {} [Action: {}]", verifyEndpoint, targetAction);

        try {
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(Duration.ofMillis(3000));
            requestFactory.setReadTimeout(Duration.ofMillis(5000));

            RestClient restClient = RestClient.builder()
                    .requestFactory(requestFactory)
                    .build();

            Map<String, Object> body = Map.of(
                    "nullifier_hash", request.getNullifierHash(),
                    "merkle_root", request.getMerkleRoot() != null ? request.getMerkleRoot() : "",
                    "proof", request.getProof() != null ? request.getProof() : "",
                    "verification_level", request.getVerificationLevel() != null ? request.getVerificationLevel() : "orb",
                    "action", targetAction,
                    "signal", request.getSignal() != null ? request.getSignal() : ""
            );

            WorldVerificationApiResponse response = restClient.post()
                    .uri(verifyEndpoint)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(WorldVerificationApiResponse.class);

            if (response == null || !Boolean.TRUE.equals(response.getSuccess())) {
                String errorDetail = response != null ? response.getDetail() : "Empty response from World ID API";
                log.warn("❌ World ID Proof Verification Failed: {}", errorDetail);
                throw new InvalidWorldProofException("World ID proof verification failed: " + errorDetail);
            }

            log.info("✅ World ID Proof Verified successfully for: {}", maskHash(request.getNullifierHash()));

        } catch (InvalidWorldProofException e) {
            throw e;
        } catch (Exception e) {
            log.error("💥 External World ID API verification error: {}", e.getMessage());
            throw new InvalidWorldProofException("World ID verification service unavailable or proof invalid: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public AuthResponseDto loginLocalDevUser(String worldIdHashOrUsername) {
        if (!environment.acceptsProfiles(Profiles.of("dev", "test"))) {
            throw new InvalidWorldProofException("Local dev login is strictly disabled in production!");
        }

        String key = StringUtils.hasText(worldIdHashOrUsername) ? worldIdHashOrUsername : "nullifier_demo_01";
        UserEntity user = userRepository.findByWorldIdHash(key)
                .orElseGet(() -> userRepository.findFirstByOrderByCreatedAtAsc()
                        .orElseGet(() -> createNewWorldUser(key, "Local Adventurer")));

        String token = jwtTokenProvider.generateToken(
                user.getId(),
                user.getWorldIdHash(),
                user.getDisplayName(),
                "ROLE_USER"
        );

        UserProfileDto profile = userService.getProfile(user.getId());

        return AuthResponseDto.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(3600)
                .userId(user.getId())
                .worldIdHash(user.getWorldIdHash())
                .displayName(user.getDisplayName())
                .role("ROLE_USER")
                .profile(profile)
                .build();
    }

    private UserEntity createNewWorldUser(String worldIdHash, String displayName) {
        String name = StringUtils.hasText(displayName) ? displayName : "World Hero " + worldIdHash.substring(Math.max(0, worldIdHash.length() - 6));
        log.info("👤 Creating new World User [{}] with hash: {}", name, maskHash(worldIdHash));

        UserEntity newUser = UserEntity.builder()
                .worldIdHash(worldIdHash)
                .displayName(name)
                .gold(5000L)
                .gems(50)
                .enhanceStones(20)
                .standardSummonTickets(1)
                .piggyBankGems(0)
                .isGoldenPassActive(false)
                .loginDayIndex(0)
                .build();

        newUser = userRepository.save(newUser);

        // Initialize Onboarding state for Core v2
        onboardingStateRepository.save(com.worldhero.model.entity.OnboardingStateEntity.builder()
                .user(newUser)
                .step(com.worldhero.model.enums.OnboardingStep.WELCOME)
                .lifetimePulls(0)
                .knightSummoned(false)
                .rangerSummoned(false)
                .thirdSummonCompleted(false)
                .firstExpeditionClaimed(false)
                .build());

        log.info("⚔️ Initialized new World User with 1 Summon Ticket and Onboarding state: {}", newUser.getId());

        return newUser;
    }

    private String maskHash(String hash) {
        if (!StringUtils.hasText(hash) || hash.length() <= 8) return "****";
        return hash.substring(0, 4) + "..." + hash.substring(hash.length() - 4);
    }

    @Data
    public static class WorldVerificationApiResponse {
        private Boolean success;
        private String code;
        private String detail;
        private String attribute;
        @JsonProperty("nullifier_hash")
        private String nullifierHash;
    }
}
