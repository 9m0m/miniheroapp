package com.worldhero.engine.tower;

import com.worldhero.model.enums.GridCol;
import com.worldhero.model.enums.GridRow;
import com.worldhero.model.enums.SkillPolicy;
import com.worldhero.model.enums.TargetRule;
import com.worldhero.model.enums.TeamTactic;

import java.util.*;
import java.util.stream.Collectors;

public class TowerAiPolicy {

    /**
     * Choose skill based on Team Energy, Reservation, SkillPolicy, and TeamTactic.
     */
    public static TowerSkill chooseSkill(
            TowerEntity actor,
            List<TowerEntity> allCombatants,
            int currentTeamEnergy,
            List<TowerEntity> remainingTurnOrder,
            TeamTactic tactic
    ) {
        SkillPolicy policy = actor.getSkillPolicy() != null ? actor.getSkillPolicy() : SkillPolicy.AUTO;
        if (policy == SkillPolicy.SAVE) {
            return getBasicSkill(actor);
        }

        TeamTactic activeTactic = tactic != null ? tactic : TeamTactic.BALANCED;
        boolean isAggressive = (activeTactic == TeamTactic.FOCUS_LOW_HP || activeTactic == TeamTactic.BACKLINE_PRESSURE || policy == SkillPolicy.AGGRESSIVE);

        List<TowerSkill> eligibleUniqueSkills = new ArrayList<>();
        for (TowerSkill skill : actor.getSkills()) {
            if (skill.getSkillType() == TowerSkill.SkillType.UNIQUE) {
                int cost = skill.getEnergyCost();
                if (cost > currentTeamEnergy) {
                    continue;
                }

                // Energy Reservation: check if a higher-priority living ally later in this round needs energy
                if (actor.getSide() == TowerSide.PLAYER && remainingTurnOrder != null && !isAggressive) {
                    int higherPriorityReserved = calculateHigherPriorityReservation(actor, remainingTurnOrder);
                    if (currentTeamEnergy - cost < higherPriorityReserved) {
                        continue; // Conserve energy for higher-priority ally
                    }
                }

                // Usefulness Evaluation
                if (isSkillUseful(actor, skill, allCombatants, activeTactic == TeamTactic.DEFENSIVE)) {
                    eligibleUniqueSkills.add(skill);
                }
            }
        }

        if (eligibleUniqueSkills.isEmpty()) {
            return getBasicSkill(actor);
        }

        // Rank and pick the highest scored skill according to policy and tactic
        return eligibleUniqueSkills.stream()
                .max(Comparator.comparingDouble(s -> scoreSkill(actor, s, allCombatants, activeTactic, policy)))
                .orElse(getBasicSkill(actor));
    }

    public static boolean isDebuffed(TowerEntity entity) {
        if (entity == null || entity.getActiveEffects() == null || entity.getActiveEffects().isEmpty()) {
            return false;
        }
        return entity.getActiveEffects().stream().anyMatch(eff ->
                eff.getOpcode() == EffectOpcode.ROOT ||
                eff.getOpcode() == EffectOpcode.SLOW ||
                eff.getOpcode() == EffectOpcode.TAUNT ||
                eff.getOpcode() == EffectOpcode.MARK ||
                eff.getOpcode() == EffectOpcode.ARMOR_BREAK
        );
    }

