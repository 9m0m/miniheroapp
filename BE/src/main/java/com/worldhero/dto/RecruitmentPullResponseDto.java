package com.worldhero.dto;

import com.worldhero.model.enums.HeroRole;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruitmentPullResponseDto {
    private String heroTemplateId;
    private String heroName;
    private HeroRole role;
    private String rarity;
    private boolean isNew;
    private int shardsGranted;
    private UUID heroInstanceId;
    private int lifetimePulls;
    private int remainingTickets;
    private UUID ledgerId;
}
