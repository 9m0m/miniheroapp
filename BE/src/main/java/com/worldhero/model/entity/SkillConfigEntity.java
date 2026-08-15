package com.worldhero.model.entity;

import com.worldhero.model.enums.HeroClass;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skill_configs", indexes = {
    @Index(name = "idx_skill_class_lookup", columnList = "heroClass")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillConfigEntity {

    @Id
    @Column(length = 64)
    private String id; // e.g. "warrior_iron_wall"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private HeroClass heroClass;

    @Column(nullable = false, length = 64)
    private String skillId; // e.g. "iron_wall"

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 300)
    private String description;

    @Column(length = 32)
    private String icon;

    @Builder.Default
    @Column(nullable = false)
    private int maxLevel = 5;

    @Builder.Default
    @Column(nullable = false)
    private long baseGoldCost = 500L;

    @Builder.Default
    @Column(nullable = false)
    private long goldCostPerLevel = 500L;

    @Column(length = 200)
    private String bonusDescription;

    @Column(columnDefinition = "TEXT")
    private String statBonusesJson;
}
