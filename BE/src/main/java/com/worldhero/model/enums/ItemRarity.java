package com.worldhero.model.enums;

public enum ItemRarity {
    COMMON("Phổ Thông", "#94A3B8", 0, 0, 1.0),
    UNCOMMON("Đặc Biệt", "#34D399", 1, 0, 1.25),
    RARE("Hiếm", "#38BDF8", 2, 1, 1.6),
    EPIC("Sử Thi", "#C084FC", 3, 2, 2.1),
    LEGENDARY("Huyền Thoại", "#F59E0B", 4, 3, 3.0),
    MYTHIC("Thần Thoại", "#F43F5E", 5, 3, 4.2),
    ANCIENT("Cổ Đại", "#EC4899", 6, 3, 6.0);

    private final String displayName;
    private final String hexColor;
    private final int subStatCount;
    private final int maxSockets;
    private final double statMultiplier;

    ItemRarity(String displayName, String hexColor, int subStatCount, int maxSockets, double statMultiplier) {
        this.displayName = displayName;
        this.hexColor = hexColor;
        this.subStatCount = subStatCount;
        this.maxSockets = maxSockets;
        this.statMultiplier = statMultiplier;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getHexColor() {
        return hexColor;
    }

    public int getSubStatCount() {
        return subStatCount;
    }

    public int getMaxSockets() {
        return maxSockets;
    }

    public double getStatMultiplier() {
        return statMultiplier;
    }

    public ItemRarity getNextTier() {
        return switch (this) {
            case COMMON -> UNCOMMON;
            case UNCOMMON -> RARE;
            case RARE -> EPIC;
            case EPIC -> LEGENDARY;
            case LEGENDARY -> MYTHIC;
            case MYTHIC -> ANCIENT;
            case ANCIENT -> null;
        };
    }
}
