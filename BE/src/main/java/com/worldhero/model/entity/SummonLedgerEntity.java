package com.worldhero.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "summon_ledgers", uniqueConstraints = {
    @UniqueConstraint(name = "uk_summon_user_idempotency", columnNames = {"user_id", "idempotency_key"})
}, indexes = {
    @Index(name = "idx_summon_user_id", columnList = "user_id"),
    @Index(name = "idx_summon_user_pull_index", columnList = "user_id, pull_index")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SummonLedgerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "idempotency_key", nullable = false, length = 100)
    private String idempotencyKey;

    @Column(name = "input_hash", nullable = false, length = 64)
    private String inputHash;

    @Column(name = "banner_id", nullable = false, length = 50)
    private String bannerId;

    @Column(name = "ticket_type", nullable = false, length = 50)
    private String ticketType;

    @Column(name = "hero_template_id", nullable = false, length = 50)
    private String heroTemplateId;

    @Column(name = "is_duplicate", nullable = false)
    @Builder.Default
    private boolean isDuplicate = false;

    @Column(name = "shards_granted", nullable = false)
    @Builder.Default
    private int shardsGranted = 0;

    @Column(name = "pull_index", nullable = false)
    private int pullIndex;

    @CreationTimestamp
    @Column(name = "pulled_at", nullable = false, updatable = false)
    private LocalDateTime pulledAt;
}
