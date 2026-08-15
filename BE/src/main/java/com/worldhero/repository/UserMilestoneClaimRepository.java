package com.worldhero.repository;

import com.worldhero.model.entity.UserMilestoneClaimEntity;
import com.worldhero.model.enums.QuestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserMilestoneClaimRepository extends JpaRepository<UserMilestoneClaimEntity, UUID> {
    List<UserMilestoneClaimEntity> findByUserIdAndQuestTypeAndPeriodKey(UUID userId, QuestType questType, String periodKey);
    Optional<UserMilestoneClaimEntity> findByUserIdAndQuestTypeAndPeriodKeyAndMilestoneIndex(UUID userId, QuestType questType, String periodKey, int milestoneIndex);
}
