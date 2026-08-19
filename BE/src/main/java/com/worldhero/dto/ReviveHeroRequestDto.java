package com.worldhero.dto;

import com.worldhero.model.enums.HeroClass;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviveHeroRequestDto {
    @NotNull
    private HeroClass heroClass;
}
