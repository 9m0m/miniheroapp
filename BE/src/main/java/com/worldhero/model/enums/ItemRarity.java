package com.worldhero.model.enums;

public enum ItemRarity {
    COMMON("Phổ Thông", "#9E9E9E", 0, 0, 1.0),
    UNCOMMON("Đặc Biệt", "#4CAF50", 1, 0, 1.25),
    RARE("Hiếm", "#2196F3", 2, 1, 1.6),
    EPIC("Sử Thi", "#9C27B0", 3, 2, 2.1),
    LEGENDARY("Huyền Thoại", "#FF9800", 4, 3, 3.0);

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
            case LEGENDARY -> null;
        };
    }
}
