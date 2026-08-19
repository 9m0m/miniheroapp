package com.worldhero.service.impl;

import com.worldhero.dto.TowerFloorDto;
import com.worldhero.model.enums.HeroRole;
import com.worldhero.service.TowerFloorConfigService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class TowerFloorConfigServiceImpl implements TowerFloorConfigService {

    private final com.worldhero.service.HeroCatalogService heroCatalogService;
    private final Map<Integer, TowerFloorDto> floorsMap = new LinkedHashMap<>();

    @PostConstruct
    public void init() {
        authorAllFloors();
        validateAllFloors();
        log.info("Initialized 30 Tower Floor configs successfully.");
    }

    private void authorAllFloors() {
        // --- FLOORS 1-5: Basic Turn Order, Slots & Target Preview ---
        addFloor(1, "Goblin Outpost", "Learn turn order and basic combat attacks.", false, 1, 100, 1000,
                List.of(
                        bot("hero.fighter", "Scout Alpha", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.FRONT, 1, 98, 1050),
                        bot("hero.fighter", "Scout Beta", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.MID, 1, 98, 1050),
                        bot("hero.fighter", "Scout Gamma", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.BACK, 1, 98, 1050)
                ), List.of("TUTORIAL_SPEED"), 500, 100, 2, 5);

        addFloor(2, "Woodland Ambush", "Enemy ranged attacker focuses your frontline.", false, 2, 200, 1100,
                List.of(
                        bot("hero.fighter", "Fighter Front", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.FRONT, 2, 98, 1100),
                        bot("hero.fighter", "Fighter Mid", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.MID, 2, 98, 1100),
                        bot("hero.hunter", "Hunter Rear", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.BACK, 2, 112, 850)
                ), List.of(), 700, 120, 2, 5);

        addFloor(3, "Frontline Patrol", "High armor knight protecting dual archers.", false, 3, 300, 1200,
                List.of(
                        bot("hero.knight", "Knight Guard", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 3, 85, 1300),
                        bot("hero.ranger", "Ranger Archer A", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.MID, 3, 112, 880),
                        bot("hero.ranger", "Ranger Archer B", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.BACK, 3, 112, 880)
                ), List.of(), 900, 150, 3, 5);

        addFloor(4, "Shadow Incursion", "Stealthy rogue dives backline with AoE mage support.", false, 4, 400, 1300,
                List.of(
                        bot("hero.guardian", "Guardian Wall", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 4, 85, 1350),
                        bot("hero.rogue", "Rogue Diver", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.MID, 4, 122, 820),
                        bot("hero.wizard", "Wizard Caster", HeroRole.MAGE, com.worldhero.model.enums.GridRow.BACK, 4, 102, 850)
                ), List.of("ENEMY_TACTIC_BACKLINE_PRESSURE"), 1200, 180, 3, 5);

        addFloor(5, "Starter Vanguard Check", "Balanced trio exit gate testing starter synergy.", false, 5, 500, 1500,
                List.of(
                        bot("hero.warrior", "Arthur Champion", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.FRONT, 5, 98, 1200),
                        bot("hero.ranger", "Robin Falcon", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.MID, 5, 112, 920),
                        bot("hero.priest", "Elena Cleric", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.BACK, 5, 105, 1000)
                ), List.of("BALANCED_COMP"), 1500, 250, 5, 10);

        // --- FLOORS 6-10: Tank Guard vs Sustained Damage ---
        addFloor(6, "Iron Phalanx", "Dual knights guarding a precise hunter.", false, 6, 600, 1600,
                List.of(
                        bot("hero.knight", "Iron Knight A", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 6, 85, 1400),
                        bot("hero.knight", "Iron Knight B", HeroRole.TANK, com.worldhero.model.enums.GridRow.MID, 6, 85, 1400),
                        bot("hero.hunter", "Hunter Sniper", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.BACK, 6, 112, 950)
                ), List.of("ARMOR_BONUS"), 1800, 280, 5, 5);

        addFloor(7, "Frenzied Drums", "Bard accelerating a heavy berserker.", false, 7, 700, 1700,
                List.of(
                        bot("hero.guardian", "Guardian Shield", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 7, 85, 1450),
                        bot("hero.berserker", "Raging Berserker", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.MID, 7, 98, 1250),
                        bot("hero.bard", "Melody Bard", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.BACK, 7, 105, 1050)
                ), List.of(), 2000, 300, 6, 5);

        addFloor(8, "Heavy Bombardment", "Paladin barrier protecting dual heavy gunners.", false, 8, 800, 1800,
                List.of(
                        bot("hero.paladin", "Sanctuary Paladin", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 8, 85, 1500),
                        bot("hero.gunner", "Cannoneer Alpha", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.MID, 8, 112, 1000),
                        bot("hero.gunner", "Cannoneer Beta", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.BACK, 8, 112, 1000)
                ), List.of(), 2200, 350, 6, 5);

        addFloor(9, "Hex Bastion", "Dual guardians stall while sorcerer burns whole team.", false, 9, 900, 1900,
                List.of(
                        bot("hero.guardian", "Bastion Guard A", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 9, 85, 1550),
                        bot("hero.guardian", "Bastion Guard B", HeroRole.TANK, com.worldhero.model.enums.GridRow.MID, 9, 85, 1550),
                        bot("hero.sorcerer", "Hexfire Mage", HeroRole.MAGE, com.worldhero.model.enums.GridRow.BACK, 9, 102, 980)
                ), List.of("HEX_AURA", "ENEMY_TACTIC_CONTROL_FIRST"), 2500, 400, 8, 5);

        addFloor(10, "👑 The Stonewall Overlord", "Boss check: Colossal Guardian Boss with impenetrable defense.", true, 10, 1200, 3000,
                List.of(
                        bot("hero.guardian", "👑 Overlord Colossus", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 12, 90, 3500),
                        bot("hero.knight", "Honor Guard A", HeroRole.TANK, com.worldhero.model.enums.GridRow.MID, 10, 85, 1600),
                        bot("hero.knight", "Honor Guard B", HeroRole.TANK, com.worldhero.model.enums.GridRow.BACK, 10, 85, 1600)
                ), List.of("BOSS_BARRIER", "ENEMY_TACTIC_DEFENSIVE"), 5000, 1000, 15, 20);

        // --- FLOORS 11-15: Assassin & Evade Mechanics ---
        addFloor(11, "Triple Shadow Dive", "Triple assassin team dives low HP heroes.", false, 12, 1400, 2100,
                List.of(
                        bot("hero.slayer", "Slayer Dive", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.FRONT, 12, 122, 950),
                        bot("hero.rogue", "Rogue Feint", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.MID, 12, 122, 950),
                        bot("hero.shadow_monk", "Shadow Monk", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.BACK, 12, 122, 950)
                ), List.of("HIGH_SPEED", "ENEMY_TACTIC_FOCUS_LOW_HP"), 3000, 450, 8, 10);

        addFloor(12, "Shield & Dagger", "Knight absorbs damage while dual slayers execute.", false, 14, 1600, 2200,
                List.of(
                        bot("hero.knight", "Aegis Tank", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 14, 85, 1750),
                        bot("hero.slayer", "Slayer Left", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.MID, 14, 122, 1000),
                        bot("hero.slayer", "Slayer Right", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.BACK, 14, 122, 1000)
                ), List.of(), 3300, 500, 8, 10);

        addFloor(13, "Phantom Mirage", "Shadow monk evades first direct hit.", false, 16, 1800, 2300,
                List.of(
                        bot("hero.shadow_monk", "Phantom Monk", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.FRONT, 16, 122, 1100),
                        bot("hero.gunner", "Heavy Gunner", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.MID, 16, 112, 1150),
                        bot("hero.shaman", "Totem Shaman", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.BACK, 16, 105, 1250)
                ), List.of("EVADE_READY"), 3600, 550, 10, 10);

        addFloor(14, "Cursed Shadows", "Sorcerer AoE curser backed by dual stealth rogues.", false, 18, 2000, 2400,
                List.of(
                        bot("hero.rogue", "Shadow Rogue A", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.FRONT, 18, 122, 1150),
                        bot("hero.rogue", "Shadow Rogue B", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.MID, 18, 122, 1150),
                        bot("hero.sorcerer", "Hexfire Caster", HeroRole.MAGE, com.worldhero.model.enums.GridRow.BACK, 18, 102, 1200)
                ), List.of(), 4000, 600, 10, 10);

        addFloor(15, "Slayer Executioners", "High critical damage assassins check your tank guard.", false, 20, 2200, 2600,
                List.of(
                        bot("hero.shadow_monk", "Master Monk", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.FRONT, 20, 122, 1250),
                        bot("hero.slayer", "Apex Slayer A", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.MID, 20, 122, 1200),
                        bot("hero.slayer", "Apex Slayer B", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.BACK, 20, 122, 1200)
                ), List.of("CRIT_MASTERY"), 4500, 750, 12, 15);

        // --- FLOORS 16-20: Regen & Drain vs Healing Reduction ---
        addFloor(16, "Ancestral Sustain", "Shaman regen totem + Berserker drain cleave.", false, 22, 2400, 2700,
                List.of(
                        bot("hero.paladin", "Sanctuary Guard", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 22, 85, 2100),
                        bot("hero.berserker", "Drain Berserker", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.MID, 22, 98, 1750),
                        bot("hero.shaman", "Regen Shaman", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.BACK, 22, 105, 1500)
                ), List.of("REGEN_AURA"), 5000, 800, 12, 10);

        addFloor(17, "Totem March", "Dual shaman regen stacking with warrior vanguard.", false, 24, 2600, 2800,
                List.of(
                        bot("hero.warrior", "Vanguard Wall", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.FRONT, 24, 98, 1850),
                        bot("hero.shaman", "Totem Shaman A", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.MID, 24, 105, 1600),
                        bot("hero.shaman", "Totem Shaman B", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.BACK, 24, 105, 1600)
                ), List.of(), 5300, 850, 14, 10);

        addFloor(18, "Prismatic Radiance", "Priest cleanse and element shifting burst.", false, 26, 2800, 2900,
                List.of(
                        bot("hero.knight", "Knight Aegis", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 26, 85, 2300),
                        bot("hero.elementalist", "Prismatic Mage", HeroRole.MAGE, com.worldhero.model.enums.GridRow.MID, 26, 102, 1450),
                        bot("hero.priest", "Divine Priest", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.BACK, 26, 105, 1700)
                ), List.of(), 5600, 900, 14, 10);

        addFloor(19, "Hexfire Symphony", "Bard haste empowers hexfire and berserker.", false, 28, 3000, 3000,
                List.of(
                        bot("hero.berserker", "Frenzy Berserker", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.FRONT, 28, 98, 2050),
                        bot("hero.sorcerer", "Hexfire Master", HeroRole.MAGE, com.worldhero.model.enums.GridRow.MID, 28, 102, 1550),
                        bot("hero.bard", "Haste Bard", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.BACK, 28, 105, 1800)
                ), List.of(), 6000, 950, 16, 10);

        addFloor(20, "👑 Arch-Druid of the Wild", "Boss check: Immortal Shaman boss with massive team regeneration.", true, 30, 3500, 5000,
                List.of(
                        bot("hero.shaman", "👑 Arch-Druid Shaman", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.FRONT, 32, 110, 6000),
                        bot("hero.berserker", "Blood Berserker A", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.MID, 30, 98, 2200),
                        bot("hero.berserker", "Blood Berserker B", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.BACK, 30, 98, 2200)
                ), List.of("MASSIVE_REGEN"), 10000, 2000, 30, 30);

        // --- FLOORS 21-25: Speed Breakpoints, Haste & Control ---
        addFloor(21, "Allegro Volley", "Dual bards pushing initiative speed to maximum.", false, 32, 3800, 3200,
                List.of(
                        bot("hero.bard", "Lead Bard", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.FRONT, 32, 125, 2000),
                        bot("hero.gunner", "Rapid Gunner", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.MID, 32, 120, 1750),
                        bot("hero.bard", "Tempo Bard", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.BACK, 32, 125, 2000)
                ), List.of("SPEED_SURGE"), 7000, 1100, 18, 15);

        addFloor(22, "Swift Falcon Hunt", "High initiative slayer and falcon ranger.", false, 34, 4000, 3300,
                List.of(
                        bot("hero.slayer", "Swift Slayer", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.FRONT, 34, 122, 1750),
                        bot("hero.bard", "Songweaver", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.MID, 34, 110, 2100),
                        bot("hero.ranger", "Falcon Ranger", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.BACK, 34, 115, 1850)
                ), List.of(), 7500, 1200, 18, 15);

        addFloor(23, "Glacial Stasis", "Elementalist slows player initiative while guardian stalls.", false, 36, 4200, 3400,
                List.of(
                        bot("hero.guardian", "Frost Guardian", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 36, 85, 2900),
                        bot("hero.elementalist", "Glacial Mage", HeroRole.MAGE, com.worldhero.model.enums.GridRow.MID, 36, 102, 1850),
                        bot("hero.hunter", "Frost Hunter", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.BACK, 36, 112, 1950)
                ), List.of("SLOW_AURA"), 8000, 1300, 20, 15);

        addFloor(24, "Tempest Cadence", "Haste rhythm fueling execute and burning spells.", false, 38, 4400, 3500,
                List.of(
                        bot("hero.slayer", "Tempest Slayer", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.FRONT, 38, 122, 1950),
                        bot("hero.sorcerer", "Tempest Sorcerer", HeroRole.MAGE, com.worldhero.model.enums.GridRow.MID, 38, 102, 1950),
                        bot("hero.bard", "Cadence Bard", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.BACK, 38, 115, 2300)
                ), List.of(), 8500, 1400, 20, 15);

        addFloor(25, "Velocity Vanguard", "Exit gate: Ultimate high-speed burst composition.", false, 40, 4800, 3800,
                List.of(
                        bot("hero.shadow_monk", "Master Shadow Monk", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.FRONT, 40, 122, 2100),
                        bot("hero.gunner", "Siege Gunner", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.MID, 40, 115, 2150),
                        bot("hero.bard", "Virtuoso Bard", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.BACK, 40, 118, 2450)
                ), List.of("MAX_SPEED"), 9000, 1500, 22, 20);

        // --- FLOORS 26-30: Role Mastery & Climax Finale ---
        addFloor(26, "Sanctuary Arcana", "Paladin barrier with wizard and slayer burst.", false, 42, 5000, 4000,
                List.of(
                        bot("hero.paladin", "High Paladin", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 42, 85, 3300),
                        bot("hero.slayer", "Dread Slayer", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.MID, 42, 122, 2200),
                        bot("hero.wizard", "High Wizard", HeroRole.MAGE, com.worldhero.model.enums.GridRow.BACK, 42, 102, 2150)
                ), List.of(), 9500, 1600, 22, 15);

        addFloor(27, "Immortal Crusade", "Guardian stall + Berserker cleave + Priest divine healing.", false, 44, 5200, 4200,
                List.of(
                        bot("hero.guardian", "Dread Guardian", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 44, 85, 3500),
                        bot("hero.berserker", "Warlord Berserker", HeroRole.BRUISER, com.worldhero.model.enums.GridRow.MID, 44, 98, 2800),
                        bot("hero.priest", "High Priest", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.BACK, 44, 105, 2700)
                ), List.of(), 10000, 1700, 24, 15);

        addFloor(28, "Prismatic Arsenal", "Knight + Heavy Gunner + Prismatic Elementalist.", false, 46, 5500, 4400,
                List.of(
                        bot("hero.knight", "Knight Marshal", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 46, 85, 3650),
                        bot("hero.gunner", "Dread Cannoneer", HeroRole.MARKSMAN, com.worldhero.model.enums.GridRow.MID, 46, 112, 2500),
                        bot("hero.elementalist", "Arch-Elementalist", HeroRole.MAGE, com.worldhero.model.enums.GridRow.BACK, 46, 102, 2400)
                ), List.of(), 10500, 1800, 24, 15);

        addFloor(29, "Curse & Blade", "The final vanguard barrier before the Grand Sovereign.", false, 48, 5800, 4600,
                List.of(
                        bot("hero.paladin", "Aegis Paladin", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 48, 85, 3800),
                        bot("hero.slayer", "Nightfall Slayer", HeroRole.ASSASSIN, com.worldhero.model.enums.GridRow.MID, 48, 122, 2500),
                        bot("hero.sorcerer", "Nether Sorcerer", HeroRole.MAGE, com.worldhero.model.enums.GridRow.BACK, 48, 102, 2500)
                ), List.of(), 11000, 1900, 25, 15);

        addFloor(30, "👑 Grand Sovereign Triumph", "Season Finale Boss: Sovereign Paladin + Archmage Wizard + High Cleric Priest.", true, 50, 7000, 10000,
                List.of(
                        bot("hero.paladin", "👑 Grand Sovereign Paladin", HeroRole.TANK, com.worldhero.model.enums.GridRow.FRONT, 50, 95, 10000),
                        bot("hero.wizard", "Archmage Merlin Prime", HeroRole.MAGE, com.worldhero.model.enums.GridRow.MID, 50, 105, 3500),
                        bot("hero.priest", "High Cleric Elena Prime", HeroRole.SUPPORT, com.worldhero.model.enums.GridRow.BACK, 50, 105, 4000)
                ), List.of("SOVEREIGN_AURA", "HOLY_SANCTUARY"), 25000, 5000, 50, 50);
    }

    private void addFloor(int floorNum, String name, String desc, boolean isBoss, int recLvl, int recPwr, int baseScore,
                          List<TowerFloorDto.BotPreviewDto> bots, List<String> mods,
                          int gold, int essence, int stones, int shards) {
        floorsMap.put(floorNum, TowerFloorDto.builder()
                .floorNumber(floorNum)
                .name(name)
                .description(desc)
                .isBoss(isBoss)
                .recommendedLevel(recLvl)
                .recommendedPower(recPwr)
                .baseScore(baseScore)
                .botTrio(bots)
                .modifiers(mods)
                .firstClearReward(TowerFloorDto.RewardPreviewDto.builder()
                        .gold(gold)
                        .essence(essence)
                        .stones(stones)
                        .shards(shards)
                        .build())
                .build());
    }

        private TowerFloorDto.BotPreviewDto bot(String templateId, String name, HeroRole role, com.worldhero.model.enums.GridRow row, int level, int speed, int hp) {
        com.worldhero.model.enums.GridCol col = com.worldhero.model.enums.GridCol.CENTER;
        return TowerFloorDto.BotPreviewDto.builder()
                .templateId(templateId)
                .name(name)
                .role(role)
                .row(row)
                .col(col)
                .level(level)
                .speed(speed)
                .maxHp(hp)
                .build();
    }

        private TowerFloorDto.BotPreviewDto bot(String templateId, String name, HeroRole role, com.worldhero.model.enums.GridRow row, com.worldhero.model.enums.GridCol col, int level, int speed, int hp) {
        return TowerFloorDto.BotPreviewDto.builder()
                .templateId(templateId)
                .name(name)
                .role(role)
                .row(row)
                .col(col)
                .level(level)
                .speed(speed)
                .maxHp(hp)
                .build();
    }

    @Override
    public List<TowerFloorDto> getAllFloors() {
        return Collections.unmodifiableList(new ArrayList<>(floorsMap.values()));
    }

    @Override
    public Optional<TowerFloorDto> getFloorByNumber(int floorNumber) {
        return Optional.ofNullable(floorsMap.get(floorNumber));
    }

    private static final Set<String> KNOWN_MODIFIERS = Set.of(
        "TUTORIAL_SPEED", "BALANCED_COMP", "ARMOR_BONUS", "HIGH_SPEED", "CRIT_MASTERY",
        "REGEN_AURA", "MASSIVE_REGEN", "SLOW_AURA", "HEX_AURA", "EVADE_READY",
        "SPEED_SURGE", "MAX_SPEED", "SOVEREIGN_AURA", "BOSS_BARRIER", "HOLY_SANCTUARY",
        "ENEMY_TACTIC_CONTROL_FIRST", "ENEMY_TACTIC_FOCUS_LOW_HP", "ENEMY_TACTIC_BACKLINE_PRESSURE", "ENEMY_TACTIC_DEFENSIVE", "ENEMY_TACTIC_BALANCED",
        "TACTIC_CONTROL_FIRST", "TACTIC_FOCUS_LOW_HP", "TACTIC_BACKLINE_PRESSURE", "TACTIC_DEFENSIVE", "TACTIC_BALANCED"
    );

    @Override
    public boolean validateAllFloors() {
        if (floorsMap.size() != TOTAL_FLOORS) {
            throw new IllegalStateException("Tower floor validation failed: expected 30 floors, found " + floorsMap.size());
        }

        for (int i = 1; i <= TOTAL_FLOORS; i++) {
            TowerFloorDto floor = floorsMap.get(i);
            if (floor == null) {
                throw new IllegalStateException("Missing floor config for floor " + i);
            }
            if (floor.getBotTrio() == null || floor.getBotTrio().size() != 3) {
                throw new IllegalStateException("Floor " + i + " must have exactly 3 bots, found: " + (floor.getBotTrio() != null ? floor.getBotTrio().size() : 0));
            }
                        Set<String> cells = new HashSet<>();
            for (TowerFloorDto.BotPreviewDto bot : floor.getBotTrio()) {
                                if (bot.getTemplateId() == null || bot.getRole() == null || bot.getRow() == null || bot.getCol() == null) {
                    throw new IllegalStateException("Floor " + i + " bot is missing mandatory fields");
                }
                if (heroCatalogService.getTemplateById(bot.getTemplateId()).isEmpty()) {
                    throw new IllegalStateException("Floor " + i + " bot templateId not found in catalog: " + bot.getTemplateId());
                }
                                cells.add(bot.getRow().name() + "_" + bot.getCol().name());
            }
                        if (cells.size() != 3) {
                                throw new IllegalStateException("Floor " + i + " bots must occupy distinct grid cells");
            }

            boolean shouldBeBoss = (i == 10 || i == 20 || i == 30);
            if (floor.isBoss() != shouldBeBoss) {
                throw new IllegalStateException("Floor " + i + " boss flag mismatch. Expected: " + shouldBeBoss + ", Found: " + floor.isBoss());
            }

            if (floor.getModifiers() != null) {
                if (floor.getModifiers().size() > 2) {
                    throw new IllegalStateException("Floor " + i + " exceeds max 2 modifiers: " + floor.getModifiers().size());
                }
                for (String mod : floor.getModifiers()) {
                    if (!KNOWN_MODIFIERS.contains(mod)) {
                        throw new IllegalStateException("Floor " + i + " contains unknown modifier: " + mod);
                    }
                }
            }

            if (floor.getFirstClearReward() == null || floor.getFirstClearReward().getGold() <= 0) {
                throw new IllegalStateException("Floor " + i + " missing valid first clear reward");
            }
        }
        return true;
    }
}

