package com.worldhero.dto;

import com.worldhero.model.enums.AdminRole;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLoginResponseDto {
    private Boolean success;
    private String token;
    private UUID adminId;
    private String username;
    private AdminRole role;
    private String message;
}
