package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.MockWldPayRequestDto;
import com.worldhero.dto.MonetizationStatusDto;
import com.worldhero.dto.PaymentVerifyRequestDto;
import com.worldhero.dto.UserProfileDto;
import com.worldhero.service.MonetizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/monetization")
@RequiredArgsConstructor
@Tag(name = "Monetization & Earning Hooks", description = "Quản lý Két Sắt Thần Tài, Chuỗi 7 Ngày Thức Tỉnh, Quỹ Thám Hiểm và Thanh toán WLD MiniKit")
public class MonetizationController {

    private final MonetizationService monetizationService;

    @GetMapping("/status")
    @Operation(summary = "Lấy trạng thái Két Sắt (Piggy Bank), Chuỗi 7 Ngày và Quỹ Thám Hiểm")
    public ResponseEntity<MonetizationStatusDto> getStatus(
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(monetizationService.getStatus(effectiveId));
    }

    @PostMapping("/smash-piggy-bank")
    @Operation(summary = "Đập vỡ Két Sắt Thần Tài và nhận toàn bộ Gems tích lũy")
    public ResponseEntity<UserProfileDto> smashPiggyBank(
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(monetizationService.smashPiggyBank(effectiveId));
    }

    @PostMapping("/claim-daily-pass")
    @Operation(summary = "Nhận phần thưởng Chuỗi Đăng Nhập 7 Ngày (Free hoặc Golden)")
    public ResponseEntity<UserProfileDto> claimDailyPass(
            @RequestParam(required = false) UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID effectiveId = principal != null && principal.getId() != null ? principal.getId() : userId;
        return ResponseEntity.ok(monetizationService.claimDailyPass(effectiveId));
    }

    @PostMapping("/verify-payment")
    @Operation(summary = "Xác thực giao dịch WLD thật qua MiniKit Payment API")
    public ResponseEntity<UserProfileDto> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(monetizationService.verifyPayment(request));
    }

    @PostMapping("/mock-wld-pay")
    @Operation(summary = "Mô phỏng thanh toán WLD qua MiniKit Sandbox (Chỉ môi trường Dev)")
    public ResponseEntity<UserProfileDto> mockWldPayment(
            @Valid @RequestBody MockWldPayRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal != null && principal.getId() != null) {
            request.setUserId(principal.getId());
        }
        return ResponseEntity.ok(monetizationService.processMockWldPayment(request));
    }
}
