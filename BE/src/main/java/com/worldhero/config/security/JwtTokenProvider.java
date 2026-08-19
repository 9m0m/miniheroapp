package com.worldhero.config.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long tokenValidityInMilliseconds;

    public JwtTokenProvider(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-ms:3600000}") long expirationMs, // Default 1 hour
            Environment environment
    ) {
        boolean isProd = environment.acceptsProfiles(Profiles.of("prod", "production"));
        if (isProd && (!StringUtils.hasText(secret) || secret.contains("world-hero-super-secret"))) {
            throw new IllegalStateException("CRITICAL SECURITY ERROR: 'app.jwt.secret' (JWT_SECRET) must be set to a secure key in production!");
        }

        String effectiveSecret = StringUtils.hasText(secret)
                ? secret
                : "dev-only-jwt-secret-key-for-world-hero-testing-2026-miniapp-do-not-use-in-prod";

        byte[] keyBytes = effectiveSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.tokenValidityInMilliseconds = expirationMs;
        log.info("🔐 JwtTokenProvider initialized with {}ms token validity (Prod mode: {})", expirationMs, isProd);
    }

    public String generateToken(UUID userId, String worldIdHash, String displayName, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + tokenValidityInMilliseconds);

        return Jwts.builder()
                .subject(userId != null ? userId.toString() : worldIdHash)
                .claim("userId", userId != null ? userId.toString() : null)
                .claim("worldIdHash", worldIdHash)
                .claim("displayName", displayName)
                .claim("role", role != null ? role : "ROLE_USER")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public UserPrincipal getPrincipalFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        String userIdStr = claims.get("userId", String.class);
        UUID userId = userIdStr != null ? UUID.fromString(userIdStr) : null;
        String worldIdHash = claims.get("worldIdHash", String.class);
        String displayName = claims.get("displayName", String.class);
        String role = claims.get("role", String.class);

        return new UserPrincipal(userId, worldIdHash, displayName, role);
    }
}
