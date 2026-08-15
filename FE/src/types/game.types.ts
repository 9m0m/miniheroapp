export type HeroClass = 'WARRIOR' | 'RANGER' | 'MAGE' | 'PRIEST';
export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type ItemSlot = 
  | 'MAIN_HAND' 
  | 'OFF_HAND' 
  | 'HELMET' 
  | 'ARMOR' 
  | 'PANTS' 
  | 'BOOTS' 
  | 'RING_1' 
  | 'RING_2' 
  | 'NECKLACE' 
  | 'TALISMAN';

export type GemType = 'RUBY' | 'EMERALD' | 'SAPPHIRE' | 'TOPAZ' | 'DIAMOND';
export type ElementalType = 'PHYSICAL' | 'FIRE' | 'COLD' | 'LIGHTNING' | 'CHAOS';

export interface Stats {
  // 1. Offensive
  physAtk: number;
  magicAtk: number;
  atkPercent: number;
  atkSpeed: number;
  critRate: number;     // Cap 100%
  critDmg: number;      // Base 150%
  elemDmgBonus: number;

  // 2. Defensive
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

export interface ItemTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  slot: ItemSlot;
  requiredClass: HeroClass | null; // null = universal accessory
  baseRarity: ItemRarity;
  elementalType: ElementalType;
  baseStats: Partial<Stats>;
  iLvlScalingFactor: number;
}

export interface ItemInstance {
  id: string;
  templateId: string;
  itemLevel: number;
  rarity: ItemRarity;
  enhanceLevel: number; // +0 to +15
  sockets: string[];    // e.g. ["RUBY_T3", "EMERALD_T2"]
  blessingId?: string;
  subStats?: Partial<Stats>;
}

export interface Hero {
  id: string;
  name: string;
  heroClass: HeroClass;
  level: number;
  exp: number;
  currentHp: number;
  equipment: Partial<Record<ItemSlot, ItemInstance>>;
  skillPoints: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  isCrit?: boolean;
  opacity: number;
  createdAt: number;
}

export interface Monster {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  atk: number;
  armor: number;
  elementalType: ElementalType;
  isBoss?: boolean;
  x: number;
  y: number;
}
