package com.worldhero.engine.tower;

import com.worldhero.model.enums.TargetRule;
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
public class TowerSkill {
    public enum SkillType {
        BASIC,
        PASSIVE,
        UNIQUE
    }

    private String id;
    private String name;
    private SkillType skillType;
    @Builder.Default
    private int energyCost = 0;   // 0 for BASIC, 2/3/4 for UNIQUE/ACTIVE
    private TargetRule targetRule;
    private double damageMultiplier; // e.g. 1.0 for basic, 1.3-2.3 for unique
    private double healMultiplier;   // e.g. 1.2 for heal skills
    private boolean isUnavoidable;
    
    @Builder.Default
    private List<TowerEffectState> appliedEffects = new ArrayList<>();
    
    private String animationKey;
}
