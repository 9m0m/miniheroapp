package com.worldhero.model.entity;

import com.worldhero.engine.tower.TowerSide;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "tower_attempts",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_attempt_idempotency", columnNames = {"user_id", "idempotency_key"})
    },
    indexes = {
        @Index(name = "idx_tower_attempt_user", columnList = "user_id"),
        @Index(name = "idx_tower_attempt_floor", columnList = "floor_number"),
        @Index(name = "idx_tower_attempt_idempotency", columnList = "user_id, idempotency_key")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TowerAttemptEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "season_id", nullable = false, length = 50)
    private String seasonId;

    @Column(name = "floor_number", nullable = false)
    private int floorNumber;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @Column(name = "seed", nullable = false)
    private long seed;

    @Column(name = "catalog_version", length = 30)
    @Builder.Default
    private String catalogVersion = "hero-v1";

    @Column(name = "balance_version", length = 30)
    @Builder.Default
    private String balanceVersion = "tower-v1";

    @Enumerated(EnumType.STRING)
    @Column(name = "winner", nullable = false, length = 20)
    private TowerSide winner;

    @Column(name = "rounds_used", nullable = false)
    private int roundsUsed;

    @Column(name = "remaining_hp_pct", nullable = false)
    private double remainingHpPercent;

    @Column(name = "score", nullable = false)
    private int score;

    @Column(name = "party_snapshot_json", columnDefinition = "TEXT")
    private String partySnapshotJson;

    @Column(name = "combatants_snapshot_json", columnDefinition = "TEXT")
    private String combatantsSnapshotJson;

    @Column(name = "replay_events_json", columnDefinition = "TEXT")
    private String replayEventsJson;

    @Column(name = "is_first_clear", nullable = false)
    @Builder.Default
    private boolean isFirstClear = false;

    @Column(name = "rewards_granted_json", columnDefinition = "TEXT")
    private String rewardsGrantedJson;

    @Column(name = "input_hash", length = 64)
    private String inputHash;

    @Column(name = "is_acknowledged", nullable = false)
    @Builder.Default
    private boolean isAcknowledged = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
