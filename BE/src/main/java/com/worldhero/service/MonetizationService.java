package com.worldhero.service;

import com.worldhero.dto.MockWldPayRequestDto;
import com.worldhero.dto.MonetizationStatusDto;
import com.worldhero.dto.PaymentVerifyRequestDto;
import com.worldhero.dto.UserProfileDto;

import java.util.UUID;

public interface MonetizationService {
    MonetizationStatusDto getStatus(UUID userId);
    UserProfileDto smashPiggyBank(UUID userId);
    UserProfileDto claimDailyPass(UUID userId);
    UserProfileDto processMockWldPayment(MockWldPayRequestDto request);
    UserProfileDto verifyPayment(PaymentVerifyRequestDto request);
}
