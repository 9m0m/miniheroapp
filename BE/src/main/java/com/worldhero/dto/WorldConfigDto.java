package com.worldhero.dto;

import com.worldhero.model.enums.ElementalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorldConfigDto {
    private int worldIndex;
    private String name;
    private String description;
    private String backgroundTheme;
    private ElementalType dominantElement;
    private String bossName;
    private String bossIcon;
    private int totalStages; // 10
    
    @Builder.Default
    private List<String> dropBonusList = new ArrayList<>();
}
