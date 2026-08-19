package com.worldhero.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruitmentPullRequestDto {
    private String bannerId;
    private String ticketType; // e.g. "STANDARD"
    private String idempotencyKey;
}
