package com.worldhero.model.entity;

import com.worldhero.model.enums.QuestActionType;
import com.worldhero.model.enums.QuestType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quest_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestTemplateEntity {

    @Id
    private String id; // e.g. "daily_kill_mobs", "weekly_boss_slayer"

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(nullable = false)
    private String icon = "⚔️";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestType questType; // DAILY, WEEKLY

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestActionType actionType;

    @Builder.Default
    @Column(nullable = false)
    private int targetCount = 1;

    @Builder.Default
    @Column(nullable = false)
    private int activityPoints = 20;

    @Builder.Default
    @Column(nullable = false)
    private long goldReward = 0;

    @Builder.Default
    @Column(nullable = false)
    private int gemsReward = 0;

    @Builder.Default
    @Column(nullable = false)
    private int stonesReward = 0;

    @Column(name = "item_template_id")
    private String itemTemplateId;

    @Builder.Default
    @Column(nullable = false)
    private boolean isActive = true;

    @Builder.Default
    @Column(nullable = false)
    private int sortOrder = 0;
}
