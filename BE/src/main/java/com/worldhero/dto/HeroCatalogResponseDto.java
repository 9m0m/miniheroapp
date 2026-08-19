package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeroCatalogResponseDto {
    private String catalogVersion;
    private int totalHeroes;
    private int enabledCount;
    private List<HeroTemplateDto> templates;
}
