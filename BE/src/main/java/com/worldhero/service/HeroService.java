package com.worldhero.service;

import com.worldhero.dto.HeroDetailDto;
import com.worldhero.dto.ReviveHeroResponseDto;
import com.worldhero.model.entity.HeroEntity;
import com.worldhero.model.enums.HeroClass;

import java.util.List;
import java.util.UUID;

public interface HeroService {
    List<HeroDetailDto> getHeroesForUser(UUID userId);
    HeroDetailDto buildHeroDetailDto(HeroEntity hero);
    ReviveHeroResponseDto reviveHero(UUID userId, HeroClass heroClass);
}
