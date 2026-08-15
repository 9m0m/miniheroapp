package com.worldhero.engine;

import com.worldhero.dto.StatsDto;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Thuần Toán Học Tính Toán Sát Thương & Phòng Thủ (Game Battle Math Engine).
 * Áp dụng mô hình Multiplicative Stacking & Asymptotic Diminishing Returns.
 */
@Component
public class DamageCalculator {

    public static final double ARMOR_CONSTANT_K = 500.0;
    public static final double MAX_DAMAGE_REDUCTION_CAP = 75.0;
    public static final double MAX_ELEMENTAL_RES_CAP = 75.0;

    /**
     * Tính sát thương 1 đòn đánh (Damage Per Hit - DPH)
     */
    public DamageResult calculateDamagePerHit(
            StatsDto attackerStats,
            double skillMultiplier,
            double targetArmor,
            double targetDmgReduction,
            double targetElementalRes
    ) {
        // 1. Tính Final ATK: (physAtk + magicAtk) * (1 + atkPercent / 100)
        double totalBaseAtk = attackerStats.getPhysAtk() + attackerStats.getMagicAtk();
        double finalAtk = totalBaseAtk * (1.0 + attackerStats.getAtkPercent() / 100.0);

        // 2. Hệ số Chí Mạng (Crit Layer)
        boolean isCrit = ThreadLocalRandom.current().nextDouble(0.0, 100.0) < attackerStats.getCritRate();
        double critMultiplier = isCrit ? (attackerStats.getCritDmg() / 100.0) : 1.0;

        // 3. Hệ số Nguyên Tố (Elemental Layer)
        double elemAdvantage = attackerStats.getElemDmgBonus() - targetElementalRes;
        double elemMultiplier = Math.max(0.1, 1.0 + (elemAdvantage / 100.0));

        // 4. Raw Damage trước khi trừ phòng thủ mục tiêu
        double rawDamage = finalAtk * skillMultiplier * critMultiplier * elemMultiplier;

        // 5. Tính sát thương giảm bởi Giáp (Asymptotic Armor: 1 - Armor / (Armor + 500))
        double armorReductionMultiplier = 1.0 - (targetArmor / (targetArmor + ARMOR_CONSTANT_K));

        // 6. Tính sát thương giảm bởi % DmgReduction (Hard Cap 75%)
        double effectiveDmgReduction = Math.min(targetDmgReduction, MAX_DAMAGE_REDUCTION_CAP);
        double dmgReductionMultiplier = 1.0 - (effectiveDmgReduction / 100.0);

        // 7. Sát thương thực tế mục tiêu phải nhận
        double finalDamageTaken = rawDamage * armorReductionMultiplier * dmgReductionMultiplier;
        finalDamageTaken = Math.max(1.0, Math.round(finalDamageTaken)); // Đảm bảo luôn gây ít nhất 1 damage

        return new DamageResult(
                finalDamageTaken,
                rawDamage,
                isCrit,
                critMultiplier,
                armorReductionMultiplier,
                dmgReductionMultiplier
        );
    }

    /**
     * Tính DPS trung bình lý thuyết để hiển thị lên bảng chỉ số UI
     */
    public double calculateTheoreticalDPS(StatsDto stats) {
        double totalBaseAtk = stats.getPhysAtk() + stats.getMagicAtk();
        double finalAtk = totalBaseAtk * (1.0 + stats.getAtkPercent() / 100.0);
        double avgCritMultiplier = 1.0 + (stats.getCritRate() / 100.0) * (stats.getCritDmg() / 100.0 - 1.0);
        double elemMultiplier = 1.0 + (stats.getElemDmgBonus() / 100.0);

        double avgDph = finalAtk * 1.0 * avgCritMultiplier * elemMultiplier;
        return Math.round(avgDph * stats.getAtkSpeed() * 10.0) / 10.0;
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
