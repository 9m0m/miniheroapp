package com.worldhero.dto;

import com.worldhero.model.enums.GridCol;
import com.worldhero.model.enums.GridRow;
import com.worldhero.model.enums.HeroRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TowerFloorDto {
    private int floorNumber;
    private String name;
    private String description;
    private boolean isBoss;
    private int recommendedLevel;
    private int recommendedPower;
    private int baseScore;
    
    private List<BotPreviewDto> botTrio;
    private List<String> modifiers;
    
    private RewardPreviewDto firstClearReward;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BotPreviewDto {
        private String templateId;
        private String name;
        private HeroRole role;
        private GridRow row;
        private GridCol col;
        private int level;
        private int speed;
        private int maxHp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RewardPreviewDto {
        private int gold;
        private int essence;
        private int stones;
        private int shards;
    }
}
