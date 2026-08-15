package com.worldhero.dto;

import com.worldhero.model.enums.ItemRarity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemInstanceDto {

    private String id;               // Unique instance UUID in player bag
    private String templateId;       // References ItemTemplate
    private int itemLevel;           // iLvl (1 - 100)
    private ItemRarity rarity;       // Current Rarity
    private int enhanceLevel;        // +0 to +15

    // Sockets (Holds Gem IDs, e.g., ["RUBY_T3", "EMERALD_T2"])
    @Builder.Default
    private List<String> sockets = new ArrayList<>();

    // Blessing Scroll applied (e.g., "SCROLL_OF_MIGHT")
    private String blessingId;

    // Sub-stats (rolled during drop or Cube reforge)
    private StatsDto subStats;

    // Computed effective stats at runtime (calculated by StatEvaluator)
    private StatsDto computedStats;
}
