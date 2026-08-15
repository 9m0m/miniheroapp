package com.worldhero.controller;

import com.worldhero.dto.EquipRequestDto;
import com.worldhero.dto.HeroDetailDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.UnequipRequestDto;
import com.worldhero.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory & Equipment", description = "Quản lý túi đồ, trang bị và tháo đồ cho Tướng")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @Operation(summary = "Lấy toàn bộ vật phẩm đang có trong túi đồ")
    public ResponseEntity<List<ItemInstanceDto>> getBagItems(@RequestParam(required = false) UUID userId) {
        return ResponseEntity.ok(inventoryService.getBagItems(userId));
    }

    @PostMapping("/equip")
    @Operation(summary = "Trang bị vật phẩm từ túi đồ lên Tướng")
    public ResponseEntity<HeroDetailDto> equipItem(@Valid @RequestBody EquipRequestDto request) {
        return ResponseEntity.ok(inventoryService.equipItem(request));
    }

    @PostMapping("/unequip")
    @Operation(summary = "Tháo vật phẩm từ Tướng về lại túi đồ")
    public ResponseEntity<HeroDetailDto> unequipItem(@Valid @RequestBody UnequipRequestDto request) {
        return ResponseEntity.ok(inventoryService.unequipItem(request));
    }
}
