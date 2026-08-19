package com.worldhero.service;

import com.worldhero.dto.RecruitmentBannerDto;
import com.worldhero.dto.RecruitmentPullRequestDto;
import com.worldhero.dto.RecruitmentPullResponseDto;
import com.worldhero.dto.SummonHistoryDto;

import java.util.List;
import java.util.UUID;

public interface RecruitmentService {
    List<RecruitmentBannerDto> getBanners();
    RecruitmentPullResponseDto pull(UUID userId, RecruitmentPullRequestDto request);
    List<SummonHistoryDto> getHistory(UUID userId);
}
