package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestOverviewResponseDto {
    private List<QuestDto> dailyQuests;
    private List<QuestDto> weeklyQuests;
    private int dailyActivityPoints;
    private int weeklyActivityPoints;
    private List<MilestoneRewardDto> dailyMilestones; // 6 milestones
    private List<MilestoneRewardDto> weeklyMilestones; // 6 milestones
    private String dailyPeriodKey;
    private String weeklyPeriodKey;
}
