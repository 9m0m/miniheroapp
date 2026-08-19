import { CombatStats } from '@/domain/heroes/hero.types';

export const MAX_HERO_LEVEL = 50;
export const MAX_HERO_STARS = 5;

export interface LevelCost {
  essence: number;
  gold: number;
}

export interface StarCost {
  levelCap: number;
  shards: number;
  gold: number;
  rawStatBonus: number;
}

export function calculateEssenceForNextLevel(currentLevel: number): number {
  const raw = 20 * Math.pow(currentLevel, 1.25);
  return Math.ceil(raw / 5) * 5;
}

export function calculateLevelCost(fromLevel: number, toLevel: number): LevelCost {
  if (fromLevel >= toLevel || fromLevel < 1 || toLevel > MAX_HERO_LEVEL) {
    return { essence: 0, gold: 0 };
  }

  let totalEssence = 0;
  for (let lvl = fromLevel; lvl < toLevel; lvl++) {
    totalEssence += calculateEssenceForNextLevel(lvl);
  }

  return {
    essence: totalEssence,
    gold: totalEssence * 4,
  };
}

export function getStarCost(targetStar: number): StarCost {
  switch (targetStar) {
    case 1:
      return { levelCap: 20, shards: 0, gold: 0, rawStatBonus: 0.0 };
    case 2:
      return { levelCap: 30, shards: 20, gold: 2000, rawStatBonus: 0.03 };
    case 3:
      return { levelCap: 40, shards: 50, gold: 5000, rawStatBonus: 0.03 };
    case 4:
      return { levelCap: 45, shards: 100, gold: 10000, rawStatBonus: 0.07 };
    case 5:
      return { levelCap: 50, shards: 180, gold: 20000, rawStatBonus: 0.10 };
    default:
      return { levelCap: 20, shards: 0, gold: 0, rawStatBonus: 0.0 };
  }
}

export function computeHeroStats(baseStats: CombatStats, level: number, stars: number): CombatStats {
  const safeLevel = Math.max(1, Math.min(MAX_HERO_LEVEL, level));
  const safeStars = Math.max(1, Math.min(MAX_HERO_STARS, stars));
  const starBonus = getStarCost(safeStars).rawStatBonus;

  const hp = Math.round(baseStats.maxHp * (1 + 0.030 * (safeLevel - 1)) * (1 + starBonus));
  const atk = Math.round(baseStats.atk * (1 + 0.024 * (safeLevel - 1)) * (1 + starBonus));
  const armor = Math.round(baseStats.armor * (1 + 0.020 * (safeLevel - 1)) * (1 + starBonus));

  return {
    maxHp: hp,
    atk,
    armor,
    speed: baseStats.speed,
    critRate: baseStats.critRate,
    critDmg: baseStats.critDmg,
  };
}
