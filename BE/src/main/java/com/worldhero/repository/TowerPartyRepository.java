package com.worldhero.repository;

import com.worldhero.model.entity.TowerPartyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TowerPartyRepository extends JpaRepository<TowerPartyEntity, UUID> {
    Optional<TowerPartyEntity> findByUserId(UUID userId);
}
