package com.worldhero.engine.tower;

import java.util.Random;

public class TowerCombatMath {

    public static final double ARMOR_CONSTANT_K = 400.0;
    public static final double MAX_ARMOR_REDUCTION = 0.60; // 60% hard cap
    public static final double MIN_SPEED = 60.0;
    public static final double MAX_SPEED = 180.0;
    public static final double MAX_CRIT_RATE = 50.0;      // 50% hard cap
    public static final double MIN_CRIT_DMG = 150.0;
    public static final double MAX_CRIT_DMG = 200.0;     // 200% hard cap
    public static final double MAX_REGEN_PER_ROUND_PCT = 0.06; // 6% Max HP cap
    public static final double MAX_DRAIN_PER_ACTION_PCT = 0.08; // 8% Max HP cap

    public static double calculateArmorReduction(int armor) {
        if (armor <= 0) return 0.0;
        double reduction = (double) armor / ((double) armor + ARMOR_CONSTANT_K);
        return Math.min(MAX_ARMOR_REDUCTION, reduction);
    }

    public static boolean rollCrit(double critRate, Random random) {
        double safeRate = Math.max(0.0, Math.min(MAX_CRIT_RATE, critRate));
        return (random.nextDouble() * 100.0) < safeRate;
    }

    public static int calculateDamage(int atk, double skillMultiplier, int targetArmor, boolean isCrit, double critDmg) {
        if (atk <= 0) return 1;
        double rawDmg = (double) atk * Math.max(0.1, skillMultiplier);
        double armorRed = calculateArmorReduction(targetArmor);
        double mitigatedDmg = rawDmg * (1.0 - armorRed);

        double finalDmg = mitigatedDmg;
        if (isCrit) {
            double effectiveCritDmg = Math.max(MIN_CRIT_DMG, Math.min(MAX_CRIT_DMG, critDmg));
            finalDmg = mitigatedDmg * (effectiveCritDmg / 100.0);
        }

        return Math.max(1, (int) Math.round(finalDmg));
    }

    public static int calculateDamage(int atk, double skillMultiplier, int targetArmor, double critRate, double critDmg, boolean isCrit) {
        return calculateDamage(atk, skillMultiplier, targetArmor, isCrit, critDmg);
    }

    public static int calculateHeal(int atk, double healMultiplier) {
        if (atk <= 0) return 0;
        return (int) Math.round((double) atk * Math.max(0.1, healMultiplier));
    }

    public static int calculateDrainHeal(int directDamageDealt, double drainPct, int attackerMaxHp) {
        if (directDamageDealt <= 0 || drainPct <= 0) return 0;
        int rawDrain = (int) Math.round((double) directDamageDealt * (drainPct / 100.0));
        int maxCap = (int) Math.round((double) attackerMaxHp * MAX_DRAIN_PER_ACTION_PCT);
        return Math.min(rawDrain, maxCap);
    }

    public static int calculateRegenTick(int maxHp, int stacks) {
        if (maxHp <= 0 || stacks <= 0) return 0;
        int safeStacks = Math.min(2, stacks);
        double totalPct = Math.min(MAX_REGEN_PER_ROUND_PCT, safeStacks * 0.03);
        return (int) Math.round((double) maxHp * totalPct);
    }

    public static int calculateBattleScore(TowerSide winner, int roundsUsed, double remainingHpPercent, int baseScore) {
        if (winner != TowerSide.PLAYER) return 0;
        int roundBonus = Math.max(0, (5 - roundsUsed) * 200);
        int hpBonus = (int) Math.round(remainingHpPercent * 10.0);
        return baseScore + roundBonus + hpBonus;
    }
}
