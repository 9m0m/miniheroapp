package com.worldhero.engine.tower;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TowerReplayEvent {
    public enum EventType {
        ROUND_START,
        ACTION_START,
        SKILL_USE,
        DAMAGE_APPLIED,
        HEAL_APPLIED,
        EFFECT_APPLIED,
        EFFECT_EXPIRED,
        ENTITY_DOWN,
        ROUND_END,
        BATTLE_END
    }

    private int sequenceNumber;
    private int round;
    private EventType eventType;
    private String sourceEntityId;
    private String targetEntityId;
    private String skillId;
    private String skillName;
    private int amount;          // Damage dealt or healed
    private boolean isCrit;
    private boolean isEvaded;
    private int targetRemainingHp;
    private int targetMaxHp;
    private int targetShield;
    private String effectOpcode;
    private Map<String, Object> details;
}