    private static double scoreSkill(TowerEntity actor, TowerSkill skill, List<TowerEntity> allCombatants, TeamTactic tactic, SkillPolicy policy) {
        if (skill.getSkillType() != TowerSkill.SkillType.UNIQUE) return 0.0;

        List<TowerEntity> livingAllies = allCombatants.stream()
                .filter(e -> e.getSide() == actor.getSide() && !e.isDowned()).toList();
        List<TowerEntity> livingEnemies = allCombatants.stream()
                .filter(e -> e.getSide() != actor.getSide() && !e.isDowned()).toList();

        double score = 10.0 + skill.getDamageMultiplier() * 5.0;

        boolean hasDebuffOrCrowdControl = skill.getAppliedEffects().stream().anyMatch(eff ->
                eff.getOpcode() == EffectOpcode.ROOT ||
                eff.getOpcode() == EffectOpcode.SLOW ||
                eff.getOpcode() == EffectOpcode.TAUNT ||
                eff.getOpcode() == EffectOpcode.MARK ||
                eff.getOpcode() == EffectOpcode.ARMOR_BREAK
        );

        boolean hasHeal = skill.getHealMultiplier() > 0;
        boolean hasShield = skill.getAppliedEffects().stream().anyMatch(eff -> eff.getOpcode() == EffectOpcode.SHIELD);

        // 1. Tactic: CONTROL_FIRST
        if (tactic == TeamTactic.CONTROL_FIRST) {
            if (hasDebuffOrCrowdControl) {
                boolean anyUnDebuffed = livingEnemies.stream().anyMatch(e -> !isDebuffed(e));
                if (anyUnDebuffed) {
                    score += 50.0;
                } else {
                    score += 20.0;
                }
            }
        }

        // 2. Tactic: DEFENSIVE
        if (tactic == TeamTactic.DEFENSIVE || policy == SkillPolicy.DEFENSIVE) {
            if (hasHeal) {
                boolean anyInjured = livingAllies.stream().anyMatch(e -> e.getCurrentHp() < (int) (e.getMaxHp() * 0.98));
                if (anyInjured) score += 60.0;
            }
            if (hasShield) {
                boolean anyUnshielded = livingAllies.stream().anyMatch(e -> e.getShield() == 0);
                if (anyUnshielded) score += 50.0;
            }
        } else {
            if (hasHeal) {
                boolean anyInjured = livingAllies.stream().anyMatch(e -> e.getCurrentHp() < (int) (e.getMaxHp() * 0.85));
                if (anyInjured) score += 40.0;
            }
            if (hasShield) {
                boolean anyInjured = livingAllies.stream().anyMatch(e -> e.getCurrentHp() < (int) (e.getMaxHp() * 0.90) || e.getShield() == 0);
                if (anyInjured) score += 30.0;
            }
        }

        // 3. Tactic: FOCUS_LOW_HP / AGGRESSIVE
        if (tactic == TeamTactic.FOCUS_LOW_HP || policy == SkillPolicy.AGGRESSIVE) {
            score += skill.getDamageMultiplier() * 20.0;
        }

        // 4. Tactic: BACKLINE_PRESSURE
        if (tactic == TeamTactic.BACKLINE_PRESSURE) {
            if (skill.getTargetRule() == TargetRule.ALL_ENEMIES ||
                skill.getTargetRule() == TargetRule.FULL_ROW ||
                skill.getTargetRule() == TargetRule.BACKMOST_ENEMY) {
                score += 35.0;
            }
        }

        return score;
    }

    private static int calculateHigherPriorityReservation(TowerEntity currentActor, List<TowerEntity> remainingTurnOrder) {
        int reserved = 0;
        for (TowerEntity ally : remainingTurnOrder) {
            if (ally.getEntityId().equals(currentActor.getEntityId())) continue;
            if (ally.getSide() == currentActor.getSide() && !ally.isDowned()) {
                if (ally.getEnergyPriority() < currentActor.getEnergyPriority() && ally.getSkillPolicy() != SkillPolicy.SAVE) {
                    for (TowerSkill s : ally.getSkills()) {
                        if (s.getSkillType() == TowerSkill.SkillType.UNIQUE) {
                            reserved += s.getEnergyCost();
                            break;
                        }
                    }
                }
            }
        }
        return reserved;
    }

    private static boolean isSkillUseful(TowerEntity actor, TowerSkill skill, List<TowerEntity> allCombatants, boolean isDefensiveTactic) {
        if (allCombatants == null || allCombatants.isEmpty()) return true;

        double healThreshold = isDefensiveTactic ? 0.98 : 0.95;
        if (skill.getHealMultiplier() > 0) {
            return allCombatants.stream()
                    .filter(e -> e.getSide() == actor.getSide() && !e.isDowned())
                    .anyMatch(e -> e.getCurrentHp() < (int) (e.getMaxHp() * healThreshold));
        }

        // Shield skill: useful if self or allies need shielding
        boolean isShield = skill.getAppliedEffects().stream().anyMatch(eff -> eff.getOpcode() == EffectOpcode.SHIELD);
        if (isShield) {
            double shieldThreshold = isDefensiveTactic ? 0.95 : 0.90;
            return allCombatants.stream()
                    .filter(e -> e.getSide() == actor.getSide() && !e.isDowned())
                    .anyMatch(e -> e.getShield() == 0 || e.getCurrentHp() < (int) (e.getMaxHp() * shieldThreshold));
        }

        return true;
    }

