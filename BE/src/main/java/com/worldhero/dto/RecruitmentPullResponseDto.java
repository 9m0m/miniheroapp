package com.worldhero.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private String title;
    private HeroRole role;
    private String rarity;

    @JsonProperty("isNew")
    private boolean isNew;

    private int shardsGranted;
    private UUID heroInstanceId;
    private int lifetimePulls;
    private int remainingTickets;
    private UUID ledgerId;
}
