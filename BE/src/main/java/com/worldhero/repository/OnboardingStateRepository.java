package com.worldhero.repository;

import com.worldhero.model.entity.OnboardingStateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OnboardingStateRepository extends JpaRepository<OnboardingStateEntity, UUID> {
    Optional<OnboardingStateEntity> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
}
