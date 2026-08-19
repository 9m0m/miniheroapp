package com.worldhero.repository;

import com.worldhero.model.entity.TowerAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TowerAttemptRepository extends JpaRepository<TowerAttemptEntity, UUID> {
    Optional<TowerAttemptEntity> findByUserIdAndIdempotencyKey(UUID userId, String idempotencyKey);
    Optional<TowerAttemptEntity> findByIdAndUserId(UUID id, UUID userId);
    Optional<TowerAttemptEntity> findTopByUserIdAndIsAcknowledgedFalseOrderByCreatedAtDesc(UUID userId);
    List<TowerAttemptEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
