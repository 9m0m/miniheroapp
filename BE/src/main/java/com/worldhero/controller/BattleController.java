package com.worldhero.controller;

import com.worldhero.dto.WaveClearRequestDto;
import com.worldhero.dto.WaveClearResponseDto;
import com.worldhero.service.BattleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/battle")
@RequiredArgsConstructor
@Tag(name = "Battle Progression", description = "Quản lý tiến trình chiến đấu 30 Waves và phần thưởng rơi")
public class BattleController {

    private final BattleService battleService;

    @PostMapping("/wave-clear")
    @Operation(summary = "Gửi kết quả vượt Wave, nhận Gold/Đá, tích lũy Piggy Bank Gems và rớt rương")
    public ResponseEntity<WaveClearResponseDto> clearWave(@Valid @RequestBody WaveClearRequestDto request) {
        return ResponseEntity.ok(battleService.processWaveClear(request));
    }
}
