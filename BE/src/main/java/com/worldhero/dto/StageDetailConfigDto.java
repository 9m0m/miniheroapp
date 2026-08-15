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
public class StageDetailConfigDto {
    private int worldIndex;
    private int stageIndex;
    private String stageName;
    private DropTableConfigDto dropTable;
    private List<StageWaveConfigDto> waves;
}
