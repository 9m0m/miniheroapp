package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.service.TowerGearService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tower-gear")
@RequiredArgsConstructor
@Tag(name = "Tower Gear", description = "Quản lý Cường Hóa 100%, Chuyển Cấp và Phân Tách Trang Bị Tower")
public class TowerGearController {

    private final TowerGearService towerGearService;

    @Data
    public static class EnhanceRequest {
        private UUID itemId;
        /** Optional stable client key for idempotent enhance. */
        private String operationKey;
    }

    @Data
    public static class TransferRequest {
        private UUID sourceItemId;
        private UUID targetItemId;
        /** Optional stable client key for idempotent transfer. */
        private String operationKey;
    }

    @Data
    public static class SalvageRequest {
        private List<UUID> itemIds;
        /** Optional stable client key for idempotent salvage. */
        private String operationKey;
    }

    @PostMapping("/enhance")
    @Operation(summary = "Cường hóa trang bị +0 đến +15 với tỷ lệ 100%")
    public ResponseEntity<ItemInstanceDto> enhance(
            @RequestBody EnhanceRequest request,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(towerGearService.enhanceItem(effectiveId, request.getItemId(), request.getOperationKey()));
    }

    @PostMapping("/transfer")
    @Operation(summary = "Chuyển cấp Cường hóa sang trang bị khác (phí 10% Gold)")
    public ResponseEntity<ItemInstanceDto> transfer(
            @RequestBody TransferRequest request,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(towerGearService.transferEnhance(effectiveId, request.getSourceItemId(), request.getTargetItemId(), request.getOperationKey()));
    }

    @PostMapping("/salvage")
    @Operation(summary = "Phân tách trang bị nhận Đá Cường Hóa")
    public ResponseEntity<Map<String, Object>> salvage(
            @RequestBody SalvageRequest request,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        int stones = towerGearService.salvageItems(effectiveId, request.getItemIds(), request.getOperationKey());
        return ResponseEntity.ok(Map.of("stonesGained", stones));
    }
}
