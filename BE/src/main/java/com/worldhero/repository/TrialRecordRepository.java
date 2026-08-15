package com.worldhero.repository;

import com.worldhero.model.entity.TrialRecordEntity;
import com.worldhero.model.enums.TrialType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrialRecordRepository extends JpaRepository<TrialRecordEntity, UUID> {
    Optional<TrialRecordEntity> findByUserIdAndTrialTypeAndPeriodKey(UUID userId, TrialType trialType, String periodKey);
    List<TrialRecordEntity> findByTrialTypeAndPeriodKeyOrderByScoreDesc(TrialType trialType, String periodKey);
    List<TrialRecordEntity> findByTrialTypeAndPeriodKeyOrderByScoreAsc(TrialType trialType, String periodKey);
    List<TrialRecordEntity> findByPeriodKeyOrderByRecordedAtDesc(String periodKey);
}