    public static TowerSkill getBasicSkill(TowerEntity actor) {
        return actor.getSkills().stream()
                .filter(s -> s.getSkillType() == TowerSkill.SkillType.BASIC)
                .findFirst()
                .orElseGet(() -> TowerSkill.builder()
                        .id("basic_attack")
                        .name("Basic Attack")
                        .skillType(TowerSkill.SkillType.BASIC)
                        .energyCost(0)
                        .targetRule(TargetRule.EXPOSED_SINGLE)
                        .damageMultiplier(1.0)
                        .build());
    }

    /**
     * 3x3 Grid Target Selection with strict Column Cover and Team Tactic rules.
     */
    public static List<TowerEntity> selectTargets(
            TowerEntity actor,
            TargetRule targetRule,
            List<TowerEntity> allCombatants,
            TeamTactic tactic
    ) {
        List<TowerEntity> result = new ArrayList<>();
        List<TowerEntity> enemies = allCombatants.stream()
                .filter(e -> e.getSide() != actor.getSide() && !e.isDowned())
                .collect(Collectors.toList());

        List<TowerEntity> allies = allCombatants.stream()
                .filter(e -> e.getSide() == actor.getSide() && !e.isDowned())
                .collect(Collectors.toList());

        if (targetRule == null) targetRule = TargetRule.EXPOSED_SINGLE;

        Comparator<TowerEntity> lowestHpPercentComparator = Comparator
                .comparingDouble((TowerEntity e) -> (double) e.getCurrentHp() / Math.max(1, e.getMaxHp()))
                .thenComparingInt(e -> e.getGridRow() != null ? e.getGridRow().ordinal() : 0)
                .thenComparing(TowerEntity::getEntityId);

        switch (targetRule) {
            case SELF -> result.add(actor);

            case ALL_ENEMIES -> result.addAll(enemies);

            case ALL_ALLIES -> result.addAll(allies);

            case LOWEST_HP_ALLY -> allies.stream().min(lowestHpPercentComparator).ifPresent(result::add);

            case LOWEST_HP_ENEMY -> {
                List<TowerEntity> legalExposed = getLegalExposedEnemies(enemies);
                legalExposed.stream().min(lowestHpPercentComparator).ifPresent(result::add);
                if (result.isEmpty() && !enemies.isEmpty()) {
                    enemies.stream().min(lowestHpPercentComparator).ifPresent(result::add);
                }
            }

            case HIGHEST_ATK_ENEMY -> {
                List<TowerEntity> legalExposed = getLegalExposedEnemies(enemies);
                legalExposed.stream()
                        .max(Comparator.comparingInt(e -> e.getEffectiveStats() != null ? e.getEffectiveStats().getAtk() : 0))
                        .ifPresent(result::add);
                if (result.isEmpty() && !enemies.isEmpty()) {
                    enemies.stream()
                            .max(Comparator.comparingInt(e -> e.getEffectiveStats() != null ? e.getEffectiveStats().getAtk() : 0))
                            .ifPresent(result::add);
                }
            }

            case BACKMOST_ENEMY -> {
                // Assassin explicit cover-bypass: targets highest row index living enemy
                enemies.stream()
                        .max(Comparator.comparingInt((TowerEntity e) -> e.getGridRow() != null ? e.getGridRow().ordinal() : 0)
                                .thenComparing(lowestHpPercentComparator.reversed()))
                        .ifPresent(result::add);
            }

            case FRONTMOST_ANY_COLUMN, FRONT_ENEMY, EXPOSED_SINGLE -> {
                // Column Cover Resolution: strictly selects among the legal front-most exposed enemy of each column
                TowerEntity exposed = resolveTacticalExposedEnemy(actor, enemies, tactic);
                if (exposed != null) {
                    result.add(exposed);
                }
            }

            case SAME_COLUMN -> {
                TowerEntity anchor = resolveTacticalExposedEnemy(actor, enemies, tactic);
                if (anchor != null) {
                    GridCol targetCol = anchor.getGridCol();
                    result.addAll(enemies.stream().filter(e -> e.getGridCol() == targetCol).toList());
                }
            }

            case FULL_ROW -> {
                TowerEntity anchor = resolveTacticalExposedEnemy(actor, enemies, tactic);
                if (anchor != null) {
                    GridRow targetRow = anchor.getGridRow();
                    result.addAll(enemies.stream().filter(e -> e.getGridRow() == targetRow).toList());
                }
            }

            case CROSS -> {
                TowerEntity anchor = resolveTacticalExposedEnemy(actor, enemies, tactic);
                if (anchor != null) {
                    result.add(anchor);
                    for (TowerEntity e : enemies) {
                        if (e.getEntityId().equals(anchor.getEntityId())) continue;
                        boolean isAdjacentRow = e.getGridCol() == anchor.getGridCol() && Math.abs(e.getGridRow().ordinal() - anchor.getGridRow().ordinal()) == 1;
                        boolean isAdjacentCol = e.getGridRow() == anchor.getGridRow() && Math.abs(e.getGridCol().ordinal() - anchor.getGridCol().ordinal()) == 1;
                        if (isAdjacentRow || isAdjacentCol) {
                            result.add(e);
                        }
                    }
                }
            }

            default -> {
                TowerEntity exposed = resolveTacticalExposedEnemy(actor, enemies, tactic);
                if (exposed != null) result.add(exposed);
            }
        }

        return result;
    }

