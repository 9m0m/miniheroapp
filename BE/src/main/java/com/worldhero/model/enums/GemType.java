package com.worldhero.model.enums;

public enum GemType {
    RUBY("Hồng Ngọc (Ruby)", "Tăng physAtk / magicAtk phẳng", "physAtk"),
    EMERALD("Ngọc Lục Bảo (Emerald)", "Tăng critRate và critDmg", "critRate"),
    SAPPHIRE("Lam Ngọc (Sapphire)", "Tăng atkSpeed và cdr", "atkSpeed"),
    TOPAZ("Hoàng Ngọc (Topaz)", "Tăng lifeSteal và hpRegen", "lifeSteal"),
    DIAMOND("Kim Cương (Diamond)", "Tăng dmgReduction và Kháng 4 Hệ", "dmgReduction");

    private final String displayName;
    private final String description;
    private final String primaryStat;

    GemType(String displayName, String description, String primaryStat) {
        this.displayName = displayName;
        this.description = description;
        this.primaryStat = primaryStat;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public String getPrimaryStat() {
        return primaryStat;
    }
}
