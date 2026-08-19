import { CombatStats } from '@/domain/heroes/hero.types';
import { TowerEntity } from '@/domain/combat/combat.types';

const ROW_ORDER: Record<TowerEntity['gridRow'], number> = {
  FRONT: 0,
  MID: 1,
  BACK: 2,
};

const COL_ORDER: Record<TowerEntity['gridCol'], number> = {
  LEFT: 0,
  CENTER: 1,
  RIGHT: 2,
};

export const TOWER_BALANCE_VERSION = 'tower-v1';

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function computeEffectiveSpeed(stats: CombatStats): number {
  return clamp(Math.round(stats.speed), 60, 180);
}

export function calculateArmorReduction(armor: number): number {
  if (armor <= 0) return 0;
  const reduction = armor / (armor + 400);
  return Math.min(0.60, reduction); // max 60% reduction
}

/**
 * Resolves initiative order for living combatants.
 * 1. Effective speed descending (60-180)
 * 2. Round parity tie-break: odd round -> PLAYER first, even round -> ENEMY first
 * 3. Grid row priority FRONT -> MID -> BACK
 * 4. Grid column priority LEFT -> CENTER -> RIGHT
 * 5. entityId ascending
 */
export function resolveInitiativeOrder(combatants: TowerEntity[], roundNumber: number): TowerEntity[] {
  const living = combatants.filter((e) => !e.isDowned);
  const playerPriority = roundNumber % 2 === 1;

  return [...living].sort((a, b) => {
    const spdA = computeEffectiveSpeed(a.effectiveStats);
    const spdB = computeEffectiveSpeed(b.effectiveStats);
    if (spdA !== spdB) {
      return spdB - spdA;
    }

    if (a.side !== b.side) {
      if (playerPriority) {
        return a.side === 'PLAYER' ? -1 : 1;
      } else {
        return a.side === 'ENEMY' ? -1 : 1;
      }
    }

    const rowA = ROW_ORDER[a.gridRow];
    const rowB = ROW_ORDER[b.gridRow];
    if (rowA !== rowB) {
      return rowA - rowB;
    }

    const colA = COL_ORDER[a.gridCol];
    const colB = COL_ORDER[b.gridCol];
    if (colA !== colB) {
      return colA - colB;
    }

    return a.entityId.localeCompare(b.entityId);
  });
}
