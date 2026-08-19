package com.worldhero.repository;

import com.worldhero.model.entity.SummonLedgerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SummonLedgerRepository extends JpaRepository<SummonLedgerEntity, UUID> {
    Optional<SummonLedgerEntity> findByUserIdAndIdempotencyKey(UUID userId, String idempotencyKey);
    List<SummonLedgerEntity> findByUserIdOrderByPulledAtDesc(UUID userId);
    int countByUserId(UUID userId);
}
