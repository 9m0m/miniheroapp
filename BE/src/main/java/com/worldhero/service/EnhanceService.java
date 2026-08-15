package com.worldhero.service;

import com.worldhero.dto.EnhanceRequestDto;
import com.worldhero.dto.EnhanceResponseDto;

public interface EnhanceService {
    EnhanceResponseDto enhanceItem(EnhanceRequestDto request);
}
