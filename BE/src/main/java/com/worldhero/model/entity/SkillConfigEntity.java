package com.worldhero.model.entity;

import com.worldhero.model.enums.HeroClass;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wh_skill_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillConfigEntity {

    @Id
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HeroClass heroClass;

    @Column(nullable = false)
    private String skillId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon;

    @Column(nullable = false)
    @Builder.Default
    private int maxLevel = 5;

    @Column(nullable = false)
    @Builder.Default
    private long baseGoldCost = 500L;

    @Column(nullable = false)
    @Builder.Default
    private long goldCostPerLevel = 500L;

    private String bonusDescription;

    @Column(columnDefinition = "TEXT")
    private String statBonusesJson;
}
