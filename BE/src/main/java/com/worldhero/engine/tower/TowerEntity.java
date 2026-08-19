package com.worldhero.engine.tower;

import com.worldhero.dto.CombatStatsDto;
import com.worldhero.model.enums.GridCol;
import com.worldhero.model.enums.GridRow;
import com.worldhero.model.enums.HeroRole;
import com.worldhero.model.enums.SkillPolicy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TowerEntity {
    private String entityId;
    private String templateId;
    private String passiveSkillId;
    private String name;
    private HeroRole role;
    private TowerSide side;
    // 3x3 Grid Coordinates
    @Builder.Default
    private GridRow gridRow = GridRow.FRONT;
    @Builder.Default
    private GridCol gridCol = GridCol.CENTER;

    // Tactical configuration
    @Builder.Default
    private SkillPolicy skillPolicy = SkillPolicy.AUTO;
    @Builder.Default
    private int energyPriority = 1; // 1 (highest) to 3 (lowest)

    private int level;
    private int stars;

    private CombatStatsDto baseStats;
    private CombatStatsDto effectiveStats;

    private int currentHp;
    private int maxHp;
    private int shield;
    private int evadeCharges;   // Bounded: deterministic max 1 charge
    private int regenStacks;    // Bounded: max 2 stacks (each 3%, total max 6% max HP)
    private boolean isDowned;

    @Builder.Default
    private List<TowerEffectState> activeEffects = new ArrayList<>();

    @Builder.Default
    private List<TowerSkill> skills = new ArrayList<>();

    public int getEffectiveSpeed() {
        int speed = effectiveStats != null ? effectiveStats.getSpeed() : (baseStats != null ? baseStats.getSpeed() : 100);
        return Math.max(60, Math.min(180, speed));
    }

    public boolean hasEvade() {
        return evadeCharges > 0;
    }

    public void consumeEvade() {
        if (evadeCharges > 0) {
            evadeCharges--;
        }
    }

    public void addEvade() {
        this.evadeCharges = 1;
    }

    public void applyShield(int amount) {
        if (isDowned || amount <= 0) return;
        this.shield += amount;
        if (this.activeEffects == null) {
            this.activeEffects = new ArrayList<>();
        }
        this.activeEffects.add(TowerEffectState.builder()
                .opcode(EffectOpcode.SHIELD)
                .value(amount)
                .appliedDelta(amount)
                .remainingShield(amount)
                .remainingDuration(2)
                .build());
    }

    public int takeDamage(int rawIncomingDamage) {
        if (isDowned || rawIncomingDamage <= 0) return 0;
        int remaining = rawIncomingDamage;

        // Layer-aware Shield consumption: FIFO from active SHIELD effects
        if (this.shield > 0 && activeEffects != null) {
            for (TowerEffectState eff : activeEffects) {
                if (eff.getOpcode() == EffectOpcode.SHIELD && eff.getRemainingShield() > 0) {
                    int absorb = Math.min(eff.getRemainingShield(), remaining);
                    eff.setRemainingShield(eff.getRemainingShield() - absorb);
                    remaining -= absorb;
                    if (remaining <= 0) break;
                }
            }
            int totalRemaining = 0;
            for (TowerEffectState eff : activeEffects) {
                if (eff.getOpcode() == EffectOpcode.SHIELD) {
                    totalRemaining += eff.getRemainingShield();
                }
            }
            this.shield = totalRemaining;
        }

        if (remaining > 0) {
            this.currentHp = Math.max(0, this.currentHp - remaining);
            if (this.currentHp == 0) {
                this.isDowned = true;
                this.shield = 0;
                this.evadeCharges = 0;
                this.regenStacks = 0;
            }
        }

        return rawIncomingDamage - remaining; // Damage absorbed by shield
    }

    public int applyHeal(int healAmount) {
        if (isDowned || healAmount <= 0) return 0;
        int before = this.currentHp;
        this.currentHp = Math.min(this.maxHp, this.currentHp + healAmount);
        return this.currentHp - before;
    }
}
