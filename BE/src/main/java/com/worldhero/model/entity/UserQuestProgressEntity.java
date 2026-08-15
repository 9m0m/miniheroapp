package com.worldhero.model.entity;

import com.worldhero.model.enums.QuestType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "user_quest_progress", indexes = {
    @Index(name = "idx_user_quest_lookup", columnList = "user_id, periodKey, quest_template_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuestProgressEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quest_template_id", nullable = false)
    private QuestTemplateEntity questTemplate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestType questType; // DAILY, WEEKLY

    @Column(nullable = false, length = 32)
    private String periodKey; // e.g. "2026-08-15" (daily) or "2026-W33" (weekly)

    @Builder.Default
    @Column(nullable = false)
    private int currentCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private boolean isCompleted = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean isClaimed = false;
}
