package com.worldhero.dto;

import com.worldhero.model.enums.AttackMode;
import com.worldhero.model.enums.TargetRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttackProfileDto {
    private AttackMode mode;
    private int rangePx;
    private TargetRule targetRule;
}
