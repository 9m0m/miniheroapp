package com.worldhero.dto;

import com.worldhero.model.enums.AdminRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAuthResponseDto {
    private String token;
    private String username;
    private AdminRole role;
    private String message;
    private long expiresIn;
}
