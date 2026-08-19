package com.worldhero.model.entity;

import com.worldhero.model.enums.TeamTactic;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "tower_parties",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_tower_user_party", columnNames = {"user_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TowerPartyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    // 3x3 Grid placement JSON: [{"heroId": "...", "row": "FRONT", "col": "CENTER"}, ...]
    @Column(name = "grid_slots_json", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String gridSlotsJson = "[]";

    // Pre-battle Team Tactic
    @Enumerated(EnumType.STRING)
    @Column(name = "tactic", nullable = false, length = 30)
    @Builder.Default
    private TeamTactic tactic = TeamTactic.BALANCED;

    // Per-hero Skill Policies JSON: {"heroUuid": "AUTO|SAVE|AGGRESSIVE|DEFENSIVE"}
    @Column(name = "hero_policies_json", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String heroPoliciesJson = "{}";

    // Energy Priority List JSON: ["heroUuid1", "heroUuid2", "heroUuid3"]
    @Column(name = "energy_priority_json", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String energyPriorityJson = "[]";

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
