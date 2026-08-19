import { HeroClass, ItemSlot } from '@/types/enums';
import { ItemInstance } from '@/types/item.types';

export type HeroTemplateId = string; // e.g. "hero.knight", "hero.warrior"
export type OwnedHeroId = string;    // UUID instance of account
export type BattleEntityId = string; // local battle entity ID in an attempt

export type HeroRole = 'TANK' | 'BRUISER' | 'ASSASSIN' | 'MARKSMAN' | 'MAGE' | 'SUPPORT';
export type GearFamily = 'HEAVY' | 'MARTIAL' | 'RANGED' | 'ARCANE';
export type AttackMode = 'MELEE' | 'RANGED' | 'SUPPORT';

export type TargetRule = 
  | 'SELF' 
  | 'FRONT_ENEMY' 
  | 'LOWEST_HP_ENEMY' 
  | 'HIGHEST_ATK_ENEMY' 
  | 'ALL_ENEMIES' 
  | 'LOWEST_HP_ALLY' 
  | 'ALL_ALLIES';

export interface CombatStats {
  atk: number;
  maxHp: number;
  armor: number;
  speed: number;
  critRate: number; // 0 to 50%
  critDmg: number;  // 150 to 200%
}

export interface AttackProfile {
  mode: AttackMode;
  rangePx: number;
  targetRule: TargetRule;
}

export interface TowerProfile {
  baseSpeed: number;
  basicTargetRule: TargetRule;
  aiPolicyId: string;
}

export interface HeroTemplate {
  id: HeroTemplateId;
  catalogVersion: string;
  name: string;
  title: string;
  role: HeroRole;
  gearFamily: GearFamily;
  baseStats: CombatStats;
  growthCurveId: string;
  attackProfile: AttackProfile;
  towerProfile: TowerProfile;
  passiveSkillId: string;
  uniqueSkillId: string;
  spriteKey: string;
  portraitKey: string;
  enabled: boolean;
  legacyHeroClass?: HeroClass;
}

export interface OwnedHero {
  id: OwnedHeroId;
  templateId: HeroTemplateId;
  legacyHeroClass?: HeroClass;
  name?: string;
  role: HeroRole;
  level: number;
  stars: 1 | 2 | 3 | 4 | 5;
  shards: number;
  exp: number;
  equipment: Partial<Record<ItemSlot, ItemInstance>>;
  computedStats?: CombatStats;
  towerStats?: CombatStats;
}

export interface HeroCatalogResponse {
  catalogVersion: string;
  totalHeroes: number;
  enabledCount: number;
  templates: HeroTemplate[];
}
