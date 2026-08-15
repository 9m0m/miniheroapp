export interface Stats {
  // 1. Offensive Stats
  physAtk: number;
  magicAtk: number;
  atkPercent: number;
  atkSpeed: number;
  critRate: number;     // Cap 100%
  critDmg: number;      // Base 150%
  elemDmgBonus: number;

  // 2. Defensive Stats
  maxHp: number;
  armor: number;
  dmgReduction: number; // Cap 75%
  hpRegen: number;
  lifeSteal: number;
  physDodge: number;    // Cap 75%
  spellEvasion: number; // Cap 75%

  // 3. Elemental Resistances (Cap 75%)
  fireRes: number;
  coldRes: number;
  lightningRes: number;
  chaosRes: number;

  // 4. Utility & Economy
  cdr: number;          // Cap 50%
  goldBonus: number;
  chestDropBonus: number;
  expBonus: number;
}
