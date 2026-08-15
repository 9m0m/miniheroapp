package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuildInspectResponseDto {
    private UUID userId;
    private String username;
    private boolean isBuildPublic;
    private String heroesSnapshotJson;
    private String message;
}
