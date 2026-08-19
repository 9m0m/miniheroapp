export type HeroClass = 'WARRIOR' | 'RANGER' | 'MAGE' | 'PRIEST';

export type HeroBusyStatus = 'IDLE' | 'EXPEDITION_BUSY';

export type ItemType = 'EQUIPMENT' | 'ACCESSORY' | 'MATERIAL' | 'GEM' | 'CHEST' | 'KEY';

export type ItemRarity =
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY'
  | 'MYTHIC'
  | 'ANCIENT';

export type ItemSlot = 
  | 'MAIN_HAND' 
  | 'OFF_HAND' 
  | 'HELMET' 
  | 'ARMOR' 
  | 'PANTS' 
  | 'BOOTS' 
  | 'RING_1' 
  | 'TALISMAN';

export type GemType = 'RUBY' | 'EMERALD' | 'SAPPHIRE' | 'TOPAZ' | 'DIAMOND';

export type ElementalType = 'PHYSICAL' | 'FIRE' | 'COLD' | 'LIGHTNING' | 'CHAOS';

export const RARITY_COLORS: Record<ItemRarity, string> = {
  COMMON: '#CBD5E1',
  UNCOMMON: '#22C55E',
  RARE: '#0EA5E9',
  EPIC: '#A855F7',
  LEGENDARY: '#F59E0B',
  MYTHIC: '#EF4444',
  ANCIENT: '#EC4899',
};

export const RARITY_NAMES: Record<ItemRarity, string> = {
  COMMON: 'Common',
  UNCOMMON: 'Uncommon',
  RARE: 'Rare',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
  MYTHIC: 'Mythic',
  ANCIENT: 'Ancient',
};
