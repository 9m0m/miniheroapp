package com.worldhero.engine.tower;

import com.worldhero.dto.HeroTemplateDto;
import com.worldhero.model.enums.HeroRole;
import com.worldhero.model.enums.TargetRule;
import com.worldhero.model.enums.TeamTactic;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Slf4j
public class TurnBattleEngine {

    public static final int MAX_ROUNDS = 10;
    public static final int STARTING_ENERGY = 2;
    public static final int MAX_ENERGY = 5;

    public TowerBattleResult resolveBattle(List<TowerEntity> combatants, List<String> floorModifiers, long seed, int floorBaseScore) {
        return resolveBattle(combatants, floorModifiers, seed, floorBaseScore, com.worldhero.model.enums.TeamTactic.BALANCED);
    }

    /**
     * Resolves a full 3v3 battle deterministically given the initial combatants, floor modifiers, seed, and tactic.
     */
    public TowerBattleResult resolveBattle(List<TowerEntity> combatants, List<String> floorModifiers, long seed, int floorBaseScore, com.worldhero.model.enums.TeamTactic tactic) {
        Random random = new Random(seed);
        List<TowerReplayEvent> replayEvents = new ArrayList<>();
        int[] seqRef = {1};

        // 1. Apply Passives to all combatants
        applyPassives(combatants);

        // 2. Apply floor modifiers
        applyFloorModifiers(combatants, floorModifiers);

        // Capture true initial combatants snapshot right after pre-combat modifiers (Frame 0)
        List<TowerEntity> initialCombatants = deepCloneCombatants(combatants);

        int totalPlayerInitialHp = combatants.stream()
                .filter(e -> e.getSide() == TowerSide.PLAYER)
                .mapToInt(TowerEntity::getMaxHp)
                .sum();

        int totalEnemyInitialHp = combatants.stream()
                .filter(e -> e.getSide() == TowerSide.ENEMY)
                .mapToInt(TowerEntity::getMaxHp)
                .sum();

        int round = 1;
        TowerSide winner = null;

        int playerEnergy = STARTING_ENERGY;
        int enemyEnergy = STARTING_ENERGY;

        while (round <= MAX_ROUNDS && winner == null) {
            // Energy accumulation on Rounds 2-5
            if (round > 1) {
                playerEnergy = Math.min(MAX_ENERGY, playerEnergy + 1);
                enemyEnergy = Math.min(MAX_ENERGY, enemyEnergy + 1);
            }

            // 1. Snapshot Initiative Order for living combatants
            List<TowerEntity> roundOrder = resolveRoundOrder(combatants, round);
            List<String> turnOrderIds = roundOrder.stream().map(TowerEntity::getEntityId).toList();

            // Emit ROUND_START with energy and turn order snapshot
            replayEvents.add(TowerReplayEvent.builder()
                    .sequenceNumber(seqRef[0]++)
                    .round(round)
                    .eventType(TowerReplayEvent.EventType.ROUND_START)
                    .details(Map.of(
                            "roundNumber", round,
                            "playerEnergy", playerEnergy,
                            "enemyEnergy", enemyEnergy,
                            "turnOrder", turnOrderIds,
                            "tactic", tactic != null ? tactic.name() : "BALANCED"
                    ))
                    .build());

            // 2. Execute turns in snapshot order
            for (int turnIdx = 0; turnIdx < roundOrder.size(); turnIdx++) {
                TowerEntity actor = roundOrder.get(turnIdx);
                if (actor.isDowned()) continue;

                // Check side wipeout
                TowerSide earlyWinner = evaluateSideWipeout(combatants);
                if (earlyWinner != null) {
                    winner = earlyWinner;
                    break;
                }

                // Determine actor tactic
                TeamTactic enemyTactic = TeamTactic.BALANCED;
                if (floorModifiers != null) {
                    if (floorModifiers.contains("TACTIC_CONTROL_FIRST") || floorModifiers.contains("ENEMY_TACTIC_CONTROL_FIRST")) {
                        enemyTactic = TeamTactic.CONTROL_FIRST;
                    } else if (floorModifiers.contains("TACTIC_FOCUS_LOW_HP") || floorModifiers.contains("ENEMY_TACTIC_FOCUS_LOW_HP")) {
                        enemyTactic = TeamTactic.FOCUS_LOW_HP;
                    } else if (floorModifiers.contains("TACTIC_BACKLINE_PRESSURE") || floorModifiers.contains("ENEMY_TACTIC_BACKLINE_PRESSURE")) {
                        enemyTactic = TeamTactic.BACKLINE_PRESSURE;
                    } else if (floorModifiers.contains("TACTIC_DEFENSIVE") || floorModifiers.contains("ENEMY_TACTIC_DEFENSIVE")) {
                        enemyTactic = TeamTactic.DEFENSIVE;
                    }
                }
                TeamTactic actorTactic = (actor.getSide() == TowerSide.PLAYER)
                        ? (tactic != null ? tactic : TeamTactic.BALANCED)
                        : enemyTactic;

                // Action start
                replayEvents.add(TowerReplayEvent.builder()
                        .sequenceNumber(seqRef[0]++)
                        .round(round)
                        .eventType(TowerReplayEvent.EventType.ACTION_START)
                        .sourceEntityId(actor.getEntityId())
                        .details(Map.of(
                                "tactic", actorTactic.name()
                        ))
                        .build());

                // Choose Skill with Team Energy & Reservation check and Team Tactic
                int currentEnergy = actor.getSide() == TowerSide.PLAYER ? playerEnergy : enemyEnergy;
                List<TowerEntity> remainingTurnOrder = roundOrder.subList(turnIdx, roundOrder.size());

                TowerSkill skill = TowerAiPolicy.chooseSkill(actor, combatants, currentEnergy, remainingTurnOrder, actorTactic);

                // Deduct Team Energy if skill is cast
                if (skill.getSkillType() == TowerSkill.SkillType.UNIQUE && skill.getEnergyCost() > 0) {
                    if (actor.getSide() == TowerSide.PLAYER) {
                        playerEnergy = Math.max(0, playerEnergy - skill.getEnergyCost());
                    } else {
                        enemyEnergy = Math.max(0, enemyEnergy - skill.getEnergyCost());
                    }
                }

                int remainingSideEnergy = actor.getSide() == TowerSide.PLAYER ? playerEnergy : enemyEnergy;

                replayEvents.add(TowerReplayEvent.builder()
                        .sequenceNumber(seqRef[0]++)
                        .round(round)
                        .eventType(TowerReplayEvent.EventType.SKILL_USE)
                        .sourceEntityId(actor.getEntityId())
                        .skillId(skill.getId())
                        .skillName(skill.getName())
                        .details(Map.of(
                                "energyCost", skill.getEnergyCost(),
                                "remainingEnergy", remainingSideEnergy
                        ))
                        .build());

                // Select Targets using strict 3x3 Grid Column Cover and Team Tactic
                List<TowerEntity> targets = TowerAiPolicy.selectTargets(actor, skill.getTargetRule(), combatants, actorTactic);
                int totalDirectDamageToHpThisAction = 0;

                for (TowerEntity target : targets) {
                    if (target.isDowned() && skill.getHealMultiplier() <= 0) {
                        continue;
                    }

                    // Check Heal
                    if (skill.getHealMultiplier() > 0) {
                        int rawHeal = TowerCombatMath.calculateHeal(actor.getEffectiveStats().getAtk(), skill.getHealMultiplier());
                        int actualHeal = target.applyHeal(rawHeal);

                        replayEvents.add(TowerReplayEvent.builder()
                                .sequenceNumber(seqRef[0]++)
                                .round(round)
                                .eventType(TowerReplayEvent.EventType.HEAL_APPLIED)
                                .sourceEntityId(actor.getEntityId())
                                .targetEntityId(target.getEntityId())
                                .amount(actualHeal)
                                .targetRemainingHp(target.getCurrentHp())
                                .targetMaxHp(target.getMaxHp())
                                .details(Map.of(
                                        "rawHeal", rawHeal,
                                        "actualHeal", actualHeal,
                                        "targetRemainingHp", target.getCurrentHp()
                                ))
                                .build());
                        continue;
                    }

                    // Offensive Damage
                    boolean isEvaded = !skill.isUnavoidable() && target.hasEvade();
                    if (isEvaded) {
                        target.consumeEvade();
                        replayEvents.add(TowerReplayEvent.builder()
                                .sequenceNumber(seqRef[0]++)
                                .round(round)
                                .eventType(TowerReplayEvent.EventType.DAMAGE_APPLIED)
                                .sourceEntityId(actor.getEntityId())
                                .targetEntityId(target.getEntityId())
                                .amount(0)
                                .isEvaded(true)
                                .targetRemainingHp(target.getCurrentHp())
                                .targetMaxHp(target.getMaxHp())
                                .details(Map.of("isEvaded", true, "targetRemainingHp", target.getCurrentHp()))
                                .build());
                        continue;
                    }

                    // Calculate damage
                    boolean isCrit = TowerCombatMath.rollCrit(actor.getEffectiveStats().getCritRate(), random);
                    int rawDamage = TowerCombatMath.calculateDamage(
                            actor.getEffectiveStats().getAtk(),
                            skill.getDamageMultiplier(),
                            target.getEffectiveStats().getArmor(),
                            isCrit,
                            actor.getEffectiveStats().getCritDmg()
                    );

                    int initialHp = target.getCurrentHp();
                    int shieldAbsorbed = target.takeDamage(rawDamage);
                    int hpDamageDealt = initialHp - target.getCurrentHp();
                    totalDirectDamageToHpThisAction += hpDamageDealt;

                    replayEvents.add(TowerReplayEvent.builder()
                            .sequenceNumber(seqRef[0]++)
                            .round(round)
                            .eventType(TowerReplayEvent.EventType.DAMAGE_APPLIED)
                            .sourceEntityId(actor.getEntityId())
                            .targetEntityId(target.getEntityId())
                            .amount(rawDamage)
                            .isCrit(isCrit)
                            .isEvaded(false)
                            .targetRemainingHp(target.getCurrentHp())
                            .targetMaxHp(target.getMaxHp())
                            .targetShield(target.getShield())
                            .details(Map.of(
                                    "rawDamage", rawDamage,
                                    "shieldAbsorbed", shieldAbsorbed,
                                    "actualHpDamage", hpDamageDealt,
                                    "isCrit", isCrit,
                                    "isEvaded", false,
                                    "targetRemainingHp", target.getCurrentHp()
                            ))
                            .build());

                    // Check Downed
                    if (target.isDowned()) {
                        replayEvents.add(TowerReplayEvent.builder()
                                .sequenceNumber(seqRef[0]++)
                                .round(round)
                                .eventType(TowerReplayEvent.EventType.ENTITY_DOWN)
                                .targetEntityId(target.getEntityId())
                                .build());
                    }
                }

                // Apply self/target buff & debuff effects attached to skill
                if (skill.getAppliedEffects() != null) {
                    for (TowerEffectState effectTemplate : skill.getAppliedEffects()) {
                        TowerEntity effectTarget = (effectTemplate.getOpcode() == EffectOpcode.SHIELD ||
                                effectTemplate.getOpcode() == EffectOpcode.EVADE ||
                                effectTemplate.getOpcode() == EffectOpcode.REGEN ||
                                effectTemplate.getOpcode() == EffectOpcode.DRAIN) ? actor : (!targets.isEmpty() ? targets.get(0) : null);

                        if (effectTarget != null && !effectTarget.isDowned()) {
                            applyEffectToEntity(effectTarget, effectTemplate, totalDirectDamageToHpThisAction, round, seqRef, replayEvents);
                        }
                    }
                }
            }

            // 3. End of round tick: Apply HoT (Regen) and process active effect expirations
            if (winner == null) {
                applyRoundEndTicks(combatants, round, seqRef, replayEvents);
            }

            // Check side wipeout at round end
            if (winner == null) {
                winner = evaluateSideWipeout(combatants);
            }

            replayEvents.add(TowerReplayEvent.builder()
                    .sequenceNumber(seqRef[0]++)
                    .round(round)
                    .eventType(TowerReplayEvent.EventType.ROUND_END)
                    .details(Map.of(
                            "roundNumber", round,
                            "playerEnergy", playerEnergy,
                            "enemyEnergy", enemyEnergy
                    ))
                    .build());

            round++;
        }

        int totalRoundsUsed = Math.min(MAX_ROUNDS, round - 1);

        // 5-Round Resolution: Canonical contract:
        // If any enemy survives after 5 rounds -> ENEMY wins (Player loss).
        // Simultaneous wipe (0 player alive and 0 enemy alive) -> ENEMY wins (Player loss).
        // Player only wins if all enemies are defeated and at least 1 player unit is alive.
        if (winner == null) {
            long livingEnemyCount = combatants.stream().filter(e -> e.getSide() == TowerSide.ENEMY && !e.isDowned()).count();
            long livingPlayerCount = combatants.stream().filter(e -> e.getSide() == TowerSide.PLAYER && !e.isDowned()).count();

            if (livingEnemyCount == 0 && livingPlayerCount > 0) {
                winner = TowerSide.PLAYER;
            } else {
                winner = TowerSide.ENEMY; // Any living enemy or simultaneous wipe = Player loss
            }
        }

        // Calculate score
        int totalPlayerRemainingHp = combatants.stream()
                .filter(e -> e.getSide() == TowerSide.PLAYER)
                .mapToInt(TowerEntity::getCurrentHp)
                .sum();

        double remainingHpPercent = totalPlayerInitialHp > 0
                ? ((double) totalPlayerRemainingHp / totalPlayerInitialHp) * 100.0
                : 0.0;

        int score = TowerCombatMath.calculateBattleScore(winner, totalRoundsUsed, remainingHpPercent, floorBaseScore);

        replayEvents.add(TowerReplayEvent.builder()
                .sequenceNumber(seqRef[0]++)
                .round(totalRoundsUsed)
                .eventType(TowerReplayEvent.EventType.BATTLE_END)
                .details(Map.of(
                        "winner", winner.name(),
                        "roundsUsed", totalRoundsUsed,
                        "score", score,
                        "remainingHpPercent", remainingHpPercent
                ))
                .build());

        return TowerBattleResult.builder()
                .winner(winner)
                .roundsUsed(totalRoundsUsed)
                .calculatedScore(score)
                .remainingPlayerHpPercent(remainingHpPercent)
                .initialCombatants(initialCombatants)
                .replayEvents(replayEvents)
                .build();
    }

