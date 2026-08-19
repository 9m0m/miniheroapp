package com.worldhero.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "tower_reward_ledger",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_tower_reward_user_floor", columnNames = {"user_id", "season_id", "floor_number"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TowerRewardLedgerEntity {

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

    @Column(name = "gold_reward", nullable = false)
    private int goldReward;

    @Column(name = "essence_reward", nullable = false)
    private int essenceReward;

    @Column(name = "stones_reward", nullable = false)
    private int stonesReward;

    @Column(name = "shards_reward", nullable = false)
    private int shardsReward;

    @CreationTimestamp
    @Column(name = "claimed_at", nullable = false, updatable = false)
    private LocalDateTime claimedAt;
}
