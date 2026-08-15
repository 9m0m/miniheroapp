package com.worldhero.service;

import com.worldhero.dto.QuestOverviewResponseDto;
import com.worldhero.model.entity.QuestTemplateEntity;
import com.worldhero.model.enums.QuestActionType;
import com.worldhero.model.enums.QuestType;

import java.util.List;
import java.util.UUID;

public interface QuestService {
    QuestOverviewResponseDto getQuestOverview(UUID userId);
    QuestOverviewResponseDto claimQuestReward(UUID userId, String questId);
    QuestOverviewResponseDto claimMilestoneReward(UUID userId, QuestType questType, int milestoneIndex);
    void recordQuestAction(UUID userId, QuestActionType actionType, int amount);

    // Admin APIs
    List<QuestTemplateEntity> getAllQuestTemplates();
    QuestTemplateEntity createQuestTemplate(QuestTemplateEntity template);
    QuestTemplateEntity updateQuestTemplate(String id, QuestTemplateEntity template);
    void deleteQuestTemplate(String id);
}
