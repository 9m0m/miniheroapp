package com.worldhero.repository;

import com.worldhero.model.entity.UserQuestProgressEntity;
import com.worldhero.model.enums.QuestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserQuestProgressRepository extends JpaRepository<UserQuestProgressEntity, UUID> {
    List<UserQuestProgressEntity> findByUserIdAndPeriodKey(UUID userId, String periodKey);
    List<UserQuestProgressEntity> findByUserIdAndQuestTypeAndPeriodKey(UUID userId, QuestType questType, String periodKey);
    Optional<UserQuestProgressEntity> findByUserIdAndQuestTemplateIdAndPeriodKey(UUID userId, String questTemplateId, String periodKey);
}
