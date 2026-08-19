package com.worldhero.repository;

import com.worldhero.model.entity.TowerProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TowerProgressRepository extends JpaRepository<TowerProgressEntity, UUID> {
    Optional<TowerProgressEntity> findByUserIdAndSeasonId(UUID userId, String seasonId);
    Optional<TowerProgressEntity> findByUserId(UUID userId);
    List<TowerProgressEntity> findTop50BySeasonIdOrderByHighestFloorClearedDescBestScoreDesc(String seasonId);
}
