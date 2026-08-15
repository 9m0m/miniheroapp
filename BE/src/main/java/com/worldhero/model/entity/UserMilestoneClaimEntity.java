package com.worldhero.model.entity;

import com.worldhero.model.enums.QuestType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_milestone_claims", indexes = {
    @Index(name = "idx_milestone_claim_lookup", columnList = "user_id, questType, periodKey, milestoneIndex", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMilestoneClaimEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestType questType; // DAILY, WEEKLY

    @Column(nullable = false, length = 32)
    private String periodKey;

    @Column(nullable = false)
    private int milestoneIndex; // 1 to 6

    @Builder.Default
    @Column(nullable = false)
    private Instant claimedAt = Instant.now();
}
