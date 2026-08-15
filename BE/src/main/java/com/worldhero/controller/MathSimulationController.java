package com.worldhero.controller;

import com.worldhero.dto.ItemInstanceDto;
import com.worldhero.dto.ItemTemplateDto;
import com.worldhero.dto.StatsDto;
import com.worldhero.engine.DamageCalculator;
import com.worldhero.engine.StatEvaluator;
import com.worldhero.model.enums.ElementalType;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.ItemSlot;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/math-engine")
@RequiredArgsConstructor
@Tag(name = "Math Engine", description = "Kiểm tra và mô phỏng công thức Damage & Stat Evaluator")
public class MathSimulationController {

    private final DamageCalculator damageCalculator;
    private final StatEvaluator statEvaluator;

    @PostMapping("/simulate-dph")
    @Operation(summary = "Mô phỏng 1 đòn đánh (DPH & Damage Taken)")
    public ResponseEntity<DamageCalculator.DamageResult> simulateDph(
            @RequestBody StatsDto attackerStats,
            @RequestParam(defaultValue = "1.0") double skillMultiplier,
            @RequestParam(defaultValue = "100.0") double targetArmor,
            @RequestParam(defaultValue = "10.0") double targetDmgReduction,
            @RequestParam(defaultValue = "0.0") double targetElementalRes
    ) {
        DamageCalculator.DamageResult result = damageCalculator.calculateDamagePerHit(
                attackerStats,
                skillMultiplier,
                targetArmor,
                targetDmgReduction,
                targetElementalRes
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/simulate-demo-item")
    @Operation(summary = "Mô phỏng tính chỉ số thực tế của Kiếm Huyền Thoại (Template + Instance + Ngọc + Blessing)")
    public ResponseEntity<Map<String, Object>> simulateDemoItem() {
        // 1. Template Kiếm Rồng
        ItemTemplateDto template = ItemTemplateDto.builder()
                .id("wpn_dragon_sword_01")
                .name("Hỏa Long Kiếm (Dragon Flame Sword)")
                .slot(ItemSlot.MAIN_HAND)
                .requiredClass(HeroClass.WARRIOR)
                .elementalType(ElementalType.FIRE)
                .baseRarity(ItemRarity.COMMON)
                .baseStats(StatsDto.builder()
                        .physAtk(50.0)
                        .atkPercent(5.0)
                        .critRate(5.0)
                        .elemDmgBonus(10.0)
                        .build())
                .iLvlScalingFactor(0.08)
                .build();

        // 2. Instance người chơi sở hữu: Cấp iLvl 20, Rarity LEGENDARY, Cường hóa +10, Khảm 2 Ruby T3 + 1 Emerald T3, Ép Scroll of Might
        ItemInstanceDto instance = ItemInstanceDto.builder()
                .id("inst_001")
                .templateId(template.getId())
                .itemLevel(20)
                .rarity(ItemRarity.LEGENDARY)
                .enhanceLevel(10)
                .sockets(List.of("RUBY_T3", "RUBY_T3", "EMERALD_T3"))
                .blessingId("SCROLL_OF_MIGHT")
                .build();

        StatsDto computedStats = statEvaluator.computeItemStats(template, instance);
        double theoreticalDPS = damageCalculator.calculateTheoreticalDPS(computedStats);

        return ResponseEntity.ok(Map.of(
                "template", template,
                "instance", instance,
                "effectiveComputedStats", computedStats,
                "theoreticalDPS", theoreticalDPS
        ));
    }
}
