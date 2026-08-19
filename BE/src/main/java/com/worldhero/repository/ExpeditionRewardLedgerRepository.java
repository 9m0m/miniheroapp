package com.worldhero.repository;

import com.worldhero.model.entity.ExpeditionRewardLedgerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpeditionRewardLedgerRepository extends JpaRepository<ExpeditionRewardLedgerEntity, UUID> {
    Optional<ExpeditionRewardLedgerEntity> findByUserIdAndIdempotencyKey(UUID userId, String idempotencyKey);
    Optional<ExpeditionRewardLedgerEntity> findByExpeditionRunId(UUID expeditionRunId);
}
