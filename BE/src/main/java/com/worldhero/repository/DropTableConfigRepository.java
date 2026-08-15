package com.worldhero.repository;

import com.worldhero.model.entity.DropTableConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DropTableConfigRepository extends JpaRepository<DropTableConfigEntity, UUID> {
    Optional<DropTableConfigEntity> findByWorldIndexAndStageIndex(int worldIndex, int stageIndex);
}
