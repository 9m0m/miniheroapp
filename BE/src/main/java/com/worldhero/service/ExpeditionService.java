package com.worldhero.service;

import com.worldhero.dto.ExpeditionClaimResponseDto;
import com.worldhero.dto.ExpeditionConfigDto;
import com.worldhero.dto.ExpeditionDispatchDto;
import com.worldhero.dto.ExpeditionRunDto;

import java.util.List;
import java.util.UUID;

public interface ExpeditionService {
    ExpeditionConfigDto getConfig();
    List<ExpeditionRunDto> getActiveRuns(UUID userId);
    ExpeditionRunDto dispatch(UUID userId, ExpeditionDispatchDto request);
    ExpeditionClaimResponseDto claim(UUID userId, UUID runId, String idempotencyKey);
    ExpeditionRunDto cancel(UUID userId, UUID runId);
}
