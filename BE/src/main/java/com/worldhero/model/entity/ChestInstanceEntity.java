package com.worldhero.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chest_instances", indexes = {
    @Index(name = "idx_chest_user_opened", columnList = "user_id, is_opened"),
    @Index(name = "idx_chest_template", columnList = "template_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChestInstanceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "template_id", nullable = false, length = 50)
    private String templateId;

    @Column(name = "item_level", nullable = false)
    @Builder.Default
    private int itemLevel = 1;

    @Column(name = "is_opened", nullable = false)
    @Builder.Default
    private boolean isOpened = false;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "opened_at")
    private LocalDateTime openedAt;
}
