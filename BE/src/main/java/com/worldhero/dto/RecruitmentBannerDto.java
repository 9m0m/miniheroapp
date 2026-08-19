package com.worldhero.dto;

import com.worldhero.model.enums.BannerType;
import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruitmentBannerDto {
    private String bannerId;
    private String name;
    private String description;
    private BannerType type;
    private int ticketCost;
    private boolean isPaid;
    private List<String> enabledHeroTemplateIds;
    private Map<String, String> ratesDisplay;
}
