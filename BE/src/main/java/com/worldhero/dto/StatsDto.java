package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsDto {

    // 1. Nhóm Tấn Công (Offensive)
    @Builder.Default
    private double physAtk = 0.0;       // Sát thương vật lý
    @Builder.Default
    private double magicAtk = 0.0;      // Sát thương phép
    @Builder.Default
    private double atkPercent = 0.0;    // % Tăng tổng DMG
    @Builder.Default
    private double atkSpeed = 1.0;      // Tốc độ đánh (đòn/s)
    @Builder.Default
    private double critRate = 5.0;      // % Tỉ lệ chí mạng (cap 100%)
    @Builder.Default
    private double critDmg = 150.0;     // % Sát thương chí mạng (base 150%)
    @Builder.Default
    private double elemDmgBonus = 0.0;  // % Sát thương nguyên tố phẳng

    // 2. Nhóm Phòng Thủ & Sinh Tồn (Defensive)
    @Builder.Default
    private double maxHp = 100.0;       // Máu tối đa
    @Builder.Default
    private double armor = 0.0;         // Giáp (giảm % dmg vật lý asymptotic)
    @Builder.Default
    private double dmgReduction = 0.0;  // % Giảm toàn bộ sát thương (cap 75%)
    @Builder.Default
    private double hpRegen = 0.0;       // Máu hồi phục mỗi giây
    @Builder.Default
    private double lifeSteal = 0.0;     // % Hút máu theo sát thương
    @Builder.Default
    private double physDodge = 0.0;     // % Né đòn vật lý (cap 75%)
    @Builder.Default
    private double spellEvasion = 0.0;  // % Né đòn phép/AOE (cap 75%)

    // 3. Nhóm Kháng Nguyên Tố (Resistances)
    @Builder.Default
    private double fireRes = 0.0;       // % Kháng Lửa (cap 75%)
    @Builder.Default
    private double coldRes = 0.0;       // % Kháng Băng (cap 75%)
    @Builder.Default
    private double lightningRes = 0.0;  // % Kháng Sét (cap 75%)
    @Builder.Default
    private double chaosRes = 0.0;      // % Kháng Độc/Chaos (cap 75%)

    // 4. Nhóm Tiện Ích & Kinh Tế (Utility/Economy)
    @Builder.Default
    private double cdr = 0.0;           // % Giảm thời gian hồi chiêu (cap 50%)
    @Builder.Default
    private double goldBonus = 0.0;     // % Tăng lượng Gold nhặt được
    @Builder.Default
    private double chestDropBonus = 0.0;// % Tăng tỉ lệ rớt Rương
    @Builder.Default
    private double expBonus = 0.0;      // % Tăng EXP nhận được

    /**
     * Cộng dồn một tập hợp chỉ số khác vào chỉ số hiện tại (Additive Stacking).
     */
    public void add(StatsDto other) {
        if (other == null) return;
        this.physAtk += other.physAtk;
        this.magicAtk += other.magicAtk;
        this.atkPercent += other.atkPercent;
        this.atkSpeed += other.atkSpeed;
        this.critRate += other.critRate;
        this.critDmg += other.critDmg;
        this.elemDmgBonus += other.elemDmgBonus;

        this.maxHp += other.maxHp;
        this.armor += other.armor;
        this.dmgReduction += other.dmgReduction;
        this.hpRegen += other.hpRegen;
        this.lifeSteal += other.lifeSteal;
        this.physDodge += other.physDodge;
        this.spellEvasion += other.spellEvasion;

        this.fireRes += other.fireRes;
        this.coldRes += other.coldRes;
        this.lightningRes += other.lightningRes;
        this.chaosRes += other.chaosRes;

        this.cdr += other.cdr;
        this.goldBonus += other.goldBonus;
        this.chestDropBonus += other.chestDropBonus;
        this.expBonus += other.expBonus;
    }

    /**
     * Chuẩn hóa và áp dụng các mốc giới hạn cứng (Hard Caps).
     */
    public void clamp() {
        this.critRate = Math.clamp(this.critRate, 0.0, 100.0);
        this.critDmg = Math.max(100.0, this.critDmg);
        this.dmgReduction = Math.clamp(this.dmgReduction, 0.0, 75.0);
        this.physDodge = Math.clamp(this.physDodge, 0.0, 75.0);
        this.spellEvasion = Math.clamp(this.spellEvasion, 0.0, 75.0);
        this.fireRes = Math.clamp(this.fireRes, 0.0, 75.0);
        this.coldRes = Math.clamp(this.coldRes, 0.0, 75.0);
        this.lightningRes = Math.clamp(this.lightningRes, 0.0, 75.0);
        this.chaosRes = Math.clamp(this.chaosRes, 0.0, 75.0);
        this.cdr = Math.clamp(this.cdr, 0.0, 50.0);
        this.atkSpeed = Math.max(0.2, this.atkSpeed);
    }
}
