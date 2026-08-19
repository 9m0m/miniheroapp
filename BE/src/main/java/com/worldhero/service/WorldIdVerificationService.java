package com.worldhero.service;

import com.worldhero.dto.AuthResponseDto;
import com.worldhero.dto.WorldIdVerifyRequestDto;

public interface WorldIdVerificationService {

    /**
     * Xác thực World ID Proof (MiniKit) và cấp JWT Bearer Token cùng hồ sơ người dùng
     */
    AuthResponseDto verifyAndAuthenticate(WorldIdVerifyRequestDto request);

    /**
     * Đăng nhập nhanh cho môi trường Local Dev / Testing
     */
    AuthResponseDto loginLocalDevUser(String worldIdHashOrUsername);
}
