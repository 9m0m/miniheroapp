package com.worldhero.dto;

import com.worldhero.model.enums.TargetRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TowerProfileDto {
    private int baseSpeed;
    private TargetRule basicTargetRule;
    private String aiPolicyId;
}
