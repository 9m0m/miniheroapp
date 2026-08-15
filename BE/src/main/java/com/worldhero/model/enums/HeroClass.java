package com.worldhero.model.enums;

public enum HeroClass {
    WARRIOR("Đỡ Đòn / Đấu Sĩ", "Thu hút quái, Giáp to, Damage Reduction cao"),
    RANGER("Xạ Thủ / Sát Thủ", "Đánh siêu nhanh, Tỷ lệ Chí Mạng khủng, Né đòn vật lý"),
    MAGE("Pháp Sư / AOE", "Sát thương phép diện rộng, Né đòn phép"),
    PRIEST("Mục Sư / Hỗ Trợ", "Hồi máu % HP/giây, Tạo khiên thánh hộ mệnh, Giải debuff");

    private final String displayName;
    private final String description;

    HeroClass(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