    private List<TowerEntity> resolveRoundOrder(List<TowerEntity> combatants, int roundNumber) {
        return InitiativeResolver.resolveInitiative(combatants, roundNumber);
    }

    private void applyEffectToEntity(TowerEntity target, TowerEffectState template, int directDamageDealt, int round, int[] seqRef, List<TowerReplayEvent> replayEvents) {
        if (target.isDowned()) return;

        switch (template.getOpcode()) {
            case SHIELD -> {
                int shieldAmount = (int) template.getValue();
                target.applyShield(shieldAmount);
                replayEvents.add(TowerReplayEvent.builder()
                        .sequenceNumber(seqRef[0]++)
                        .round(round)
                        .eventType(TowerReplayEvent.EventType.EFFECT_APPLIED)
                        .targetEntityId(target.getEntityId())
                        .effectOpcode("SHIELD")
                        .amount(shieldAmount)
                        .targetRemainingHp(target.getCurrentHp())
                        .targetMaxHp(target.getMaxHp())
                        .targetShield(target.getShield())
                        .details(Map.of("shieldAmount", shieldAmount, "totalShield", target.getShield()))
                        .build());
            }
            case EVADE -> {
                target.addEvade();
                replayEvents.add(TowerReplayEvent.builder()
                        .sequenceNumber(seqRef[0]++)
                        .round(round)
                        .eventType(TowerReplayEvent.EventType.EFFECT_APPLIED)
                        .targetEntityId(target.getEntityId())
                        .effectOpcode("EVADE")
                        .details(Map.of("effect", "EVADE", "evadeCharges", target.getEvadeCharges()))
                        .build());
            }
            case DRAIN -> {
                if (directDamageDealt > 0) {
                    int healAmount = (int) Math.round(directDamageDealt * (template.getValue() / 100.0));
                    int actualHeal = target.applyHeal(healAmount);
                    replayEvents.add(TowerReplayEvent.builder()
                            .sequenceNumber(seqRef[0]++)
                            .round(round)
                            .eventType(TowerReplayEvent.EventType.HEAL_APPLIED)
                            .sourceEntityId(target.getEntityId())
                            .targetEntityId(target.getEntityId())
                            .amount(actualHeal)
                            .targetRemainingHp(target.getCurrentHp())
                            .targetMaxHp(target.getMaxHp())
                            .details(Map.of("isDrain", true, "actualHeal", actualHeal, "targetRemainingHp", target.getCurrentHp()))
                            .build());
                }
            }
            case ARMOR_BREAK -> {
                int reduction = (int) template.getValue();
                target.getEffectiveStats().setArmor(Math.max(0, target.getEffectiveStats().getArmor() - reduction));
                target.getActiveEffects().add(TowerEffectState.builder()
                        .opcode(EffectOpcode.ARMOR_BREAK)
                        .value(reduction)
                        .appliedDelta(reduction)
                        .remainingDuration(template.getRemainingDuration())
                        .build());
            }
            case SLOW -> {
                int speedReduction = (int) template.getValue();
                target.getEffectiveStats().setSpeed(Math.max(60, target.getEffectiveStats().getSpeed() - speedReduction));
                target.getActiveEffects().add(TowerEffectState.builder()
                        .opcode(EffectOpcode.SLOW)
                        .value(speedReduction)
                        .appliedDelta(speedReduction)
                        .remainingDuration(template.getRemainingDuration())
                        .build());
            }
            default -> {}
        }
    }

