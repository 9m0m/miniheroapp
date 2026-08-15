package com.worldhero.model.entity;

import com.worldhero.model.enums.TrialType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "trial_records", indexes = {
    @Index(name = "idx_trial_leaderboard", columnList = "trialType, periodKey, score"),
    @Index(name = "idx_trial_user_lookup", columnList = "user_id, trialType, periodKey", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrialType trialType;

    @Column(nullable = false, length = 32)
    private String periodKey; // e.g. "2026-W33"

    @Column(nullable = false)
    private double score; // For DPS_30S: peak DPS or total damage (higher is better). For BOSS_SPEEDRUN: clear time in sec (lower is better).

    @Builder.Default
    @Column(nullable = false)
    private double dpsPeak = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private double totalDamage = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private double timeTakenSec = 30.0;

    @Column(columnDefinition = "TEXT")
    private String heroesSnapshotJson;

    @Builder.Default
    @Column(nullable = false)
    private boolean isBuildPublic = true;

    @Builder.Default
    @Column(nullable = false)
    private Instant recordedAt = Instant.now();
}
