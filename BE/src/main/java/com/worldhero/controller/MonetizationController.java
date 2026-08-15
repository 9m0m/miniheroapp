package com.worldhero.controller;

import com.worldhero.dto.MockWldPayRequestDto;
import com.worldhero.dto.MonetizationStatusDto;
import com.worldhero.dto.UserProfileDto;
import com.worldhero.service.MonetizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/monetization")
@RequiredArgsConstructor
@Tag(name = "Monetization & Earning Hooks", description = "Quản lý Két Sắt Thần Tài, Chuỗi 7 Ngày Thức Tỉnh, Quỹ Thám Hiểm và Mock WLD Sandbox")
public class MonetizationController {

    private final MonetizationService monetizationService;

    @GetMapping("/status")
    @Operation(summary = "Lấy trạng thái Két Sắt (Piggy Bank), Chuỗi 7 Ngày và Quỹ Thám Hiểm")
    public ResponseEntity<MonetizationStatusDto> getStatus(@RequestParam(required = false) UUID userId) {
        return ResponseEntity.ok(monetizationService.getStatus(userId));
    }

    @PostMapping("/smash-piggy-bank")
    @Operation(summary = "Đập vỡ Két Sắt Thần Tài và nhận toàn bộ Gems tích lũy")
    public ResponseEntity<UserProfileDto> smashPiggyBank(@RequestParam(required = false) UUID userId) {
        return ResponseEntity.ok(monetizationService.smashPiggyBank(userId));
    }

    @PostMapping("/claim-daily-pass")
    @Operation(summary = "Nhận phần thưởng Chuỗi Đăng Nhập 7 Ngày (Free hoặc Golden)")
    public ResponseEntity<UserProfileDto> claimDailyPass(@RequestParam(required = false) UUID userId) {
        return ResponseEntity.ok(monetizationService.claimDailyPass(userId));
    }

    @PostMapping("/claim-growth-fund")
    @Operation(summary = "Rút cổ tức Quỹ Thám Hiểm khi vượt qua các mốc Stage 10, 20, 30, 40")
    public ResponseEntity<UserProfileDto> claimGrowthFund(
            @RequestParam(required = false) UUID userId,
            @RequestParam int stageMilestone
    ) {
        return ResponseEntity.ok(monetizationService.claimGrowthFund(userId, stageMilestone));
    }

    @PostMapping("/mock-wld-pay")
    @Operation(summary = "Mô phỏng thanh toán WLD qua MiniKit Sandbox (Kích hoạt Golden Pass, Growth Fund, Mua Đá)")
    public ResponseEntity<UserProfileDto> mockWldPayment(@Valid @RequestBody MockWldPayRequestDto request) {
        return ResponseEntity.ok(monetizationService.processMockWldPayment(request));
    }
}