    private void applyRoundEndTicks(List<TowerEntity> combatants, int round, int[] seqRef, List<TowerReplayEvent> replayEvents) {
        for (TowerEntity e : combatants) {
            if (e.isDowned()) continue;

            // Regen HoT: 3% per stack (max 6%)
            if (e.getRegenStacks() > 0) {
                double regenPercent = 0.03 * e.getRegenStacks();
                int rawRegen = (int) Math.round(e.getMaxHp() * regenPercent);
                int actualRegen = e.applyHeal(rawRegen);
                if (actualRegen > 0) {
                    replayEvents.add(TowerReplayEvent.builder()
                            .sequenceNumber(seqRef[0]++)
                            .round(round)
                            .eventType(TowerReplayEvent.EventType.HEAL_APPLIED)
                            .targetEntityId(e.getEntityId())
                            .amount(actualRegen)
                            .targetRemainingHp(e.getCurrentHp())
                            .targetMaxHp(e.getMaxHp())
                            .details(Map.of("isRegenHoT", true, "actualHeal", actualRegen, "targetRemainingHp", e.getCurrentHp()))
                            .build());
                }
            }

            // Decrement active effects duration and revert expired
            Iterator<TowerEffectState> iter = e.getActiveEffects().iterator();
            while (iter.hasNext()) {
                TowerEffectState eff = iter.next();
                if (eff.getRemainingDuration() > 0) {
                    eff.setRemainingDuration(eff.getRemainingDuration() - 1);
                    if (eff.getRemainingDuration() == 0) {
                        revertEffect(e, eff);
                        iter.remove();
                    }
                }
            }
        }
    }

