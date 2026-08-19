import { HeroRole, CombatStats, TargetRule } from '@/domain/heroes/hero.types';

export type EffectOpcode =
  | 'DAMAGE'
  | 'HEAL'
  | 'REGEN'
  | 'DRAIN'
  | 'EVADE'
  | 'SHIELD'
  | 'TAUNT'
  | 'GUARD'
  | 'ARMOR_BREAK'
  | 'HASTE'
  | 'SLOW'
  | 'ROOT'
  | 'CLEANSE'
  | 'MARK'
  | 'EXECUTE'
  | 'COOLDOWN_SHIFT';

export type TowerSide = 'PLAYER' | 'ENEMY';

export interface TowerEffectState {
  opcode: EffectOpcode;
  value: number;
  remainingDuration: number;
  sourceEntityId?: string;
}

export interface TowerSkill {
  id: string;
  name: string;
  skillType: 'BASIC' | 'PASSIVE' | 'UNIQUE';
  cooldown: number;
  initialCooldown?: number;
  targetRule: TargetRule;
  damageMultiplier?: number;
  healMultiplier?: number;
  isUnavoidable?: boolean;
  appliedEffects?: TowerEffectState[];
}

export interface TowerEntity {
  entityId: string;
  templateId: string;
  name: string;
  role: HeroRole;
  side: TowerSide;
  gridRow: 'FRONT' | 'MID' | 'BACK';
  gridCol: 'LEFT' | 'CENTER' | 'RIGHT';
  level: number;
  stars: number;
  baseStats: CombatStats;
  effectiveStats: CombatStats;
  currentHp: number;
  maxHp: number;
  shield: number;
  evadeCharges: number; // bounded: max 1
  regenStacks: number;  // bounded: max 2
  isDowned: boolean;
  activeEffects: TowerEffectState[];
  skills: TowerSkill[];
  currentCooldowns: Record<string, number>;
}

export type ReplayEventType =
  | 'ROUND_START'
  | 'ACTION_START'
  | 'SKILL_USE'
  | 'DAMAGE_APPLIED'
  | 'HEAL_APPLIED'
  | 'EFFECT_APPLIED'
  | 'EFFECT_EXPIRED'
  | 'ENTITY_DOWN'
  | 'ROUND_END'
  | 'BATTLE_END';

export interface TowerReplayEvent {
  sequenceNumber: number;
  round: number;
  eventType: ReplayEventType;
  sourceEntityId?: string;
  targetEntityId?: string;
  skillId?: string;
  skillName?: string;
  amount?: number;
  isCrit?: boolean;
  isEvaded?: boolean;
  targetRemainingHp?: number;
  targetMaxHp?: number;
  targetShield?: number;
  effectOpcode?: string;
  details?: Record<string, any>;
}

export interface TowerBattleResult {
  winner: TowerSide;
  roundsUsed: number;
  remainingPlayerHpPercent: number;
  calculatedScore: number;
  replayEvents: TowerReplayEvent[];
  finalCombatants: TowerEntity[];
}
