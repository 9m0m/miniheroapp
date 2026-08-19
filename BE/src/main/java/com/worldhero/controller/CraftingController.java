package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.BlessRequestDto;
import com.worldhero.dto.CraftRequestDto;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.SocketOperationRequestDto;
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
@Tag(name = "Crafting, Sockets & Alchemy", description = "Khảm ngọc, Giấy chúc phúc, Lò Giả Kim và Xưởng Thợ Rèn")
public class CraftingController {

    private final CraftingService craftingService;

    @PostMapping("/inlay-gem")
    @Operation(summary = "Khảm ngọc vào ô trống trên trang bị")
    public ResponseEntity<ItemInstanceDto> inlayGem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SocketOperationRequestDto request) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(craftingService.inlayGem(request));
    }

    @PostMapping("/remove-gem")
    @Operation(summary = "Tháo ngọc ra khỏi trang bị")
    public ResponseEntity<ItemInstanceDto> removeGem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SocketOperationRequestDto request) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(craftingService.removeGem(request));
    }

    @PostMapping("/bless")
    @Operation(summary = "Ép Giấy Chúc Phúc lên trang bị")
    public ResponseEntity<ItemInstanceDto> blessItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BlessRequestDto request) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(craftingService.blessItem(request));
    }

    @PostMapping("/blacksmith")
    @Operation(summary = "Rèn 4 món phụ kiện tại Xưởng Thợ Rèn (Nhẫn, Dây Chuyền, Bùa Chú)")
    public ResponseEntity<ItemInstanceDto> craftAccessory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CraftRequestDto request) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(craftingService.craftAccessory(request));
    }

    @PostMapping("/alchemy")
    @Operation(summary = "Nấu Giấy Chúc Phúc tại Lò Giả Kim")
    public ResponseEntity<String> brewAlchemy(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CraftRequestDto request) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(craftingService.brewAlchemy(request));
    }
}
