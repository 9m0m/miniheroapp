package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.EquipRequestDto;
import com.worldhero.dto.HeroDetailDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.OpenChestRequestDto;
import com.worldhero.dto.OpenChestResponseDto;
import com.worldhero.dto.UnequipRequestDto;
import com.worldhero.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory & Equipment", description = "Quản lý túi đồ, trang bị, tháo đồ và mở rương")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @Operation(summary = "Lấy toàn bộ vật phẩm đang có trong túi đồ")
    public ResponseEntity<List<ItemInstanceDto>> getBagItems(
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(inventoryService.getBagItems(effectiveId));
    }

    @PostMapping("/equip")
    @Operation(summary = "Trang bị vật phẩm từ túi đồ lên Tướng")
    public ResponseEntity<HeroDetailDto> equipItem(
            @Valid @RequestBody EquipRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(inventoryService.equipItem(request));
    }

    @PostMapping("/unequip")
    @Operation(summary = "Tháo vật phẩm từ Tướng về lại túi đồ")
    public ResponseEntity<HeroDetailDto> unequipItem(
            @Valid @RequestBody UnequipRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(inventoryService.unequipItem(request));
    }

    @PostMapping("/open-chest")
    @Operation(summary = "Mở rương vật phẩm và nhận trang bị")
    public ResponseEntity<OpenChestResponseDto> openChest(
            @Valid @RequestBody OpenChestRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(inventoryService.openChest(request));
    }

    @PostMapping("/unlock-slots")
    @Operation(summary = "Mở rộng số ô túi đồ của người chơi")
    public ResponseEntity<Integer> unlockSlots(
            @RequestParam(required = false) UUID userId,
            @RequestParam int targetSlots,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(inventoryService.unlockSlots(effectiveId, targetSlots));
    }
}
