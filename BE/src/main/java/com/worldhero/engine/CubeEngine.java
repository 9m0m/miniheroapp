package com.worldhero.engine;

import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.model.enums.GemType;
import com.worldhero.model.enums.ItemRarity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Thuần Logic The Magic Cube (Khối Hợp Nhất 9 Món Thông Minh)
 */
@Component
public class CubeEngine {

    public static class TransmuteResult {
        public ItemRarity targetRarity;
        public boolean isJackpot;
        public boolean isFallback;

        public TransmuteResult(ItemRarity targetRarity, boolean isJackpot, boolean isFallback) {
            this.targetRarity = targetRarity;
            this.isJackpot = isJackpot;
            this.isFallback = isFallback;
        }
    }

    /**
     * Tính toán tỷ lệ nâng cấp 9 món cùng phẩm chất
     */
    public TransmuteResult calculateTransmuteRates(ItemRarity baseRarity) {
        double roll = ThreadLocalRandom.current().nextDouble(0.0, 100.0);
        ItemRarity targetRarity = baseRarity.getNextTier();
        boolean isJackpot = false;
        boolean isFallback = false;

        switch (baseRarity) {
            case COMMON -> {
                if (roll < 0.5) {
                    isJackpot = true;
                    targetRarity = ItemRarity.RARE; // Jackpot double jump
                } else {
                    targetRarity = ItemRarity.UNCOMMON;
                }
            }
            case UNCOMMON -> {
                if (roll < 0.2) {
                    isJackpot = true;
                    targetRarity = ItemRarity.EPIC; // Jackpot double jump
                } else {
                    targetRarity = ItemRarity.RARE;
                }
            }
            case RARE -> {
                if (roll < 0.05) {
                    isJackpot = true;
                    targetRarity = ItemRarity.LEGENDARY; // Jackpot double jump
                } else if (roll < 15.0) {
                    isFallback = true;
                    targetRarity = ItemRarity.RARE; // Retain current tier
                } else {
                    targetRarity = ItemRarity.EPIC;
                }
            }
            case EPIC -> {
                if (roll < 0.02) {
                    isJackpot = true;
                    targetRarity = ItemRarity.MYTHIC;
                } else if (roll < 20.0) {
                    isFallback = true;
                    targetRarity = ItemRarity.EPIC;
                } else {
                    targetRarity = ItemRarity.LEGENDARY;
                }
            }
            case LEGENDARY -> {
                if (roll < 25.0) {
                    isFallback = true;
                    targetRarity = ItemRarity.LEGENDARY;
                } else {
                    targetRarity = ItemRarity.MYTHIC;
                }
            }
            case MYTHIC -> {
                if (roll < 30.0) {
                    isFallback = true;
                    targetRarity = ItemRarity.MYTHIC;
                } else {
                    targetRarity = ItemRarity.ANCIENT;
                }
            }
            case ANCIENT -> {
                isFallback = true;
                targetRarity = ItemRarity.ANCIENT;
            }
        }

        return new TransmuteResult(targetRarity, isJackpot, isFallback);
    }

    /**
     * Smart Fusion: Ghép 3 món cùng phẩm cấp
     */
    public ItemInstanceDto fuseItems(List<ItemInstanceDto> inputItems) {
        if (inputItems == null || inputItems.size() != 3) {
            throw new IllegalArgumentException("The Cube yêu cầu chính xác 3 trang bị để ghép!");
        }

        ItemRarity baseRarity = inputItems.get(0).getRarity();
        ItemRarity nextRarity = baseRarity.getNextTier();
        if (nextRarity == null) {
            throw new IllegalArgumentException("Trang bị đã đạt phẩm cấp tối đa!");
        }

        String targetTemplateId = inputItems.get(0).getTemplateId();
        int avgILvl = (int) Math.round(inputItems.stream().mapToInt(ItemInstanceDto::getItemLevel).average().orElse(1));

        return ItemInstanceDto.builder()
                .id(UUID.randomUUID().toString())
                .templateId(targetTemplateId)
                .itemLevel(avgILvl)
                .rarity(nextRarity)
                .enhanceLevel(0)
                .build();
    }

    /**
     * Ghép 3 viên ngọc Tier N cùng loại -> 1 viên ngọc Tier N+1
     */
    public String fuseGems(GemType gemType, int currentTier) {
        if (currentTier < 1 || currentTier >= 5) {
            throw new IllegalArgumentException("Tier ngọc phải từ 1 đến 4 để có thể thăng cấp lên Tier 5!");
        }
        return gemType.name() + "_T" + (currentTier + 1);
    }
}
