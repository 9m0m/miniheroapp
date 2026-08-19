package com.worldhero.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Persisted idempotency ledger for economy mutations: level-up, star-up, enhance, transfer, salvage.
 *
 * Contract:
 * - (user_id, operation_type, operation_key) is UNIQUE.
 * - Callers generate a stable operationKey (e.g. client UUID or content hash) per logical request.
 * - Before executing a mutation, the service checks this table under the user PESSIMISTIC_WRITE lock.
 * - If a row already exists, the service returns the stored responseJson without repeating the mutation.
 * - If not, the mutation is executed and the result is persisted here atomically in the same transaction.
 */
@Entity
@Table(
    name = "resource_mutation_ledger",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_rml_user_type_key",
            columnNames = {"user_id", "operation_type", "operation_key"}
        )
    },
    indexes = {
        @Index(name = "idx_rml_user_type_key", columnList = "user_id, operation_type, operation_key")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceMutationLedgerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /**
     * One of: LEVEL_UP, STAR_UP, ENHANCE, TRANSFER, SALVAGE.
     */
    @Column(name = "operation_type", nullable = false, length = 30)
    private String operationType;

    /**
     * Stable client-supplied key (UUID or deterministic hash) that uniquely identifies this logical request.
     */
    @Column(name = "operation_key", nullable = false, length = 100)
    private String operationKey;

    /**
     * SHA-256 hex digest of the canonical input parameters (operation type + all target identifiers/values).
     * A key reused with a different inputHash is rejected with HTTP 409 to prevent stale-response confusion.
     */
    @Column(name = "input_hash", nullable = false, length = 64)
    private String inputHash;

    /**
     * JSON-serialised committed response body, stored verbatim for idempotent replay.
     */
    @Column(name = "response_json", nullable = false, columnDefinition = "TEXT")
    private String responseJson;

    @CreationTimestamp
    @Column(name = "committed_at", nullable = false, updatable = false)
    private LocalDateTime committedAt;
}
