package com.worldhero.model.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.StatsDto;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.ItemSlot;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "item_instances", indexes = {
    @Index(name = "idx_item_user_id", columnList = "user_id"),
    @Index(name = "idx_item_hero_id", columnList = "hero_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemInstanceEntity {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hero_id")
    private HeroEntity hero; // NULL if in bag

    @Enumerated(EnumType.STRING)
    @Column(name = "equipped_slot", length = 30)
    private ItemSlot equippedSlot; // NULL if in bag; otherwise MAIN_HAND, HELMET, etc.

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "template_id", nullable = false)
    private ItemTemplateEntity template;

    @Column(name = "item_level", nullable = false)
    @Builder.Default
    private int itemLevel = 1; // iLvl (1 - 100)

    @Enumerated(EnumType.STRING)
    @Column(name = "current_rarity", nullable = false, length = 30)
    @Builder.Default
    private ItemRarity currentRarity = ItemRarity.COMMON;

    @Column(name = "enhance_level", nullable = false)
    @Builder.Default
    private int enhanceLevel = 0; // +0 to +15

    @Column(name = "sockets", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String sockets = "[]"; // JSON array: ["RUBY_T2", "EMERALD_T1"]

    @Column(name = "sub_stats", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String subStats = "{}"; // JSON map of sub-stats

    @Column(name = "blessing_id", length = 100)
    private String blessingId; // e.g. "SCROLL_OF_MIGHT"

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public List<String> getSocketsList() {
        if (sockets == null || sockets.isBlank() || sockets.equals("[]")) {
            return new ArrayList<>();
        }
        try {
            return OBJECT_MAPPER.readValue(sockets, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }

    public void setSocketsList(List<String> socketList) {
        try {
            this.sockets = OBJECT_MAPPER.writeValueAsString(socketList != null ? socketList : new ArrayList<>());
        } catch (JsonProcessingException e) {
            this.sockets = "[]";
        }
    }

    public StatsDto getSubStatsDto() {
        if (subStats == null || subStats.isBlank() || subStats.equals("{}")) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(subStats, StatsDto.class);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    public void setSubStatsDto(StatsDto stats) {
        try {
            this.subStats = OBJECT_MAPPER.writeValueAsString(stats != null ? stats : new StatsDto());
        } catch (JsonProcessingException e) {
            this.subStats = "{}";
        }
    }

    public ItemInstanceDto toInstanceDto() {
        return ItemInstanceDto.builder()
                .id(id != null ? id.toString() : null)
                .templateId(template != null ? template.getId() : null)
                .itemLevel(itemLevel)
                .rarity(currentRarity)
                .enhanceLevel(enhanceLevel)
                .sockets(getSocketsList())
                .blessingId(blessingId)
                .subStats(getSubStatsDto())
                .build();
    }
}
