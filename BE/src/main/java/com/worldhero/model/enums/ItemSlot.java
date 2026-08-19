package com.worldhero.model.enums;

public enum ItemSlot {
    // 6 Class-Specific Gear Slots
    MAIN_HAND("Vũ Khí Chính", true),
    OFF_HAND("Vũ Khí Phụ / Khiên", true),
    HELMET("Mũ Giáp", true),
    ARMOR("Áo Giáp", true),
    PANTS("Quần Giáp", true),
    BOOTS("Giày Giáp", true),

    // 2 Universal Accessory Slots
    RING_1("Nhẫn", false),
    TALISMAN("Bùa Chú", false);

    private final String displayName;
    private final boolean classSpecific;

    ItemSlot(String displayName, boolean classSpecific) {
        this.displayName = displayName;
        this.classSpecific = classSpecific;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isClassSpecific() {
        return classSpecific;
    }

    public boolean isAccessory() {
        return !classSpecific;
    }
}