    /**
     * Returns the front-most living enemy in each column (LEFT, CENTER, RIGHT).
     * Units behind these exposed enemies are covered and cannot be targeted by standard single-target attacks.
     */
    public static List<TowerEntity> getLegalExposedEnemies(List<TowerEntity> enemies) {
        if (enemies.isEmpty()) return Collections.emptyList();
        List<TowerEntity> exposed = new ArrayList<>();
        for (GridCol col : GridCol.values()) {
            enemies.stream()
                    .filter(e -> (e.getGridCol() != null ? e.getGridCol() : GridCol.CENTER) == col)
                    .min(Comparator.comparingInt(e -> e.getGridRow() != null ? e.getGridRow().ordinal() : 0))
                    .ifPresent(exposed::add);
        }
        return exposed;
    }

    /**
     * Resolves the exposed front-most enemy according to column cover and Team Tactic.
     * Guarantees that only a legal front-most exposed enemy in one of the columns is selected.
     */
    public static TowerEntity resolveTacticalExposedEnemy(TowerEntity actor, List<TowerEntity> enemies, TeamTactic tactic) {
        List<TowerEntity> legalExposed = getLegalExposedEnemies(enemies);
        if (legalExposed.isEmpty()) return null;
        if (legalExposed.size() == 1) return legalExposed.get(0);

        GridCol actorCol = actor.getGridCol() != null ? actor.getGridCol() : GridCol.CENTER;
        TeamTactic activeTactic = tactic != null ? tactic : TeamTactic.BALANCED;

        // Apply Tactic preference ONLY among the legal exposed enemies
        if (activeTactic == TeamTactic.FOCUS_LOW_HP) {
            return legalExposed.stream()
                    .min(Comparator.comparingDouble((TowerEntity e) -> (double) e.getCurrentHp() / Math.max(1, e.getMaxHp()))
                            .thenComparingInt(e -> Math.abs(e.getGridCol().ordinal() - actorCol.ordinal()))
                            .thenComparing(TowerEntity::getEntityId))
                    .orElse(legalExposed.get(0));
        }

        if (activeTactic == TeamTactic.CONTROL_FIRST) {
            TowerEntity unDebuffed = legalExposed.stream()
                    .filter(e -> !isDebuffed(e))
                    .min(Comparator.comparingInt((TowerEntity e) -> Math.abs(e.getGridCol().ordinal() - actorCol.ordinal()))
                            .thenComparing(TowerEntity::getEntityId))
                    .orElse(null);
            if (unDebuffed != null) return unDebuffed;
        }

        if (activeTactic == TeamTactic.BACKLINE_PRESSURE) {
            return legalExposed.stream()
                    .max(Comparator.comparingInt((TowerEntity e) -> e.getGridRow() != null ? e.getGridRow().ordinal() : 0)
                            .thenComparing(Comparator.comparingDouble((TowerEntity e) -> (double) e.getCurrentHp() / Math.max(1, e.getMaxHp())).reversed())
                            .thenComparing(TowerEntity::getEntityId))
                    .orElse(legalExposed.get(0));
        }

        // Default / BALANCED / DEFENSIVE: Proximity to actor column (same col -> adjacent -> other)
        return legalExposed.stream()
                .min(Comparator.comparingInt((TowerEntity e) -> Math.abs(e.getGridCol().ordinal() - actorCol.ordinal()))
                        .thenComparingInt(e -> e.getGridRow() != null ? e.getGridRow().ordinal() : 0)
                        .thenComparing(TowerEntity::getEntityId))
                .orElse(legalExposed.get(0));
    }
}

