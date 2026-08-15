package com.worldhero.engine;

import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.model.enums.GemType;
import com.worldhero.model.enums.ItemRarity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Thuần Logic The Magic Cube (Khối Hợp Nhất Thông Minh)
 */
@Component
public class CubeEngine {

    /**
     * Smart Fusion: Ghép 3 món cùng phẩm cấp -> Chắc chắn 1 món phẩm cấp trên
     */
    public ItemInstanceDto fuseItems(List<ItemInstanceDto> inputItems) {
        if (inputItems == null || inputItems.size() != 3) {
            throw new IllegalArgumentException("The Cube yêu cầu chính xác 3 trang bị để ghép!");
        }

        ItemRarity baseRarity = inputItems.get(0).getRarity();
        if (baseRarity == ItemRarity.LEGENDARY) {
            throw new IllegalArgumentException("Trang bị Legendary đã đạt phẩm cấp tối đa!");
        }

        for (ItemInstanceDto item : inputItems) {
            if (item.getRarity() != baseRarity) {
                throw new IllegalArgumentException("Cả 3 trang bị phải cùng phẩm cấp!");
            }
        }

        ItemRarity nextRarity = baseRarity.getNextTier();
        // Lấy templateId từ món đầu tiên để đảm bảo Smart Fusion giữ nguyên đúng loại đồ
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
