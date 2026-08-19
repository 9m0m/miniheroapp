package com.worldhero.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenChestRequestDto {
    private UUID userId;

    @NotBlank(message = "chestItemInstanceId is required")
    private String chestItemInstanceId;
}
