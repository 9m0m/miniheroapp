package com.worldhero.service.impl;

import com.worldhero.dto.WorldConfigDto;
import com.worldhero.model.enums.ElementalType;
import com.worldhero.service.WorldService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorldServiceImpl implements WorldService {

    @Override
    public List<WorldConfigDto> getAllWorlds() {
        return List.of(
            WorldConfigDto.builder()
                .worldIndex(1)
                .name("World 1: Emerald Forest")
                .description("Vibrant wilderness teeming with ancient Goblin clans and feral beasts.")
                .backgroundTheme("forest")
                .dominantElement(ElementalType.PHYSICAL)
                .bossName("Elder Goblin King")
                .bossIcon("👑")
                .totalStages(10)
                .dropBonusList(List.of("+10% Gold Boost", "Alchemy Herbal Essence Drops"))
                .build(),

            WorldConfigDto.builder()
                .worldIndex(2)
                .name("World 2: Frozen Citadel")
                .description("Glacial fortress where sub-zero blizzards test the endurance of warriors.")
                .backgroundTheme("snow")
                .dominantElement(ElementalType.COLD)
                .bossName("Ancient Frost Wyrm")
                .bossIcon("🐉")
                .totalStages(10)
                .dropBonusList(List.of("+25% Glacial Shards", "+10% Cold Resistance Gear"))
                .build(),

            WorldConfigDto.builder()
                .worldIndex(3)
                .name("World 3: Volcanic Caldera")
                .description("Sea of magma where fire demons and lava behemoths roam.")
                .backgroundTheme("volcano")
                .dominantElement(ElementalType.FIRE)
                .bossName("Fire Lord Ifrit")
                .bossIcon("🔥")
                .totalStages(10)
                .dropBonusList(List.of("+25% Fire Crystals", "+15% Fire Damage Buff"))
                .build(),

            WorldConfigDto.builder()
                .worldIndex(4)
                .name("World 4: Void Abyss")
                .description("Chaotic cosmic dimension harboring primordial eldritch entities.")
                .backgroundTheme("void")
                .dominantElement(ElementalType.CHAOS)
                .bossName("Void Overlord Abaddon")
                .bossIcon("👁️")
                .totalStages(10)
                .dropBonusList(List.of("+30% Void Cores", "+15% Legendary Drop Rate"))
                .build()
        );
    }
}
