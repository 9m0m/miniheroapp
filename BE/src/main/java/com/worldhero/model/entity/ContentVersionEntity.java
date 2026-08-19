package com.worldhero.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "content_versions", uniqueConstraints = {
    @UniqueConstraint(name = "uk_content_type_version", columnNames = {"content_type", "version_tag"})
}, indexes = {
    @Index(name = "idx_content_type_status", columnList = "content_type, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentVersionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType; // HEROES, SKILLS, EXPEDITION, TOWER_FLOORS, BANNERS, AI_PROFILES

    @Column(name = "version_tag", nullable = false, length = 50)
    private String versionTag; // e.g. "hero-v2", "tower-v2", "v2.0.0"

    @Column(name = "payload_json", nullable = false, columnDefinition = "TEXT")
    private String payloadJson;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PUBLISHED"; // DRAFT, PUBLISHED, ARCHIVED

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "published_by", length = 100)
    private String publishedBy;

    @Column(name = "audit_comment", length = 255)
    private String auditComment;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
