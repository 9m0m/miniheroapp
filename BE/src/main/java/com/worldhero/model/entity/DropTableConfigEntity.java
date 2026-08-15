package com.worldhero.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "drop_table_configs", indexes = {
    @Index(name = "idx_drop_table_lookup", columnList = "worldIndex, stageIndex", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DropTableConfigEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private int worldIndex;

    @Column(nullable = false)
    private int stageIndex;

    @Builder.Default
    @Column(nullable = false)
    private double chestDropChance = 0.03; // Normal 3%

    @Builder.Default
    @Column(nullable = false)
    private double bossChestDropChance = 0.25; // Boss wave 25%

    @Builder.Default
    @Column(nullable = false)
    private double stoneDropChance = 0.40; // 40% stone drop

    @Builder.Default
    @Column(nullable = false)
    private double goldMultiplier = 1.0;

    // Normal Chest Rarity Weights (sum to 1.0)
    @Builder.Default
    @Column
    private Double normalCommonWeight = 0.60;

    @Builder.Default
    @Column
    private Double normalUncommonWeight = 0.28;

    @Builder.Default
    @Column
    private Double normalRareWeight = 0.10;

    @Builder.Default
    @Column
    private Double normalEpicWeight = 0.02;

    @Builder.Default
    @Column
    private Double normalLegendaryWeight = 0.00;

    // Boss Chest Rarity Weights (sum to 1.0)
    @Builder.Default
    @Column
    private Double bossCommonWeight = 0.00;

    @Builder.Default
    @Column
    private Double bossUncommonWeight = 0.20;

    @Builder.Default
    @Column
    private Double bossRareWeight = 0.45;

    @Builder.Default
    @Column
    private Double bossEpicWeight = 0.30;

    @Builder.Default
    @Column
    private Double bossLegendaryWeight = 0.05;

    public double getNormalCommonWeight() { return normalCommonWeight != null ? normalCommonWeight : 0.60; }
    public double getNormalUncommonWeight() { return normalUncommonWeight != null ? normalUncommonWeight : 0.28; }
    public double getNormalRareWeight() { return normalRareWeight != null ? normalRareWeight : 0.10; }
    public double getNormalEpicWeight() { return normalEpicWeight != null ? normalEpicWeight : 0.02; }
    public double getNormalLegendaryWeight() { return normalLegendaryWeight != null ? normalLegendaryWeight : 0.00; }

    public double getBossCommonWeight() { return bossCommonWeight != null ? bossCommonWeight : 0.00; }
    public double getBossUncommonWeight() { return bossUncommonWeight != null ? bossUncommonWeight : 0.20; }
    public double getBossRareWeight() { return bossRareWeight != null ? bossRareWeight : 0.45; }
    public double getBossEpicWeight() { return bossEpicWeight != null ? bossEpicWeight : 0.30; }
    public double getBossLegendaryWeight() { return bossLegendaryWeight != null ? bossLegendaryWeight : 0.05; }
}
