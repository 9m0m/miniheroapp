package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.ChestVaultDto;
import com.worldhero.dto.OpenVaultChestRequestDto;
import com.worldhero.dto.OpenVaultChestResponseDto;
import com.worldhero.service.ChestVaultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chest-vault")
@RequiredArgsConstructor
@Tag(name = "Chest Vault", description = "Quản lý kho rương độc lập, mở rương và nhận trang bị")
public class ChestVaultController {

    private final ChestVaultService chestVaultService;

    @GetMapping
    @Operation(summary = "Lấy thông tin và số lượng rương hiện có trong Chest Vault")
    public ResponseEntity<ChestVaultDto> getChestVault(
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        if (effectiveId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng xác thực tài khoản để truy cập Chest Vault.");
        }
        return ResponseEntity.ok(chestVaultService.getChestVault(effectiveId));
    }

    @PostMapping("/open")
    @Operation(summary = "Mở 1 rương từ Chest Vault và nhận trang bị vào Túi đồ")
    public ResponseEntity<OpenVaultChestResponseDto> openChest(
            @RequestBody(required = false) OpenVaultChestRequestDto request,
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        if (effectiveId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng xác thực tài khoản để mở rương.");
        }
        return ResponseEntity.ok(chestVaultService.openChest(effectiveId, request != null ? request : new OpenVaultChestRequestDto()));
    }
}
