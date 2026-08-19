package com.worldhero.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentVersionDto {
    private UUID id;
    private String contentType;
    private String versionTag;
    private String status;
    private String payloadJson;
    private LocalDateTime publishedAt;
    private String publishedBy;
    private String auditComment;
}
