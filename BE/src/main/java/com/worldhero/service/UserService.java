package com.worldhero.service;

import com.worldhero.dto.UserProfileDto;
import com.worldhero.model.entity.UserEntity;

import java.util.UUID;

public interface UserService {
    UserProfileDto getProfile(UUID userId);
    UserProfileDto getOrCreateDefaultUser();
    UserEntity getUserOrThrow(UUID userId);
}
