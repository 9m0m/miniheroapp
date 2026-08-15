package com.worldhero.dto;

import com.worldhero.model.enums.QuestActionType;
import com.worldhero.model.enums.QuestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestDto {
    private String id;
    private String title;
    private String description;
    private String icon;
    private QuestType questType;
    private QuestActionType actionType;
    private int targetCount;
    private int currentCount;
    private int activityPoints;
    private long goldReward;
    private int gemsReward;
    private int stonesReward;
    private String itemTemplateId;
    private boolean isCompleted;
    private boolean isClaimed;
}
