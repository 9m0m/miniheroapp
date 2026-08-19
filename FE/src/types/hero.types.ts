import { HeroClass, ItemSlot, HeroBusyStatus } from './enums';
import { ItemInstance } from './item.types';
import { Stats } from './stats.types';
import { HeroRole, CombatStats } from '@/domain/heroes/hero.types';

export type { HeroClass, HeroBusyStatus };

export interface Hero {
  id: string;
  name: string;
  heroClass?: HeroClass | null;
  templateId: string;
  role: HeroRole;
  busyStatus?: HeroBusyStatus;
  level: number;
  stars: number;
  shards: number;
  exp: number;
  currentHp: number;
  equipment: Partial<Record<ItemSlot, ItemInstance>>;
  skillPoints: number;
  skills?: Record<string, number>;
  computedStats?: Stats;
  towerStats?: CombatStats;
  liveDps?: number;
}
