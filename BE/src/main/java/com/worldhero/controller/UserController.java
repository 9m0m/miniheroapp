package com.worldhero.controller;

import com.worldhero.dto.UserProfileDto;
import com.worldhero.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
@Tag(name = "User & Profile", description = "Quản lý thông tin tài khoản, ví tài nguyên và tiến trình")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Lấy hồ sơ người dùng, số dư ví và trạng thái Earning")
    public ResponseEntity<UserProfileDto> getProfile(@RequestParam(required = false) UUID userId) {
        if (userId != null) {
            return ResponseEntity.ok(userService.getProfile(userId));
        }
        return ResponseEntity.ok(userService.getOrCreateDefaultUser());
    }
}
