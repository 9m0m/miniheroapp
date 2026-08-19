package com.worldhero.controller;

import com.worldhero.config.security.UserPrincipal;
import com.worldhero.dto.AuthResponseDto;
import com.worldhero.dto.UserProfileDto;
import com.worldhero.dto.WorldIdVerifyRequestDto;
import com.worldhero.service.UserService;
import com.worldhero.service.WorldIdVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & World ID", description = "Xác thực danh tính World App MiniKit và JWT Token")
public class AuthController {

    private final WorldIdVerificationService worldIdVerificationService;
    private final UserService userService;

    @PostMapping("/world-id")
    @Operation(summary = "Xác thực World ID Proof từ MiniKit và trả về JWT Bearer Token")
    public ResponseEntity<AuthResponseDto> verifyWorldId(@Valid @RequestBody WorldIdVerifyRequestDto request) {
        return ResponseEntity.ok(worldIdVerificationService.verifyAndAuthenticate(request));
    }

    @PostMapping("/local-login")
    @Operation(summary = "Đăng nhập nhanh cho môi trường Local / Browser Testing")
    public ResponseEntity<AuthResponseDto> localLogin(@RequestParam(required = false) String username) {
        return ResponseEntity.ok(worldIdVerificationService.loginLocalDevUser(username));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin tài khoản hiện tại từ Token trong SecurityContext")
    public ResponseEntity<UserProfileDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng xác thực tài khoản để truy cập.");
        }
        return ResponseEntity.ok(userService.getProfile(principal.getId()));
    }
}