    private void revertEffect(TowerEntity entity, TowerEffectState eff) {
        switch (eff.getOpcode()) {
            case ARMOR_BREAK -> entity.getEffectiveStats().setArmor((int) Math.round(entity.getEffectiveStats().getArmor() + eff.getAppliedDelta()));
            case SLOW -> entity.getEffectiveStats().setSpeed((int) Math.min(180, Math.round(entity.getEffectiveStats().getSpeed() + eff.getAppliedDelta())));
            case SHIELD -> entity.setShield(Math.max(0, entity.getShield() - eff.getRemainingShield()));
            default -> {}
        }
    }

    private void applyPassives(List<TowerEntity> combatants) {
        for (TowerEntity e : combatants) {
            String passiveId = e.getPassiveSkillId();
            if (passiveId == null) continue;

            switch (passiveId) {
                case "iron_aegis" -> e.getEffectiveStats().setArmor(e.getEffectiveStats().getArmor() + 15);
                case "stone_skin" -> e.getEffectiveStats().setArmor(e.getEffectiveStats().getArmor() + 20);
                case "holy_barrier" -> e.applyShield((int) (e.getMaxHp() * 0.15));
                case "shackles_aura" -> {
                    for (TowerEntity other : combatants) {
                        if (other.getSide() != e.getSide()) {
                            other.getEffectiveStats().setSpeed(Math.max(60, other.getEffectiveStats().getSpeed() - 10));
                        }
                    }
                }
                case "vanguard_heart" -> {
                    e.getEffectiveStats().setAtk((int) (e.getEffectiveStats().getAtk() * 1.05));
                    e.getEffectiveStats().setMaxHp((int) (e.getEffectiveStats().getMaxHp() * 1.05));
                    e.setMaxHp(e.getEffectiveStats().getMaxHp());
                    e.setCurrentHp(e.getMaxHp());
                }
                case "inner_focus" -> e.getEffectiveStats().setAtk((int) (e.getEffectiveStats().getAtk() * 1.08));
                case "fury_stack" -> e.getEffectiveStats().setCritDmg(Math.min(200.0, e.getEffectiveStats().getCritDmg() + 10.0));
                case "momentum" -> e.getEffectiveStats().setSpeed(Math.min(180, e.getEffectiveStats().getSpeed() + 10));
                case "executioner_eye" -> {
                    e.getEffectiveStats().setCritRate(Math.min(TowerCombatMath.MAX_CRIT_RATE, e.getEffectiveStats().getCritRate() + 5.0));
                    e.getEffectiveStats().setCritDmg(Math.min(200.0, e.getEffectiveStats().getCritDmg() + 10.0));
                }
                case "counter_stance" -> {
                    e.getEffectiveStats().setArmor(e.getEffectiveStats().getArmor() + 10);
                    e.getEffectiveStats().setSpeed(Math.min(180, e.getEffectiveStats().getSpeed() + 5));
                }
                case "shadow_cloak" -> e.addEvade();
                case "soul_reap" -> e.getEffectiveStats().setAtk((int) (e.getEffectiveStats().getAtk() * 1.10));
                case "eagle_eye" -> {
                    e.getEffectiveStats().setCritRate(Math.min(TowerCombatMath.MAX_CRIT_RATE, e.getEffectiveStats().getCritRate() + 5.0));
                    e.getEffectiveStats().setSpeed(Math.min(180, e.getEffectiveStats().getSpeed() + 10));
                }
                case "trap_mastery" -> e.getEffectiveStats().setCritRate(Math.min(TowerCombatMath.MAX_CRIT_RATE, e.getEffectiveStats().getCritRate() + 5.0));
                case "rapid_fire" -> e.getEffectiveStats().setSpeed(Math.min(180, e.getEffectiveStats().getSpeed() + 12));
                case "beast_bond" -> {
                    e.getEffectiveStats().setMaxHp((int) (e.getEffectiveStats().getMaxHp() * 1.05));
                    e.getEffectiveStats().setArmor((int) (e.getEffectiveStats().getArmor() * 1.05));
                    e.setMaxHp(e.getEffectiveStats().getMaxHp());
                    e.setCurrentHp(e.getMaxHp());
                }
                case "mana_surge" -> e.getEffectiveStats().setAtk((int) (e.getEffectiveStats().getAtk() * 1.08));
                case "hex_resonance" -> {
                    e.getEffectiveStats().setAtk((int) (e.getEffectiveStats().getAtk() * 1.05));
                    e.getEffectiveStats().setCritRate(Math.min(TowerCombatMath.MAX_CRIT_RATE, e.getEffectiveStats().getCritRate() + 5.0));
                }
                case "elemental_flow" -> {
                    e.getEffectiveStats().setSpeed(Math.min(180, e.getEffectiveStats().getSpeed() + 10));
                    e.getEffectiveStats().setAtk((int) (e.getEffectiveStats().getAtk() * 1.05));
                }
                case "curse_link" -> e.getEffectiveStats().setAtk((int) (e.getEffectiveStats().getAtk() * 1.10));
                case "divine_grace" -> {
                    e.getEffectiveStats().setMaxHp((int) (e.getEffectiveStats().getMaxHp() * 1.05));
                    e.getEffectiveStats().setArmor(e.getEffectiveStats().getArmor() + 10);
                    e.setMaxHp(e.getEffectiveStats().getMaxHp());
                    e.setCurrentHp(e.getMaxHp());
                }
                case "tempo_melody" -> e.getEffectiveStats().setSpeed(Math.min(180, e.getEffectiveStats().getSpeed() + 15));
                case "ancestral_ward" -> e.applyShield((int) (e.getMaxHp() * 0.10));
                case "alchemical_catalyst" -> {
                    e.getEffectiveStats().setAtk((int) (e.getEffectiveStats().getAtk() * 1.05));
                    e.getEffectiveStats().setMaxHp((int) (e.getEffectiveStats().getMaxHp() * 1.05));
                    e.setMaxHp(e.getEffectiveStats().getMaxHp());
                    e.setCurrentHp(e.getMaxHp());
                }
                default -> {}
            }
        }
    }

