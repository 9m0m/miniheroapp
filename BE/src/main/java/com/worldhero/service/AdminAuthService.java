package com.worldhero.service;

import com.worldhero.dto.AdminAuthResponseDto;
import com.worldhero.dto.AdminLoginRequestDto;

public interface AdminAuthService {
    AdminAuthResponseDto login(AdminLoginRequestDto request);
    boolean validateSessionToken(String token);
}
