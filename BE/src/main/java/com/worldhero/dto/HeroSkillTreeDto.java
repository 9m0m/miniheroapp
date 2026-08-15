package com.worldhero.dto;

import com.worldhero.model.enums.HeroClass;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeroSkillTreeDto {
    private UUID heroId;
    private HeroClass heroClass;
    private String heroName;
    
    @Builder.Default
    private List<SkillNodeDto> nodes = new ArrayList<>();
}
