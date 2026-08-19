package com.worldhero.service;

import com.worldhero.dto.HeroCatalogResponseDto;
import com.worldhero.dto.HeroTemplateDto;
import com.worldhero.model.enums.HeroClass;

import java.util.List;
import java.util.Optional;

public interface HeroCatalogService {
    String CATALOG_VERSION = "hero-v1";

    HeroCatalogResponseDto getCatalog(String version);

    List<HeroTemplateDto> getAllTemplates();

    List<HeroTemplateDto> getEnabledTemplates();

    Optional<HeroTemplateDto> getTemplateById(String templateId);

    Optional<HeroTemplateDto> getTemplateByLegacyClass(HeroClass heroClass);

    String mapLegacyClassToTemplateId(HeroClass heroClass);

    HeroClass mapTemplateIdToLegacyClass(String templateId);
}
