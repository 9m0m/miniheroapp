package com.worldhero.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "expedition_reward_ledgers", uniqueConstraints = {
    @UniqueConstraint(name = "uk_expedition_reward_idempotency", columnNames = {"user_id", "idempotency_key"})
}, indexes = {
    @Index(name = "idx_exp_reward_user_id", columnList = "user_id"),
    @Index(name = "idx_exp_reward_run_id", columnList = "expedition_run_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpeditionRewardLedgerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "expedition_run_id", nullable = false)
    private UUID expeditionRunId;

    @Column(name = "idempotency_key", nullable = false, length = 100)
    private String idempotencyKey;

    @Column(name = "claim_input_hash", nullable = false, length = 64)
    private String claimInputHash;

    @Column(name = "reward_payload_json", nullable = false, columnDefinition = "TEXT")
    private String rewardPayloadJson;

    @CreationTimestamp
    @Column(name = "claimed_at", nullable = false, updatable = false)
    private LocalDateTime claimedAt;
}
