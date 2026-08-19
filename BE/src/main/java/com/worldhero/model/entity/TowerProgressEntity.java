package com.worldhero.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "tower_progress",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_tower_user_season", columnNames = {"user_id", "season_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TowerProgressEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "season_id", nullable = false, length = 50)
    @Builder.Default
    private String seasonId = "season-1";

    @Column(name = "current_floor", nullable = false)
    @Builder.Default
    private int currentFloor = 1;

    @Column(name = "highest_floor_cleared", nullable = false)
    @Builder.Default
    private int highestFloorCleared = 0;

    @Column(name = "best_score", nullable = false)
    @Builder.Default
    private int bestScore = 0;

    @Column(name = "total_attempts", nullable = false)
    @Builder.Default
    private int totalAttempts = 0;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
