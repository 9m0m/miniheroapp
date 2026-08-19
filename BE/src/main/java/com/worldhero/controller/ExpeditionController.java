package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.ExpeditionClaimResponseDto;
import com.worldhero.dto.ExpeditionConfigDto;
import com.worldhero.dto.ExpeditionDispatchDto;
import com.worldhero.dto.ExpeditionRunDto;
import com.worldhero.service.ExpeditionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/expeditions")
@RequiredArgsConstructor
@Tag(name = "Expeditions", description = "Expedition System (Free/Paid Slots, 10s Tutorial / 8h Normal, Busy Hero Locks)")
public class ExpeditionController {

    private final ExpeditionService expeditionService;

    @GetMapping("/config")
    @Operation(summary = "Lấy cấu hình hệ thống Thám Hiểm")
    public ResponseEntity<ExpeditionConfigDto> getConfig() {
        return ResponseEntity.ok(expeditionService.getConfig());
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách các lượt Thám Hiểm của tài khoản")
    public ResponseEntity<List<ExpeditionRunDto>> getActiveRuns(
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(expeditionService.getActiveRuns(effectiveId));
    }

    @PostMapping
    @Operation(summary = "Phái 1–3 Hero đi Thám Hiểm (Khóa Hero EXPEDITION_BUSY)")
    public ResponseEntity<ExpeditionRunDto> dispatch(
            @RequestBody ExpeditionDispatchDto request,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(expeditionService.dispatch(effectiveId, request));
    }

    @PostMapping("/{runId}/claim")
    @Operation(summary = "Nhận thưởng Thám Hiểm khi đã hoàn thành (Idempotent, mở khóa Hero)")
    public ResponseEntity<ExpeditionClaimResponseDto> claim(
            @PathVariable UUID runId,
            @RequestParam(required = false) String idempotencyKey,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(expeditionService.claim(effectiveId, runId, idempotencyKey));
    }

    @PostMapping("/{runId}/cancel")
    @Operation(summary = "Hủy lượt Thám Hiểm ngay lập tức (Trả Hero về IDLE, 0 phần thưởng)")
    public ResponseEntity<ExpeditionRunDto> cancel(
            @PathVariable UUID runId,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(expeditionService.cancel(effectiveId, runId));
    }
}
