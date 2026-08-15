package com.worldhero.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlessRequestDto {
    @NotNull(message = "userId is required")
    private UUID userId;

    @NotNull(message = "itemInstanceId is required")
    private UUID itemInstanceId;

    @NotBlank(message = "blessingId is required (e.g. SCROLL_OF_MIGHT, SCROLL_OF_AEGIS, SCROLL_OF_FORTUNE)")
    private String blessingId;
}
