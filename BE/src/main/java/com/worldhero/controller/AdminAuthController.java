package com.worldhero.controller;

import com.worldhero.dto.AdminAuthResponseDto;
import com.worldhero.dto.AdminLoginRequestDto;
import com.worldhero.service.AdminAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Authentication API", description = "Đăng nhập và cấp quyền SuperAdmin LiveOps")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập SuperAdmin (username: superadmin / password: adminpassword123)")
    public ResponseEntity<AdminAuthResponseDto> login(@Valid @RequestBody AdminLoginRequestDto request) {
        return ResponseEntity.ok(adminAuthService.login(request));
    }
}
