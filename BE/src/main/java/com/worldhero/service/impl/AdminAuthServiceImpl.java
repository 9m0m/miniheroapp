package com.worldhero.service.impl;

import com.worldhero.dto.AdminAuthResponseDto;
import com.worldhero.dto.AdminLoginRequestDto;
import com.worldhero.exception.GameRuleViolationException;
import com.worldhero.model.entity.AdminUserEntity;
import com.worldhero.model.enums.AdminRole;
import com.worldhero.repository.AdminUserRepository;
import com.worldhero.service.AdminAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminAuthServiceImpl implements AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    
    // In-memory active session tokens cache (Token -> Username)
    private final Map<String, AdminSessionInfo> activeSessions = new ConcurrentHashMap<>();

    private static class AdminSessionInfo {
        String username;
        AdminRole role;
        long expiresAt;

        AdminSessionInfo(String username, AdminRole role, long expiresAt) {
            this.username = username;
            this.role = role;
            this.expiresAt = expiresAt;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAuthResponseDto login(AdminLoginRequestDto request) {
        String username = request.getUsername().trim();
        String rawPassword = request.getPassword().trim();

        AdminUserEntity admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new GameRuleViolationException("Tên đăng nhập hoặc mật khẩu SuperAdmin không chính xác!"));

        // Check password matching (supports plain text or SHA-256 hashed passwords)
        boolean passwordMatches = admin.getPassword().equals(rawPassword) ||
                admin.getPassword().equals(hashSha256(rawPassword));

        if (!passwordMatches) {
            log.warn("❌ Failed Admin Login attempt for user: {}", username);
            throw new GameRuleViolationException("Tên đăng nhập hoặc mật khẩu SuperAdmin không chính xác!");
        }

        // Generate Secure Session Token
        long durationMillis = 24 * 60 * 60 * 1000L; // 24 Hours
        long expiresAt = System.currentTimeMillis() + durationMillis;
        String token = "adm_" + UUID.randomUUID().toString().replace("-", "") + "_" + Base64.getUrlEncoder().withoutPadding().encodeToString(username.getBytes(StandardCharsets.UTF_8));

        activeSessions.put(token, new AdminSessionInfo(username, admin.getRole(), expiresAt));

        log.info("🔐 SuperAdmin Login SUCCESS: User {} logged in with role {}", username, admin.getRole());

        return AdminAuthResponseDto.builder()
                .token(token)
                .username(admin.getUsername())
                .role(admin.getRole())
                .message("Xác thực SuperAdmin thành công!")
                .expiresIn(durationMillis / 1000)
                .build();
    }

    @Override
    public boolean validateSessionToken(String token) {
        if (token == null || token.isBlank()) return false;
        AdminSessionInfo session = activeSessions.get(token);
        if (session == null) return false;
        if (System.currentTimeMillis() > session.expiresAt) {
            activeSessions.remove(token);
            return false;
        }
        return true;
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
