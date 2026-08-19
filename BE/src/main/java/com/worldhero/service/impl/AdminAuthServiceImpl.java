package com.worldhero.service.impl;

import com.worldhero.config.security.JwtTokenProvider;
import com.worldhero.dto.AdminAuthResponseDto;
import com.worldhero.dto.AdminLoginRequestDto;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.model.entity.AdminUserEntity;
import com.worldhero.repository.AdminUserRepository;
import com.worldhero.service.AdminAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminAuthServiceImpl implements AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional(readOnly = true)
    public AdminAuthResponseDto login(AdminLoginRequestDto request) {
        String username = request.getUsername().trim();
        String rawPassword = request.getPassword().trim();

        AdminUserEntity admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new GameRuleViolationException("Tên đăng nhập hoặc mật khẩu SuperAdmin không chính xác!"));

        String storedPassword = admin.getPassword();
        boolean passwordMatches = false;

        // 1. Check BCrypt hash
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            passwordMatches = passwordEncoder.matches(rawPassword, storedPassword);
        } else if (storedPassword.length() == 64 && storedPassword.matches("[0-9a-f]{64}")) {
            // 2. Check SHA-256 hash
            byte[] inputHash = hashSha256(rawPassword).getBytes(StandardCharsets.UTF_8);
            byte[] storedHash = storedPassword.getBytes(StandardCharsets.UTF_8);
            passwordMatches = MessageDigest.isEqual(inputHash, storedHash);
        } else {
            // 3. Check plain text (seed / dev mode)
            byte[] inputBytes = rawPassword.getBytes(StandardCharsets.UTF_8);
            byte[] storedBytes = storedPassword.getBytes(StandardCharsets.UTF_8);
            passwordMatches = MessageDigest.isEqual(inputBytes, storedBytes);
        }

        if (!passwordMatches) {
            log.warn("❌ Failed Admin Login attempt for user: {}", username);
            throw new GameRuleViolationException("Tên đăng nhập hoặc mật khẩu SuperAdmin không chính xác!");
        }

        // Generate JWT Bearer Token with ROLE_ADMIN
        String roleName = admin.getRole() != null ? admin.getRole().name() : "ROLE_ADMIN";
        String token = jwtTokenProvider.generateToken(
                null,
                username,
                "Admin " + username,
                roleName
        );

        long expiresIn = 24 * 3600L; // 24h
        log.info("🔐 SuperAdmin Login SUCCESS: User {} logged in with role {}", username, roleName);

        return AdminAuthResponseDto.builder()
                .token(token)
                .username(admin.getUsername())
                .role(admin.getRole())
                .message("Xác thực SuperAdmin thành công!")
                .expiresIn(expiresIn)
                .build();
    }

    @Override
    public boolean validateSessionToken(String token) {
        if (token == null || token.isBlank()) return false;
        return jwtTokenProvider.validateToken(token);
    }

    private String hashSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return input;
        }
    }
}
