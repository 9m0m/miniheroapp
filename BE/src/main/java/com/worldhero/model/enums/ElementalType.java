package com.worldhero.model.enums;

public enum ElementalType {
    PHYSICAL("Vật Lý", "#B0BEC5"),
    FIRE("Hỏa (Lửa)", "#FF5722"),
    COLD("Băng (Lạnh)", "#00BCD4"),
    LIGHTNING("Lôi (Sét)", "#FFEB3B"),
    CHAOS("Hỗn Mang (Độc/Tối)", "#9C27B0");

    private final String displayName;
    private final String hexColor;

    ElementalType(String displayName, String hexColor) {
        this.displayName = displayName;
        this.hexColor = hexColor;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getHexColor() {
        return hexColor;
    }
}
