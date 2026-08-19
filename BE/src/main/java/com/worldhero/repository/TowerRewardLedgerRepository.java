package com.worldhero.repository;

import com.worldhero.model.entity.TowerRewardLedgerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TowerRewardLedgerRepository extends JpaRepository<TowerRewardLedgerEntity, UUID> {
    Optional<TowerRewardLedgerEntity> findByUserIdAndSeasonIdAndFloorNumber(UUID userId, String seasonId, int floorNumber);
    List<TowerRewardLedgerEntity> findByUserIdAndSeasonId(UUID userId, String seasonId);
}
