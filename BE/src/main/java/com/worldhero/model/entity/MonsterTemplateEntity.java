package com.worldhero.model.entity;

import com.worldhero.model.enums.ElementalType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "monster_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonsterTemplateEntity {
    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ElementalType elementalType;

    @Builder.Default
    private Double baseHp = 200.0;

    @Builder.Default
    private Double baseAtk = 15.0;

    @Builder.Default
    private Double baseArmor = 20.0;

    @Builder.Default
    private Double attackSpeed = 1.0;

    @Column(length = 32)
    private String iconKey;

    @Builder.Default
    private Boolean isBoss = false;

    @Builder.Default
    private Long goldReward = 20L;
}
