package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummonHistoryDto {
    private UUID id;
    private String heroTemplateId;
    private String heroName;
    private String role;
    private int stars;
    private boolean isDuplicate;
    private int shardsGranted;
    private String ticketType;
    private LocalDateTime createdAt;
}
