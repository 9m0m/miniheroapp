package com.worldhero.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "payment_transactions",
    indexes = {
        @Index(name = "idx_payment_reference", columnList = "reference", unique = true),
        @Index(name = "idx_payment_tx_id", columnList = "transaction_id", unique = true),
        @Index(name = "idx_payment_user_id", columnList = "user_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "reference", nullable = false, unique = true, length = 100)
    private String reference;

    @Column(name = "transaction_id", unique = true, length = 255)
    private String transactionId;

    @Column(name = "feature_key", nullable = false, length = 50)
    private String featureKey;

    @Column(name = "amount_wld", nullable = false, precision = 18, scale = 6)
    private BigDecimal amountWld;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "COMPLETED";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
