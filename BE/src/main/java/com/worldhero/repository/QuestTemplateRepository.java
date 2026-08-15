package com.worldhero.repository;

import com.worldhero.model.entity.QuestTemplateEntity;
import com.worldhero.model.enums.QuestActionType;
import com.worldhero.model.enums.QuestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestTemplateRepository extends JpaRepository<QuestTemplateEntity, String> {
    List<QuestTemplateEntity> findByQuestTypeAndIsActiveTrueOrderBySortOrderAsc(QuestType questType);
    List<QuestTemplateEntity> findByIsActiveTrueOrderByQuestTypeAscSortOrderAsc();
    List<QuestTemplateEntity> findByActionTypeAndIsActiveTrue(QuestActionType actionType);
}
