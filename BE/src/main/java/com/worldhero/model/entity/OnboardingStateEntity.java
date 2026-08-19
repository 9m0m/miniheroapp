package com.worldhero.model.entity;

import com.worldhero.model.enums.OnboardingStep;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "onboarding_states", uniqueConstraints = {
    @UniqueConstraint(name = "uk_onboarding_user", columnNames = {"user_id"})
}, indexes = {
    @Index(name = "idx_onboarding_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingStateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(name = "step", nullable = false, length = 40)
    @Builder.Default
    private OnboardingStep step = OnboardingStep.WELCOME;

    @Column(name = "lifetime_pulls", nullable = false)
    @Builder.Default
    private int lifetimePulls = 0;

    @Column(name = "knight_summoned", nullable = false)
    @Builder.Default
    private boolean knightSummoned = false;

    @Column(name = "ranger_summoned", nullable = false)
    @Builder.Default
    private boolean rangerSummoned = false;

    @Column(name = "third_summon_completed", nullable = false)
    @Builder.Default
    private boolean thirdSummonCompleted = false;

    @Column(name = "first_expedition_claimed", nullable = false)
    @Builder.Default
    private boolean firstExpeditionClaimed = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
