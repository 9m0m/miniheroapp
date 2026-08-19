package com.worldhero.engine;

import com.worldhero.dto.StatsDto;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Thuần Toán Học Tính Toán Sát Thương & Phòng Thủ (Game Battle Math Engine).
 * Áp dụng mô hình Multiplicative Stacking & Asymptotic Diminishing Returns theo GDD v2.5.
 */
@Component
public class DamageCalculator {

    public static final double ARMOR_CONSTANT_K = 400.0;
    public static final double MAX_DAMAGE_REDUCTION_CAP = 75.0;
    public static final double MAX_ELEMENTAL_RES_CAP = 75.0;

    /**
     * Tính sát thương 1 đòn đánh với tỷ lệ Crit ngẫu nhiên (DPH)
     */
    public DamageResult calculateDamagePerHit(
            StatsDto attackerStats,
            double skillMultiplier,
            double targetArmor,
            double targetDmgReduction,
            double targetElementalRes
    ) {
        double critRate = attackerStats != null ? Math.min(100.0, Math.max(0.0, attackerStats.getCritRate())) : 0.0;
        boolean isCrit = ThreadLocalRandom.current().nextDouble(0.0, 100.0) < critRate;
        return calculateDamagePerHitDeterministic(attackerStats, skillMultiplier, targetArmor, targetDmgReduction, targetElementalRes, isCrit);
    }

    /**
     * Tính sát thương 1 đòn đánh xác định (Deterministic) dùng cho Golden Vectors, Simulator và Server-Verification
     */
    public DamageResult calculateDamagePerHitDeterministic(
            StatsDto attackerStats,
            double skillMultiplier,
            double targetArmor,
            double targetDmgReduction,
            double targetElementalRes,
            boolean isCrit
    ) {
        if (attackerStats == null) {
            attackerStats = StatsDto.builder().build();
        }

        // 1. Final ATK: (physAtk + magicAtk) * (1 + atkPercent / 100)
        double totalBaseAtk = Math.max(0.0, attackerStats.getPhysAtk() + attackerStats.getMagicAtk());
        double atkBonusPct = Math.max(-90.0, attackerStats.getAtkPercent());
        double finalAtk = totalBaseAtk * (1.0 + atkBonusPct / 100.0);

        // 2. Hệ số Kỹ Năng
        double safeSkillMult = Math.max(0.0, skillMultiplier <= 0 ? 1.0 : skillMultiplier);

        // 3. Hệ số Chí Mạng (Crit Layer: 1.0 + critDmg / 100.0, base 50% -> 1.5x)
        double critBonusPct = Math.max(0.0, attackerStats.getCritDmg());
        double critMultiplier = isCrit ? (1.0 + critBonusPct / 100.0) : 1.0;

        // 4. Hệ số Nguyên Tố (Elemental Layer: (1 + elemBonus) * (1 - elemRes))
        double elemBonusPct = Math.max(0.0, attackerStats.getElemDmgBonus());
        double safeElemRes = Math.min(MAX_ELEMENTAL_RES_CAP, Math.max(0.0, targetElementalRes));
        double elemMultiplier = (1.0 + elemBonusPct / 100.0) * (1.0 - safeElemRes / 100.0);

        // 5. Raw Damage trước khi trừ phòng thủ
        double rawDamage = finalAtk * safeSkillMult * critMultiplier * elemMultiplier;

        // 6. Asymptotic Armor Reduction: Armor / (Armor + 400)
        double safeArmor = Math.max(0.0, targetArmor);
        double armorReductionMultiplier = 1.0 - (safeArmor / (safeArmor + ARMOR_CONSTANT_K));
        double armorReductionPercent = (1.0 - armorReductionMultiplier) * 100.0;

        // 7. General Damage Reduction (Cap 75%)
        double effectiveDmgReduction = Math.min(MAX_DAMAGE_REDUCTION_CAP, Math.max(0.0, targetDmgReduction));
        double dmgReductionMultiplier = 1.0 - (effectiveDmgReduction / 100.0);
        double generalReductionPercent = effectiveDmgReduction;

        // 8. Sát thương thực tế mục tiêu phải nhận
        double finalDamageTaken = rawDamage * armorReductionMultiplier * dmgReductionMultiplier;
        finalDamageTaken = Math.max(1.0, Math.round(finalDamageTaken)); // Luôn gây ít nhất 1 damage

        return new DamageResult(
                finalDamageTaken,
                rawDamage,
                isCrit,
                critMultiplier,
                armorReductionPercent,
                generalReductionPercent
        );
    }

    /**
     * Tính DPS trung bình lý thuyết để hiển thị lên bảng chỉ số UI
     */
    public double calculateTheoreticalDPS(StatsDto stats) {
        if (stats == null) return 0.0;

        double totalBaseAtk = Math.max(0.0, stats.getPhysAtk() + stats.getMagicAtk());
        double atkBonusPct = Math.max(-90.0, stats.getAtkPercent());
        double finalAtk = totalBaseAtk * (1.0 + atkBonusPct / 100.0);

        double critRate = Math.min(100.0, Math.max(0.0, stats.getCritRate())) / 100.0;
        double critBonusPct = Math.max(0.0, stats.getCritDmg()) / 100.0;
        double avgCritMultiplier = 1.0 + critRate * critBonusPct;

        double elemMultiplier = 1.0 + Math.max(0.0, stats.getElemDmgBonus()) / 100.0;

        double avgDph = finalAtk * avgCritMultiplier * elemMultiplier;
        double atkSpeed = Math.max(0.1, stats.getAtkSpeed());

        return Math.round(avgDph * atkSpeed * 10.0) / 10.0;
    }

    public record DamageResult(
            double finalDamage,
            double rawDamage,
            boolean isCrit,
            double critMultiplier,
            double armorReductionPercent,
            double generalReductionPercent
    ) {}
}
