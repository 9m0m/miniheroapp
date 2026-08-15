package com.worldhero.model.enums;

public enum ItemSlot {
    // 6 Class-Specific Slots
    MAIN_HAND("Vũ Khí Chính", true),
    OFF_HAND("Vũ Khí Phụ / Khiên", true),
    HELMET("Mũ Giáp", true),
    ARMOR("Áo Giáp", true),
    PANTS("Quần Giáp", true),
    BOOTS("Giày Giáp", true),

    // 4 Universal Accessory Slots (Crafted at Blacksmith)
    RING_1("Nhẫn 1", false),
    RING_2("Nhẫn 2", false),
    NECKLACE("Dây Chuyền", false),
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
