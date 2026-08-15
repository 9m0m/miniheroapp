package com.worldhero.model.entity;

import com.worldhero.model.enums.HeroClass;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "heroes", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_hero_class", columnNames = {"user_id", "hero_class"})
}, indexes = {
    @Index(name = "idx_hero_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeroEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(name = "hero_class", nullable = false, length = 30)
    private HeroClass heroClass;

    @Column(name = "level", nullable = false)
    @Builder.Default
    private int level = 1;

    @Column(name = "exp", nullable = false)
    @Builder.Default
    private int exp = 0;

    @Column(name = "is_in_party", nullable = false)
    @Builder.Default
    private boolean isInParty = false;

    @Column(name = "slot_index", nullable = false)
    @Builder.Default
    private int slotIndex = -1; // 0, 1, 2 = vị trí đội hình; -1 = benched

    @Column(name = "skills", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String skills = "{}"; // JSON map: {"iron_wall": 2, "berserk_strike": 1}

    @OneToMany(mappedBy = "hero", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @Builder.Default
    private List<ItemInstanceEntity> equippedItems = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
