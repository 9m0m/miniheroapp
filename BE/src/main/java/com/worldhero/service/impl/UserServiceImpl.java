package com.worldhero.service.impl;

import com.worldhero.dto.UserProfileDto;
import com.worldhero.exception.ResourceNotFoundException;
import com.worldhero.model.entity.UserEntity;
import com.worldhero.repository.UserRepository;
import com.worldhero.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getProfile(UUID userId) {
        UserEntity user = getUserOrThrow(userId);
        return mapToDto(user);
    }

    @Override
    @Transactional
    public UserProfileDto getOrCreateDefaultUser() {
        UserEntity user = userRepository.findFirstByOrderByCreatedAtAsc()
                .orElseGet(() -> {
                    log.info("👤 Creating default adventurer demo user...");
                    UserEntity newUser = UserEntity.builder()
                            .worldIdHash("nullifier_demo_01")
                            .displayName("Hero Adventurer")
                            .gold(5000L)
                            .gems(50)
                            .enhanceStones(20)
                            .build();
                    return userRepository.save(newUser);
                });

        return mapToDto(user);
    }

    @Override
    public UserEntity getUserOrThrow(UUID userId) {
        if (userId == null) {
            return userRepository.findFirstByOrderByCreatedAtAsc()
                    .orElseThrow(() -> new ResourceNotFoundException("No default user found in database."));
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private UserProfileDto mapToDto(UserEntity user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .worldIdHash(user.getWorldIdHash())
                .displayName(user.getDisplayName())
                .gold(user.getGold())
                .essence(user.getEssence())
                .gems(user.getGems())
                .enhanceStones(user.getEnhanceStones())
                .inventorySlots(user.getInventorySlots())
                .piggyBankGems(user.getPiggyBankGems())
                .isGoldenPassActive(user.isGoldenPassActive())
                .loginDayIndex(user.getLoginDayIndex())
                .loginLastClaimedAt(user.getLoginLastClaimedAt())
                .build();
    }
}
