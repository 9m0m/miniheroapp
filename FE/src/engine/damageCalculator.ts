import { Stats } from '../types/game.types';

export const ARMOR_CONSTANT_K = 500.0;
export const MAX_DAMAGE_REDUCTION_CAP = 75.0;

export interface DamageResult {
  finalDamage: number;
  rawDamage: number;
  isCrit: boolean;
  critMultiplier: number;
  armorReductionPercent: number;
  generalReductionPercent: number;
}

export function calculateDamagePerHit(
  attackerStats: Stats,
  skillMultiplier = 1.0,
  targetArmor = 0,
  targetDmgReduction = 0,
  targetElementalRes = 0
): DamageResult {
  // 1. Final ATK
  const totalBaseAtk = attackerStats.physAtk + attackerStats.magicAtk;
  const finalAtk = totalBaseAtk * (1.0 + attackerStats.atkPercent / 100.0);

  // 2. Crit Layer
  const isCrit = Math.random() * 100 < attackerStats.critRate;
  const critMultiplier = isCrit ? attackerStats.critDmg / 100.0 : 1.0;

  // 3. Elemental Layer
  const elemAdvantage = attackerStats.elemDmgBonus - targetElementalRes;
  const elemMultiplier = Math.max(0.1, 1.0 + elemAdvantage / 100.0);

  // 4. Raw Damage
  const rawDamage = finalAtk * skillMultiplier * critMultiplier * elemMultiplier;

  // 5. Asymptotic Armor: 1 - Armor / (Armor + 500)
  const armorReductionMultiplier = 1.0 - targetArmor / (targetArmor + ARMOR_CONSTANT_K);

  // 6. General Dmg Reduction (Cap 75%)
  const effectiveDmgReduction = Math.min(targetDmgReduction, MAX_DAMAGE_REDUCTION_CAP);
  const dmgReductionMultiplier = 1.0 - effectiveDmgReduction / 100.0;

  // 7. Final Damage Taken
  let finalDamage = rawDamage * armorReductionMultiplier * dmgReductionMultiplier;
  finalDamage = Math.max(1, Math.round(finalDamage));

  return {
    finalDamage,
    rawDamage,
    isCrit,
    critMultiplier,
    armorReductionPercent: (1.0 - armorReductionMultiplier) * 100,
    generalReductionPercent: (1.0 - dmgReductionMultiplier) * 100,
  };
}

export function calculateTheoreticalDPS(stats: Stats): number {
  const totalBaseAtk = stats.physAtk + stats.magicAtk;
  const finalAtk = totalBaseAtk * (1.0 + stats.atkPercent / 100.0);
  const avgCritMultiplier = 1.0 + (stats.critRate / 100.0) * (stats.critDmg / 100.0 - 1.0);
  const elemMultiplier = 1.0 + stats.elemDmgBonus / 100.0;

  const avgDph = finalAtk * 1.0 * avgCritMultiplier * elemMultiplier;
  return Math.round(avgDph * stats.atkSpeed * 10) / 10;
}
