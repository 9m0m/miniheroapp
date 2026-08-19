package com.worldhero.model.entity;

import com.worldhero.dto.ItemTemplateDto;
import com.worldhero.dto.StatsDto;
import com.worldhero.model.enums.ElementalType;
import com.worldhero.model.enums.HeroClass;
import com.worldhero.model.enums.ItemRarity;
import com.worldhero.model.enums.ItemSlot;
import com.worldhero.model.enums.ItemType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "item_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemTemplateEntity {

    @Id
    @Column(name = "id", length = 100)
    private String id; // e.g. "wpn_iron_sword", "shd_iron_shield"

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "icon_key", nullable = false, length = 100)
    private String iconKey; // e.g. "⚔️", "🛡️", or asset key

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", length = 30)
    @Builder.Default
    private ItemType itemType = ItemType.EQUIPMENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "slot_type", nullable = false, length = 30)
    private ItemSlot slotType;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_class", length = 30)
    private HeroClass requiredClass; // null = Universal Accessory

    @Enumerated(EnumType.STRING)
    @Column(name = "base_rarity", nullable = false, length = 30)
    @Builder.Default
    private ItemRarity baseRarity = ItemRarity.COMMON;

    @Enumerated(EnumType.STRING)
    @Column(name = "elemental_type", nullable = false, length = 30)
    @Builder.Default
    private ElementalType elementalType = ElementalType.PHYSICAL;

    @Column(name = "ilvl_scaling_factor", nullable = false)
    @Builder.Default
    private double ilvlScalingFactor = 0.08; // 8% growth per iLvl

    // Flat Base Stats
    @Column(name = "base_phys_atk", nullable = false)
    @Builder.Default
    private double basePhysAtk = 0.0;

    @Column(name = "base_magic_atk", nullable = false)
    @Builder.Default
    private double baseMagicAtk = 0.0;

    @Column(name = "base_atk_percent", nullable = false)
    @Builder.Default
    private double baseAtkPercent = 0.0;

    @Column(name = "base_atk_speed", nullable = false)
    @Builder.Default
    private double baseAtkSpeed = 0.0;

    @Column(name = "base_crit_rate", nullable = false)
    @Builder.Default
    private double baseCritRate = 0.0;

    @Column(name = "base_crit_dmg", nullable = false)
    @Builder.Default
    private double baseCritDmg = 0.0;

    @Column(name = "base_elem_dmg_bonus", nullable = false)
    @Builder.Default
    private double baseElemDmgBonus = 0.0;

    @Column(name = "base_max_hp", nullable = false)
    @Builder.Default
    private double baseMaxHp = 0.0;

    @Column(name = "base_armor", nullable = false)
    @Builder.Default
    private double baseArmor = 0.0;

    @Column(name = "base_dmg_reduction", nullable = false)
    @Builder.Default
    private double baseDmgReduction = 0.0;

    @Column(name = "base_hp_regen", nullable = false)
    @Builder.Default
    private double baseHpRegen = 0.0;

    @Column(name = "base_life_steal", nullable = false)
    @Builder.Default
    private double baseLifeSteal = 0.0;

    @Column(name = "base_phys_dodge", nullable = false)
    @Builder.Default
    private double basePhysDodge = 0.0;

    @Column(name = "base_spell_evasion", nullable = false)
    @Builder.Default
    private double baseSpellEvasion = 0.0;

    @Column(name = "base_fire_res", nullable = false)
    @Builder.Default
    private double baseFireRes = 0.0;

    @Column(name = "base_cold_res", nullable = false)
    @Builder.Default
    private double baseColdRes = 0.0;

    @Column(name = "base_lightning_res", nullable = false)
    @Builder.Default
    private double baseLightningRes = 0.0;

    @Column(name = "base_chaos_res", nullable = false)
    @Builder.Default
    private double baseChaosRes = 0.0;

    @Column(name = "base_cdr", nullable = false)
    @Builder.Default
    private double baseCdr = 0.0;

    @Column(name = "base_gold_bonus", nullable = false)
    @Builder.Default
    private double baseGoldBonus = 0.0;

    @Column(name = "base_chest_drop_bonus", nullable = false)
    @Builder.Default
    private double baseChestDropBonus = 0.0;

    @Column(name = "base_exp_bonus", nullable = false)
    @Builder.Default
    private double baseExpBonus = 0.0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public StatsDto toBaseStatsDto() {
        return StatsDto.builder()
                .physAtk(basePhysAtk)
                .magicAtk(baseMagicAtk)
                .atkPercent(baseAtkPercent)
                .atkSpeed(baseAtkSpeed)
                .critRate(baseCritRate)
                .critDmg(baseCritDmg)
                .elemDmgBonus(baseElemDmgBonus)
                .maxHp(baseMaxHp)
                .armor(baseArmor)
                .dmgReduction(baseDmgReduction)
                .hpRegen(baseHpRegen)
                .lifeSteal(baseLifeSteal)
                .physDodge(basePhysDodge)
                .spellEvasion(baseSpellEvasion)
                .fireRes(baseFireRes)
                .coldRes(baseColdRes)
                .lightningRes(baseLightningRes)
                .chaosRes(baseChaosRes)
                .cdr(baseCdr)
                .goldBonus(baseGoldBonus)
                .chestDropBonus(baseChestDropBonus)
                .expBonus(baseExpBonus)
                .build();
    }

    public ItemTemplateDto toTemplateDto() {
        return ItemTemplateDto.builder()
                .id(id)
                .name(name)
                .description(description)
                .iconUrl(iconKey)
                .itemType(itemType)
                .slot(slotType)
                .requiredClass(requiredClass)
                .baseRarity(baseRarity)
                .elementalType(elementalType)
                .baseStats(toBaseStatsDto())
                .iLvlScalingFactor(ilvlScalingFactor)
                .build();
    }
}
