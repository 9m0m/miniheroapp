package com.worldhero.service;

import com.worldhero.dto.WaveClearRequestDto;
import com.worldhero.dto.WaveClearResponseDto;

public interface BattleService {
    WaveClearResponseDto processWaveClear(WaveClearRequestDto request);
}
