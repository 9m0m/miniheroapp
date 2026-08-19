package com.worldhero.engine.tower;

import com.worldhero.model.enums.TargetRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TowerEffectState {
    private EffectOpcode opcode;
    private double value;
    private int remainingDuration; // Rounds
    private int maxStacks;
    private int currentStacks;
    private String sourceEntityId;
    private TargetRule targetRule;
    private boolean isUnavoidable;
    private double appliedDelta;
    private int remainingShield;
}
