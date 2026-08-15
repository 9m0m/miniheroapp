package com.worldhero.engine;

import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.ItemTemplateDto;
import com.worldhero.dto.StatsDto;
import com.worldhero.model.enums.GemType;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Thuật toán tính toán chỉ số thực tế của trang bị tại Runtime (Template-Instance Evaluator).
 * Cho phép Admin điều chỉnh Template mà không cần sửa DB người chơi.
 */
@Component
public class StatEvaluator {

    // Hệ số tăng chỉ số mỗi cấp cường hóa (+1 đến +15)
    public static final double ENHANCE_GROWTH_PER_LEVEL = 0.10; // +10% base stat per enhance level

    /**
     * Tính toán chỉ số thực tế của 1 món trang bị cụ thể
     */
    public StatsDto computeItemStats(ItemTemplateDto template, ItemInstanceDto instance) {
        if (template == null || instance == null) {
            return new StatsDto();
        }

        StatsDto base = template.getBaseStats();
        if (base == null) {
            base = new StatsDto();
        }

        // 1. Hệ số nhân theo Phẩm Cấp (Rarity Multiplier)
        double rarityMultiplier = instance.getRarity() != null ? instance.getRarity().getStatMultiplier() : 1.0;

        // 2. Hệ số nhân theo Cấp Vật Phẩm (iLvl Scaling)
        double iLvlMultiplier = 1.0 + (Math.max(1, instance.getItemLevel()) - 1) * template.getILvlScalingFactor();

        // 3. Hệ số Cường Hóa (+0 đến +15)
        double enhanceMultiplier = 1.0 + (instance.getEnhanceLevel() * ENHANCE_GROWTH_PER_LEVEL);

        double totalScale = rarityMultiplier * iLvlMultiplier * enhanceMultiplier;

        StatsDto result = StatsDto.builder()
                .physAtk(Math.round(base.getPhysAtk() * totalScale))
                .magicAtk(Math.round(base.getMagicAtk() * totalScale))
                .atkPercent(base.getAtkPercent())
                .atkSpeed(base.getAtkSpeed())
                .critRate(base.getCritRate())
                .critDmg(base.getCritDmg())
                .elemDmgBonus(base.getElemDmgBonus())
                .maxHp(Math.round(base.getMaxHp() * totalScale))
                .armor(Math.round(base.getArmor() * totalScale))
                .dmgReduction(base.getDmgReduction())
                .hpRegen(base.getHpRegen() * totalScale)
                .lifeSteal(base.getLifeSteal())
                .physDodge(base.getPhysDodge())
                .spellEvasion(base.getSpellEvasion())
                .fireRes(base.getFireRes())
                .coldRes(base.getColdRes())
                .lightningRes(base.getLightningRes())
                .chaosRes(base.getChaosRes())
                .cdr(base.getCdr())
                .goldBonus(base.getGoldBonus())
                .chestDropBonus(base.getChestDropBonus())
                .expBonus(base.getExpBonus())
                .build();

        // 4. Cộng Dòng Phụ (Sub-stats)
        if (instance.getSubStats() != null) {
            result.add(instance.getSubStats());
        }

        // 5. Cộng Ngọc Khảm (Gems Inlaid)
        if (instance.getSockets() != null) {
            for (String gemId : instance.getSockets()) {
                StatsDto gemStats = evaluateGemStats(gemId);
                result.add(gemStats);
            }
        }

        // 6. Cộng Giấy Chúc Phúc (Blessing Scroll)
        if (instance.getBlessingId() != null && !instance.getBlessingId().isBlank()) {
            StatsDto blessingStats = evaluateBlessingStats(instance.getBlessingId());
            result.add(blessingStats);
        }

        // 7. Chuẩn hóa các mốc Hard Caps
        result.clamp();
        return result;
    }

    /**
     * Tính chỉ số của từng loại ngọc theo Tier (RUBY_T1 -> RUBY_T5)
     */
    public StatsDto evaluateGemStats(String gemId) {
        if (gemId == null || !gemId.contains("_T")) return new StatsDto();

        String[] parts = gemId.split("_T");
        String gemTypeStr = parts[0];
        int tier = Integer.parseInt(parts[1]); // 1 to 5

        StatsDto gemStats = new StatsDto();
        try {
            GemType gemType = GemType.valueOf(gemTypeStr);
            switch (gemType) {
                case RUBY -> {
                    double flatAtk = tier * 15.0; // Tier 1: +15, Tier 5: +75 flat ATK
                    gemStats.setPhysAtk(flatAtk);
                    gemStats.setMagicAtk(flatAtk);
                }
                case EMERALD -> {
                    gemStats.setCritRate(tier * 2.0); // +2% to +10% Crit
                    gemStats.setCritDmg(tier * 10.0); // +10% to +50% Crit DMG
                }
                case SAPPHIRE -> {
                    gemStats.setAtkSpeed(tier * 0.05); // +0.05 to +0.25 ASPD
                    gemStats.setCdr(tier * 3.0);       // +3% to +15% CDR
                }
                case TOPAZ -> {
                    gemStats.setLifeSteal(tier * 1.5); // +1.5% to +7.5% Lifesteal
                    gemStats.setHpRegen(tier * 10.0);  // +10 to +50 HP/s
                }
                case DIAMOND -> {
                    gemStats.setDmgReduction(tier * 2.0); // +2% to +10% DmgReduction
                    gemStats.setFireRes(tier * 3.0);
                    gemStats.setColdRes(tier * 3.0);
                    gemStats.setLightningRes(tier * 3.0);
                    gemStats.setChaosRes(tier * 3.0);
                }
            }
        } catch (IllegalArgumentException ignored) {}

        return gemStats;
    }

    /**
     * Tính chỉ số của Giấy Chúc Phúc
     */
    public StatsDto evaluateBlessingStats(String blessingId) {
        StatsDto stats = new StatsDto();
        if ("SCROLL_OF_MIGHT".equalsIgnoreCase(blessingId)) {
            stats.setAtkPercent(10.0); // +10% Tổng Dame
        } else if ("SCROLL_OF_AEGIS".equalsIgnoreCase(blessingId)) {
            stats.setDmgReduction(5.0); // +5% DmgReduction
        } else if ("SCROLL_OF_FORTUNE".equalsIgnoreCase(blessingId)) {
            stats.setGoldBonus(20.0);
            stats.setChestDropBonus(10.0);
        }
        return stats;
    }

    /**
     * Tính tổng chỉ số cho toàn bộ Đội hình 3 Heroes (kết hợp trang bị của cả 3 tướng)
     */
    public StatsDto computeTotalPartyStats(List<StatsDto> heroStatsList) {
        StatsDto total = new StatsDto();
        if (heroStatsList != null) {
            for (StatsDto heroStats : heroStatsList) {
                total.add(heroStats);
            }
        }
        total.clamp();
        return total;
    }
}
