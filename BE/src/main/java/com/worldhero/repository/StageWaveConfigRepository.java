package com.worldhero.repository;

import com.worldhero.model.entity.StageWaveConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StageWaveConfigRepository extends JpaRepository<StageWaveConfigEntity, UUID> {
    List<StageWaveConfigEntity> findByWorldIndexAndStageIndexOrderByWaveNumberAsc(int worldIndex, int stageIndex);
    Optional<StageWaveConfigEntity> findByWorldIndexAndStageIndexAndWaveNumber(int worldIndex, int stageIndex, int waveNumber);
    void deleteByWorldIndexAndStageIndex(int worldIndex, int stageIndex);
}