    private void applyFloorModifiers(List<TowerEntity> combatants, List<String> modifiers) {
        if (modifiers == null || modifiers.isEmpty()) return;

        for (String mod : modifiers) {
            switch (mod) {
                case "BALANCED_COMP" -> {
                    Set<HeroRole> playerRoles = new HashSet<>();
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.PLAYER) playerRoles.add(e.getRole());
                    }
                    if (playerRoles.size() >= 3) {
                        for (TowerEntity e : combatants) {
                            if (e.getSide() == TowerSide.PLAYER) {
                                e.getEffectiveStats().setAtk((int) Math.round(e.getEffectiveStats().getAtk() * 1.05));
                                e.getEffectiveStats().setArmor((int) Math.round(e.getEffectiveStats().getArmor() * 1.05));
                                e.getEffectiveStats().setMaxHp((int) Math.round(e.getEffectiveStats().getMaxHp() * 1.05));
                                e.setMaxHp(e.getEffectiveStats().getMaxHp());
                                e.setCurrentHp(e.getMaxHp());
                            }
                        }
                    }
                }
                case "CRIT_MASTERY" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.ENEMY && e.getRole() == HeroRole.ASSASSIN) {
                            e.getEffectiveStats().setCritRate(Math.min(TowerCombatMath.MAX_CRIT_RATE, e.getEffectiveStats().getCritRate() + 15.0));
                            e.getEffectiveStats().setCritDmg(Math.min(200.0, e.getEffectiveStats().getCritDmg() + 25.0));
                        }
                    }
                }
                case "TUTORIAL_SPEED" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.PLAYER) {
                            e.getEffectiveStats().setSpeed(Math.min(180, e.getEffectiveStats().getSpeed() + 10));
                        }
                    }
                }
                case "ARMOR_BONUS" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.ENEMY) {
                            e.getEffectiveStats().setArmor(e.getEffectiveStats().getArmor() + 30);
                        }
                    }
                }
                case "HIGH_SPEED" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.ENEMY) {
                            e.getEffectiveStats().setSpeed(Math.min(180, e.getEffectiveStats().getSpeed() + 20));
                        }
                    }
                }
                case "REGEN_AURA" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.ENEMY) {
                            e.setRegenStacks(Math.min(2, e.getRegenStacks() + 1));
                        }
                    }
                }
                case "MASSIVE_REGEN" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.ENEMY) {
                            e.setRegenStacks(2);
                        }
                    }
                }
                case "SLOW_AURA" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.PLAYER) {
                            e.getEffectiveStats().setSpeed(Math.max(60, e.getEffectiveStats().getSpeed() - 20));
                        }
                    }
                }
                case "HEX_AURA" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.PLAYER) {
                            e.getEffectiveStats().setArmor(Math.max(0, e.getEffectiveStats().getArmor() - 25));
                        }
                    }
                }
                case "EVADE_READY" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.ENEMY && e.getGridRow() == com.worldhero.model.enums.GridRow.FRONT) {
                            e.addEvade();
                        }
                    }
                }
                case "SPEED_SURGE" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.ENEMY) {
                            e.getEffectiveStats().setSpeed(Math.min(180, e.getEffectiveStats().getSpeed() + 15));
                        }
                    }
                }
                case "MAX_SPEED" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.ENEMY) {
                            e.getEffectiveStats().setSpeed(Math.min(180, e.getEffectiveStats().getSpeed() + 25));
                        }
                    }
                }
                case "SOVEREIGN_AURA", "BOSS_BARRIER" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.ENEMY && e.getGridRow() == com.worldhero.model.enums.GridRow.FRONT) {
                            e.applyShield((int) (e.getMaxHp() * 0.20));
                        }
                    }
                }
                case "HOLY_SANCTUARY" -> {
                    for (TowerEntity e : combatants) {
                        if (e.getSide() == TowerSide.ENEMY) {
                            e.applyShield((int) (e.getMaxHp() * 0.15));
                        }
                    }
                }
            }
        }
    }

    private boolean checkSideAllDowned(List<TowerEntity> combatants, TowerSide side) {
        return combatants.stream()
                .filter(e -> e.getSide() == side)
                .allMatch(TowerEntity::isDowned);
    }

    private TowerSide evaluateSideWipeout(List<TowerEntity> combatants) {
        boolean enemyAllDown = checkSideAllDowned(combatants, TowerSide.ENEMY);
        boolean playerAllDown = checkSideAllDowned(combatants, TowerSide.PLAYER);

        if (playerAllDown && enemyAllDown) {
            return TowerSide.ENEMY; // Simultaneous wipe is strictly Player loss
        }
        if (playerAllDown) {
            return TowerSide.ENEMY;
        }
        if (enemyAllDown) {
            return TowerSide.PLAYER;
        }
        return null;
    }

    public void attachSkillsForTemplate(TowerEntity entity, HeroTemplateDto template) {
        List<TowerSkill> skills = new ArrayList<>();

        if (template != null) {
            entity.setPassiveSkillId(template.getPassiveSkillId());
        }

        // 1. Basic Attack: Deals 1.0x damage to EXPOSED_SINGLE for 0 energy
        skills.add(TowerSkill.builder()
                .id("basic_attack")
                .name("Basic Attack")
                .skillType(TowerSkill.SkillType.BASIC)
                .energyCost(0)
                .targetRule(TargetRule.EXPOSED_SINGLE)
                .damageMultiplier(1.0)
                .healMultiplier(0.0)
                .build());

        String uniqueSkillId = template != null && template.getUniqueSkillId() != null
                ? template.getUniqueSkillId()
                : "vanguard_cleave";

        // 2. Author the 24 Canonical Unique Skills with energyCost (2, 3, or 4)
        switch (uniqueSkillId) {
            // TANK (4)
            case "aegis_intercept" -> skills.add(TowerSkill.builder()
                    .id("aegis_intercept")
                    .name("Aegis Intercept")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.EXPOSED_SINGLE)
                    .damageMultiplier(1.4)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.SHIELD).value(entity.getMaxHp() * 0.15).remainingDuration(2).build()
                    ))
                    .build());
            case "stonewall_taunt" -> skills.add(TowerSkill.builder()
                    .id("stonewall_taunt")
                    .name("Stonewall Taunt")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.EXPOSED_SINGLE)
                    .damageMultiplier(1.3)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.SHIELD).value(entity.getMaxHp() * 0.20).remainingDuration(2).build()
                    ))
                    .build());
            case "sanctuary_shield" -> skills.add(TowerSkill.builder()
                    .id("sanctuary_shield")
                    .name("Sanctuary Shield")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.EXPOSED_SINGLE)
                    .damageMultiplier(1.3)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.SHIELD).value(entity.getMaxHp() * 0.20).remainingDuration(2).build()
                    ))
                    .build());
            case "chain_lock" -> skills.add(TowerSkill.builder()
                    .id("chain_lock")
                    .name("Chain Lock")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.EXPOSED_SINGLE)
                    .damageMultiplier(1.35)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.SLOW).value(20.0).remainingDuration(2).build()
                    ))
                    .build());

            // BRUISER (4)
            case "vanguard_cleave" -> skills.add(TowerSkill.builder()
                    .id("vanguard_cleave")
                    .name("Vanguard Cleave")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.ALL_ENEMIES)
                    .damageMultiplier(1.3)
                    .build());
            case "breaking_combo" -> skills.add(TowerSkill.builder()
                    .id("breaking_combo")
                    .name("Breaking Combo")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(2)
                    .targetRule(TargetRule.EXPOSED_SINGLE)
                    .damageMultiplier(1.65)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.ARMOR_BREAK).value(20.0).remainingDuration(2).build()
                    ))
                    .build());
            case "blood_tempo" -> skills.add(TowerSkill.builder()
                    .id("blood_tempo")
                    .name("Blood Tempo")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.ALL_ENEMIES)
                    .damageMultiplier(1.25)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.DRAIN).value(20.0).build()
                    ))
                    .build());
            case "line_breaker" -> skills.add(TowerSkill.builder()
                    .id("line_breaker")
                    .name("Line Breaker")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(2)
                    .targetRule(TargetRule.EXPOSED_SINGLE)
                    .damageMultiplier(1.8)
                    .build());

            // ASSASSIN (4)
            case "backline_execute" -> skills.add(TowerSkill.builder()
                    .id("backline_execute")
                    .name("Backline Execute")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(4)
                    .targetRule(TargetRule.BACKMOST_ENEMY)
                    .damageMultiplier(2.2)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.EVADE).remainingDuration(1).build(),
                            TowerEffectState.builder().opcode(EffectOpcode.DRAIN).value(25.0).build()
                    ))
                    .build());
            case "counter_step" -> skills.add(TowerSkill.builder()
                    .id("counter_step")
                    .name("Counter Step")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.BACKMOST_ENEMY)
                    .damageMultiplier(2.0)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.EVADE).remainingDuration(1).build()
                    ))
                    .build());
            case "smoke_feint" -> skills.add(TowerSkill.builder()
                    .id("smoke_feint")
                    .name("Smoke Feint")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.BACKMOST_ENEMY)
                    .damageMultiplier(2.1)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.EVADE).remainingDuration(1).build()
                    ))
                    .build());
            case "soul_harvest" -> skills.add(TowerSkill.builder()
                    .id("soul_harvest")
                    .name("Soul Harvest")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(4)
                    .targetRule(TargetRule.BACKMOST_ENEMY)
                    .damageMultiplier(2.3)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.DRAIN).value(30.0).build()
                    ))
                    .build());

            // MARKSMAN (4)
            case "falcon_mark" -> skills.add(TowerSkill.builder()
                    .id("falcon_mark")
                    .name("Falcon Mark")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(2)
                    .targetRule(TargetRule.EXPOSED_SINGLE)
                    .damageMultiplier(1.5)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.ARMOR_BREAK).value(15.0).remainingDuration(2).build()
                    ))
                    .build());
            case "snare_trap" -> skills.add(TowerSkill.builder()
                    .id("snare_trap")
                    .name("Snare Trap")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(2)
                    .targetRule(TargetRule.EXPOSED_SINGLE)
                    .damageMultiplier(1.4)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.SLOW).value(25.0).remainingDuration(2).build()
                    ))
                    .build());
            case "suppressing_volley" -> skills.add(TowerSkill.builder()
                    .id("suppressing_volley")
                    .name("Suppressing Volley")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.SAME_COLUMN)
                    .damageMultiplier(1.2)
                    .build());
            case "companion_guard" -> skills.add(TowerSkill.builder()
                    .id("companion_guard")
                    .name("Companion Guard")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(2)
                    .targetRule(TargetRule.EXPOSED_SINGLE)
                    .damageMultiplier(1.35)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.SHIELD).value(entity.getMaxHp() * 0.15).remainingDuration(2).build()
                    ))
                    .build());

            // MAGE (4)
            case "arc_storm" -> skills.add(TowerSkill.builder()
                    .id("arc_storm")
                    .name("Arc Storm")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(4)
                    .targetRule(TargetRule.ALL_ENEMIES)
                    .damageMultiplier(1.4)
                    .build());
            case "hexfire_blast" -> skills.add(TowerSkill.builder()
                    .id("hexfire_blast")
                    .name("Hexfire Blast")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.EXPOSED_SINGLE)
                    .damageMultiplier(1.9)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.ARMOR_BREAK).value(25.0).remainingDuration(2).build()
                    ))
                    .build());
            case "element_shift" -> skills.add(TowerSkill.builder()
                    .id("element_shift")
                    .name("Element Shift")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.FULL_ROW)
                    .damageMultiplier(1.5)
                    .build());
            case "binding_curse" -> skills.add(TowerSkill.builder()
                    .id("binding_curse")
                    .name("Binding Curse")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.ALL_ENEMIES)
                    .damageMultiplier(1.3)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.SLOW).value(15.0).remainingDuration(2).build()
                    ))
                    .build());

            // SUPPORT (4)
            case "divine_mend" -> skills.add(TowerSkill.builder()
                    .id("divine_mend")
                    .name("Divine Mend")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.LOWEST_HP_ALLY)
                    .damageMultiplier(0.0)
                    .healMultiplier(1.3)
                    .build());
            case "battle_rhythm" -> skills.add(TowerSkill.builder()
                    .id("battle_rhythm")
                    .name("Battle Rhythm")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(2)
                    .targetRule(TargetRule.ALL_ALLIES)
                    .damageMultiplier(0.0)
                    .healMultiplier(0.8)
                    .build());
            case "spirit_totem" -> skills.add(TowerSkill.builder()
                    .id("spirit_totem")
                    .name("Spirit Totem")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.ALL_ALLIES)
                    .damageMultiplier(0.0)
                    .healMultiplier(1.0)
                    .appliedEffects(List.of(
                            TowerEffectState.builder().opcode(EffectOpcode.SHIELD).value(entity.getMaxHp() * 0.10).remainingDuration(2).build()
                    ))
                    .build());
            case "reactive_elixir" -> skills.add(TowerSkill.builder()
                    .id("reactive_elixir")
                    .name("Reactive Elixir")
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(2)
                    .targetRule(TargetRule.LOWEST_HP_ALLY)
                    .damageMultiplier(0.0)
                    .healMultiplier(1.1)
                    .build());

            default -> skills.add(TowerSkill.builder()
                    .id(uniqueSkillId)
                    .name(uniqueSkillId)
                    .skillType(TowerSkill.SkillType.UNIQUE)
                    .energyCost(3)
                    .targetRule(TargetRule.EXPOSED_SINGLE)
                    .damageMultiplier(1.5)
                    .build());
        }

        entity.setSkills(skills);
    }

    private List<TowerEntity> deepCloneCombatants(List<TowerEntity> combatants) {
        List<TowerEntity> list = new ArrayList<>();
        for (TowerEntity e : combatants) {
            list.add(TowerEntity.builder()
                    .entityId(e.getEntityId())
                    .templateId(e.getTemplateId())
                    .passiveSkillId(e.getPassiveSkillId())
                    .name(e.getName())
                    .role(e.getRole())
                    .side(e.getSide())
                    .gridRow(e.getGridRow())
                    .gridCol(e.getGridCol())
                    .skillPolicy(e.getSkillPolicy())
                    .energyPriority(e.getEnergyPriority())
                    .level(e.getLevel())
                    .stars(e.getStars())
                    .baseStats(e.getBaseStats())
                    .effectiveStats(e.getEffectiveStats())
                    .maxHp(e.getMaxHp())
                    .currentHp(e.getCurrentHp())
                    .shield(e.getShield())
                    .evadeCharges(e.getEvadeCharges())
                    .regenStacks(e.getRegenStacks())
                    .isDowned(e.isDowned())
                    .skills(e.getSkills())
                    .build());
        }
        return list;
    }
}
