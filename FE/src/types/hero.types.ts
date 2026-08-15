import { HeroClass, ItemSlot } from './enums';
import { ItemInstance } from './item.types';
import { Stats } from './stats.types';

export interface Hero {
  id: string;
  name: string;
  heroClass: HeroClass;
  level: number;
  exp: number;
  currentHp: number;
  equipment: Partial<Record<ItemSlot, ItemInstance>>;
  skillPoints: number;
  skills?: Record<string, number>;
  computedStats?: Stats;
  liveDps?: number;
}
