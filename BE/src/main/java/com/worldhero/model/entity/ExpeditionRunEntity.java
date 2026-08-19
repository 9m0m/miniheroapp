package com.worldhero.model.entity;

import com.worldhero.model.enums.ExpeditionRunStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "expedition_runs", uniqueConstraints = {
    @UniqueConstraint(name = "uk_expedition_user_dispatch_idempotency", columnNames = {"user_id", "dispatch_idempotency_key"})
}, indexes = {
    @Index(name = "idx_expedition_user_slot", columnList = "user_id, slot_index"),
    @Index(name = "idx_expedition_user_status", columnList = "user_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpeditionRunEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "slot_index", nullable = false)
    @Builder.Default
    private int slotIndex = 0; // 0 = Free slot, 1 = Paid slot 1, 2 = Paid slot 2

    @Column(name = "is_tutorial", nullable = false)
    @Builder.Default
    private boolean isTutorial = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ExpeditionRunStatus status = ExpeditionRunStatus.RUNNING;

    @Column(name = "hero_ids_json", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String heroIdsJson = "[]"; // JSON array of Hero UUIDs (1-3 heroes)

    @Column(name = "reward_snapshot_json", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String rewardSnapshotJson = "{}"; // JSON snapshot of expected rewards

    @Column(name = "content_version", nullable = false, length = 50)
    @Builder.Default
    private String contentVersion = "expedition-v1";

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completes_at", nullable = false)
    private LocalDateTime completesAt;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "dispatch_idempotency_key", nullable = false, length = 100)
    private String dispatchIdempotencyKey;

    @Column(name = "dispatch_input_hash", nullable = false, length = 64)
    private String dispatchInputHash;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
