package com.worldhero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsDto {
    private long totalUsers;
    private long totalItemTemplates;
    private long totalSkillConfigs;
    private String serverStatus;
    private String databaseEngine;
}
