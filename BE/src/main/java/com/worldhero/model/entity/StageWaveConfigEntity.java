package com.worldhero.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "stage_wave_configs", indexes = {
    @Index(name = "idx_stage_wave_lookup", columnList = "worldIndex, stageIndex, waveNumber")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StageWaveConfigEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private int worldIndex;

    @Column(nullable = false)
    private int stageIndex;

    @Column(nullable = false)
    private int waveNumber;

    @Column(nullable = false, length = 64)
    private String monsterId;

    @Builder.Default
    @Column(nullable = false)
    private int monsterCount = 5; // Support 3 to 15 monsters per wave

    @Builder.Default
    @Column(nullable = false)
    private double hpMultiplier = 1.0;

    @Builder.Default
    @Column(nullable = false)
    private double atkMultiplier = 1.0;

    @Builder.Default
    @Column(nullable = false)
    private double armorMultiplier = 1.0;

    @Column(length = 100)
    private String bossEnrageSkill;
}
