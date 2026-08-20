package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.BlessRequestDto;
import com.worldhero.dto.CraftRequestDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.service.CraftingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/crafting")
@RequiredArgsConstructor
@Tag(name = "Crafting & Blessings", description = "Blessings, Item Crafting, and Forge Workshop")
public class CraftingController {

    private final CraftingService craftingService;

    @PostMapping("/bless")
    @Operation(summary = "Apply a Blessing Scroll to an item")
    public ResponseEntity<ItemInstanceDto> blessItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BlessRequestDto request) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(craftingService.blessItem(request));
    }

    @PostMapping("/blacksmith")
    @Operation(summary = "Forge accessories and equipment (Rings, Talismans)")
    public ResponseEntity<ItemInstanceDto> craftAccessory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CraftRequestDto request) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(craftingService.craftAccessory(request));
    }

    @PostMapping("/alchemy")
    @Operation(summary = "Brew blessings and elixirs in the Alchemy Station")
    public ResponseEntity<String> brewAlchemy(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CraftRequestDto request) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(craftingService.brewAlchemy(request));
    }
}
