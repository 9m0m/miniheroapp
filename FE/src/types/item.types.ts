import { ElementalType, HeroClass, ItemRarity, ItemSlot } from './enums';
import { Stats } from './stats.types';

export interface ItemTemplate {
  id: string;
  name: string;
  description: string;
  icon?: string;
  iconUrl?: string;
  iconKey?: string;
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
  computedStats?: Stats;
}
