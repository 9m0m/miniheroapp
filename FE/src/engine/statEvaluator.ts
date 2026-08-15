import { Stats, ItemTemplate, ItemInstance, ItemRarity, GemType } from '../types/game.types';

export const RARITY_MULTIPLIERS: Record<ItemRarity, number> = {
  COMMON: 1.0,
  UNCOMMON: 1.25,
  RARE: 1.6,
  EPIC: 2.1,
  LEGENDARY: 3.0,
};

export const ENHANCE_GROWTH_PER_LEVEL = 0.10; // +10% per +1 level

export function createDefaultStats(): Stats {
  return {
    physAtk: 0,
    magicAtk: 0,
    atkPercent: 0,
    atkSpeed: 1.0,
    critRate: 5.0,
    critDmg: 150.0,
    elemDmgBonus: 0,
    maxHp: 100,
    armor: 0,
    dmgReduction: 0,
    hpRegen: 0,
    lifeSteal: 0,
    physDodge: 0,
    spellEvasion: 0,
    fireRes: 0,
    coldRes: 0,
    lightningRes: 0,
    chaosRes: 0,
    cdr: 0,
    goldBonus: 0,
    chestDropBonus: 0,
    expBonus: 0,
  };
}

export function computeItemStats(template: ItemTemplate, instance: ItemInstance): Stats {
  const base = { ...createDefaultStats(), ...(template.baseStats || {}) };
  const rarityMult = RARITY_MULTIPLIERS[instance.rarity] || 1.0;
  const iLvlMult = 1.0 + (Math.max(1, instance.itemLevel) - 1) * (template.iLvlScalingFactor || 0.08);
  const enhanceMult = 1.0 + instance.enhanceLevel * ENHANCE_GROWTH_PER_LEVEL;

  const totalScale = rarityMult * iLvlMult * enhanceMult;

  const computed: Stats = {
    ...base,
    physAtk: Math.round(base.physAtk * totalScale),
    magicAtk: Math.round(base.magicAtk * totalScale),
    maxHp: Math.round(base.maxHp * totalScale),
    armor: Math.round(base.armor * totalScale),
    hpRegen: Math.round(base.hpRegen * totalScale),
  };

  // Add Sub-stats
  if (instance.subStats) {
    addStats(computed, instance.subStats);
  }

  // Add Sockets Gems
  if (instance.sockets) {
    for (const gemId of instance.sockets) {
      const gemStats = evaluateGemStats(gemId);
      addStats(computed, gemStats);
    }
  }

  // Add Blessing
  if (instance.blessingId) {
    const blessingStats = evaluateBlessingStats(instance.blessingId);
    addStats(computed, blessingStats);
  }

  clampStats(computed);
  return computed;
}

export function evaluateGemStats(gemId: string): Partial<Stats> {
  if (!gemId || !gemId.includes('_T')) return {};
  const [type, tierStr] = gemId.split('_T');
  const tier = parseInt(tierStr) || 1;

  switch (type as GemType) {
    case 'RUBY':
      return { physAtk: tier * 15, magicAtk: tier * 15 };
    case 'EMERALD':
      return { critRate: tier * 2, critDmg: tier * 10 };
    case 'SAPPHIRE':
      return { atkSpeed: tier * 0.05, cdr: tier * 3 };
    case 'TOPAZ':
      return { lifeSteal: tier * 1.5, hpRegen: tier * 10 };
    case 'DIAMOND':
      return {
        dmgReduction: tier * 2,
        fireRes: tier * 3,
        coldRes: tier * 3,
        lightningRes: tier * 3,
        chaosRes: tier * 3,
      };
    default:
      return {};
  }
}

export function evaluateBlessingStats(blessingId: string): Partial<Stats> {
  if (blessingId === 'SCROLL_OF_MIGHT') return { atkPercent: 10 };
  if (blessingId === 'SCROLL_OF_AEGIS') return { dmgReduction: 5 };
  if (blessingId === 'SCROLL_OF_FORTUNE') return { goldBonus: 20, chestDropBonus: 10 };
  return {};
}

export function addStats(target: Stats, addition: Partial<Stats>) {
  for (const key of Object.keys(addition) as (keyof Stats)[]) {
    if (addition[key] !== undefined) {
      target[key] = (target[key] || 0) + addition[key]!;
    }
  }
}

export function clampStats(stats: Stats) {
  stats.critRate = Math.min(100, Math.max(0, stats.critRate));
  stats.critDmg = Math.max(100, stats.critDmg);
  stats.dmgReduction = Math.min(75, Math.max(0, stats.dmgReduction));
  stats.physDodge = Math.min(75, Math.max(0, stats.physDodge));
  stats.spellEvasion = Math.min(75, Math.max(0, stats.spellEvasion));
  stats.fireRes = Math.min(75, Math.max(0, stats.fireRes));
  stats.coldRes = Math.min(75, Math.max(0, stats.coldRes));
  stats.lightningRes = Math.min(75, Math.max(0, stats.lightningRes));
  stats.chaosRes = Math.min(75, Math.max(0, stats.chaosRes));
  stats.cdr = Math.min(50, Math.max(0, stats.cdr));
  stats.atkSpeed = Math.max(0.2, stats.atkSpeed);
}
