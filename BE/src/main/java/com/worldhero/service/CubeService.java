package com.worldhero.service;

import com.worldhero.dto.GemFusionRequestDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.SmartFusionRequestDto;
import com.worldhero.dto.Transmute9RequestDto;
import com.worldhero.dto.Transmute9ResponseDto;

public interface CubeService {
    ItemInstanceDto smartFusion(SmartFusionRequestDto request);
    Transmute9ResponseDto transmuteCube9(Transmute9RequestDto request);
    String gemFusion(GemFusionRequestDto request);
}
