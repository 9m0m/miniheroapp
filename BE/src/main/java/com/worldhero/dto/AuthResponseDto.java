package com.worldhero.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDto {

    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    private long expiresIn;

    private UUID userId;

    private String worldIdHash;

    private String displayName;

    private String role;

    private UserProfileDto profile;
}
