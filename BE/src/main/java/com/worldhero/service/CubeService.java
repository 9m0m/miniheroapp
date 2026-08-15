package com.worldhero.service;

import com.worldhero.dto.GemFusionRequestDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.SmartFusionRequestDto;

public interface CubeService {
    ItemInstanceDto smartFusion(SmartFusionRequestDto request);
    String gemFusion(GemFusionRequestDto request);
}
