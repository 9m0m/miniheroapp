import { ItemRarity, ItemSlot } from '@/types/enums';
import { CombatStats } from '@/domain/heroes/hero.types';

export const MAX_ENHANCE_LEVEL = 15;

export interface EnhanceCost {
  gold: number;
  stones: number;
}

const ENHANCE_GOLD_COSTS = [
  100, 200, 300, 500, 800, 1200, 1700, 2300, 3000, 4000, 5500, 7500, 10000, 14000, 20000,
];

const ENHANCE_STONE_COSTS = [
  1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 18, 25,
];

export function getEnhanceCost(currentEnhanceLevel: number): EnhanceCost {
  if (currentEnhanceLevel < 0 || currentEnhanceLevel >= MAX_ENHANCE_LEVEL) {
    return { gold: 0, stones: 0 };
  }
  return {
    gold: ENHANCE_GOLD_COSTS[currentEnhanceLevel],
    stones: ENHANCE_STONE_COSTS[currentEnhanceLevel],
  };
}

export function getTotalGoldSpent(enhanceLevel: number): number {
  let total = 0;
  for (let i = 0; i < Math.min(enhanceLevel, MAX_ENHANCE_LEVEL); i++) {
    total += ENHANCE_GOLD_COSTS[i];
  }
  return total;
}

export function getTotalStonesSpent(enhanceLevel: number): number {
  let total = 0;
  for (let i = 0; i < Math.min(enhanceLevel, MAX_ENHANCE_LEVEL); i++) {
    total += ENHANCE_STONE_COSTS[i];
  }
  return total;
}

export function getRarityMultiplier(rarity: ItemRarity): number {
  switch (rarity) {
    case 'COMMON':
      return 1.00;
    case 'UNCOMMON':
      return 1.06;
    case 'RARE':
      return 1.14;
    case 'EPIC':
      return 1.24;
    case 'LEGENDARY':
    case 'MYTHIC':
    case 'ANCIENT':
      return 1.35;
    default:
      return 1.00;
  }
}

export function computeGearCombatStats(
  slot: ItemSlot,
  rarity: ItemRarity,
  itemLevel: number,
  enhanceLevel: number
): CombatStats {
  const safeLevel = Math.max(1, Math.min(50, itemLevel));
  const safeEnhance = Math.max(0, Math.min(MAX_ENHANCE_LEVEL, enhanceLevel));
  const rarityMult = getRarityMultiplier(rarity);

  const stats: CombatStats = {
    atk: 0,
    maxHp: 0,
    armor: 0,
    speed: 0,
    critRate: 0,
    critDmg: 0,
  };

  switch (slot) {
    case 'MAIN_HAND': {
      stats.atk = Math.round(12 * (1 + 0.030 * (safeLevel - 1)) * rarityMult * (1 + 0.015 * safeEnhance));
      break;
    }
    case 'OFF_HAND': {
      stats.armor = Math.round(12 * (1 + 0.030 * (safeLevel - 1)) * rarityMult * (1 + 0.015 * safeEnhance));
      break;
    }
    case 'HELMET': {
      stats.maxHp = Math.round(90 * (1 + 0.030 * (safeLevel - 1)) * rarityMult * (1 + 0.015 * safeEnhance));
      break;
    }
    case 'ARMOR': {
      stats.armor = Math.round(18 * (1 + 0.030 * (safeLevel - 1)) * rarityMult * (1 + 0.015 * safeEnhance));
      break;
    }
    case 'PANTS': {
      stats.maxHp = Math.round(70 * (1 + 0.030 * (safeLevel - 1)) * rarityMult * (1 + 0.015 * safeEnhance));
      break;
    }
    case 'BOOTS': {
      const baseSpeed = rarity === 'COMMON' ? 4 : rarity === 'UNCOMMON' ? 5 : rarity === 'RARE' ? 6 : rarity === 'EPIC' ? 7 : 8;
      const speedBonus = safeEnhance >= 15 ? 3 : safeEnhance >= 10 ? 2 : safeEnhance >= 5 ? 1 : 0;
      stats.speed = baseSpeed + speedBonus;
      break;
    }
    case 'RING_1': {
      const baseCrit = rarity === 'COMMON' ? 2 : rarity === 'UNCOMMON' ? 3 : rarity === 'RARE' ? 4 : rarity === 'EPIC' ? 5 : 6;
      const critBonus = safeEnhance >= 15 ? 3 : safeEnhance >= 10 ? 2 : safeEnhance >= 5 ? 1 : 0;
      stats.critRate = baseCrit + critBonus;
      break;
    }
    case 'TALISMAN': {
      const baseCritDmg = rarity === 'COMMON' ? 5 : rarity === 'UNCOMMON' ? 6 : rarity === 'RARE' ? 8 : rarity === 'EPIC' ? 10 : 12;
      const critDmgBonus = safeEnhance >= 15 ? 6 : safeEnhance >= 10 ? 4 : safeEnhance >= 5 ? 2 : 0;
      stats.critDmg = 150 + baseCritDmg + critDmgBonus;
      break;
    }
  }

  return stats;
}
