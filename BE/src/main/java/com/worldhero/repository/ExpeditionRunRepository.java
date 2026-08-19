package com.worldhero.repository;

import com.worldhero.model.entity.ExpeditionRunEntity;
import com.worldhero.model.enums.ExpeditionRunStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpeditionRunRepository extends JpaRepository<ExpeditionRunEntity, UUID> {
    List<ExpeditionRunEntity> findByUserId(UUID userId);
    List<ExpeditionRunEntity> findByUserIdAndStatus(UUID userId, ExpeditionRunStatus status);
    Optional<ExpeditionRunEntity> findByUserIdAndSlotIndexAndStatus(UUID userId, int slotIndex, ExpeditionRunStatus status);
    Optional<ExpeditionRunEntity> findByIdAndUserId(UUID id, UUID userId);
    Optional<ExpeditionRunEntity> findByUserIdAndDispatchIdempotencyKey(UUID userId, String dispatchIdempotencyKey);
}
