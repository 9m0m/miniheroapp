package com.worldhero.service;

import com.worldhero.model.entity.ItemTemplateEntity;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.repository.ItemTemplateRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemTemplateCacheService {

    private final ItemTemplateRepository templateRepository;

    // Volatile immutable snapshots — thread-safe reads without synchronization on the hot path
    private volatile Map<ItemRarity, List<ItemTemplateEntity>> templateByRarityCache = Map.of();
    private volatile List<ItemTemplateEntity> allTemplatesCache = List.of();

    @PostConstruct
    public void init() {
        refreshCache();
    }

    public synchronized void refreshCache() {
        List<ItemTemplateEntity> all = templateRepository.findAll();

        Map<ItemRarity, List<ItemTemplateEntity>> grouped = all.stream()
                .collect(Collectors.groupingBy(
                        ItemTemplateEntity::getBaseRarity,
                        () -> new EnumMap<>(ItemRarity.class),
                        Collectors.toUnmodifiableList()
                ));

        // Atomic reference swap — readers always see a consistent snapshot
        this.templateByRarityCache = Collections.unmodifiableMap(grouped);
        this.allTemplatesCache = Collections.unmodifiableList(new ArrayList<>(all));

        log.info("📦 ItemTemplateCache refreshed: {} templates across {} rarities",
                all.size(), grouped.size());
    }

    public List<ItemTemplateEntity> getTemplatesByRarity(ItemRarity rarity) {
        List<ItemTemplateEntity> list = templateByRarityCache.get(rarity);
        if (list == null || list.isEmpty()) {
            // Fallback: return all templates if the requested rarity has none
            return allTemplatesCache;
        }
        return list;
    }

    public ItemTemplateEntity getRandomTemplateByRarity(ItemRarity rarity) {
        List<ItemTemplateEntity> list = getTemplatesByRarity(rarity);
        if (list.isEmpty()) {
            return null;
        }
        return list.get(ThreadLocalRandom.current().nextInt(list.size()));
    }

    public List<ItemTemplateEntity> getAllTemplates() {
        return allTemplatesCache;
    }
}

