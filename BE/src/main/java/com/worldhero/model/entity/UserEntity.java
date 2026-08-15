package com.worldhero.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_world_id_hash", columnList = "world_id_hash", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "world_id_hash", unique = true, length = 255)
    private String worldIdHash;

    @Column(name = "display_name", nullable = false, length = 50)
    @Builder.Default
    private String displayName = "Hero Adventurer";

    // Currencies
    @Column(name = "gold", nullable = false)
    @Builder.Default
    private long gold = 5000L;

    @Column(name = "gems", nullable = false)
    @Builder.Default
    private int gems = 50;

    @Column(name = "enhance_stones", nullable = false)
    @Builder.Default
    private int enhanceStones = 20;

    // Stage & Wave Progression
    @Column(name = "current_world", nullable = false)
    @Builder.Default
    private int currentWorld = 1; // 1 to 4

    @Column(name = "current_stage", nullable = false)
    @Builder.Default
    private int currentStage = 1; // 1 to 10

    @Column(name = "current_wave", nullable = false)
    @Builder.Default
    private int currentWave = 1; // 1 to 30

    @Column(name = "max_cleared_stage", nullable = false)
    @Builder.Default
    private int maxClearedStage = 0;

    // Earning & Monetization Hooks (WLD)
    @Column(name = "piggy_bank_gems", nullable = false)
    @Builder.Default
    private int piggyBankGems = 0; // Cap: 1000 gems

    @Column(name = "is_golden_pass_active", nullable = false)
    @Builder.Default
    private boolean isGoldenPassActive = false;

    @Column(name = "login_day_index", nullable = false)
    @Builder.Default
    private int loginDayIndex = 0; // 0 to 6 (7 Days)

    @Column(name = "login_last_claimed_at")
    private LocalDateTime loginLastClaimedAt;

    @Column(name = "growth_fund_unlocked", nullable = false)
    @Builder.Default
    private boolean growthFundUnlocked = false;

    @Column(name = "growth_fund_claimed_stages", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String growthFundClaimedStages = "[]"; // JSON array of claimed stages e.g. [10, 20]

    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HeroEntity> heroes = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItemInstanceEntity> items = new ArrayList<>();

    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
