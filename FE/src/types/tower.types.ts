import { HeroRole } from '@/domain/heroes/hero.types';
import { TowerSide, TowerReplayEvent } from '@/domain/combat/combat.types';

export type GridRow = 'FRONT' | 'MID' | 'BACK';
export type GridCol = 'LEFT' | 'CENTER' | 'RIGHT';
export type TeamTactic = 'BALANCED' | 'FOCUS_LOW_HP' | 'BACKLINE_PRESSURE' | 'DEFENSIVE' | 'CONTROL_FIRST';
export type SkillPolicy = 'AUTO' | 'SAVE' | 'AGGRESSIVE' | 'DEFENSIVE';

export interface TowerPartyGridSlot {
  heroId: string;
  row: GridRow;
  col: GridCol;
}

export interface TowerPartyV2Dto {
  slots: TowerPartyGridSlot[];
  tactic: TeamTactic;
  heroPolicies: Record<string, SkillPolicy>;
  energyPriority: string[];
  updatedAt?: string;
}

export interface TowerFloorBot {
  templateId: string;
  name: string;
  role: HeroRole;
  row: GridRow;
  col: GridCol;
  level: number;
  speed: number;
  maxHp: number;
}

export interface TowerFloorReward {
  gold: number;
  essence: number;
  stones: number;
  shards: number;
}

export interface TowerFloorDto {
  floorNumber: number;
  name: string;
  description: string;
  isBoss: boolean;
  recommendedLevel: number;
  recommendedPower: number;
  baseScore: number;
  botTrio: TowerFloorBot[];
  modifiers: string[];
  firstClearReward: TowerFloorReward;
}

export interface TowerProgressDto {
  seasonId: string;
  currentFloor: number;
  highestFloorCleared: number;
  bestScore: number;
  totalAttempts: number;
  savedPartyV2?: TowerPartyV2Dto;
  unacknowledgedAttempt?: TowerAttemptResponseDto;
  catalogVersion?: string;
  balanceVersion?: string;
}

export interface TowerAttemptRequestDto {
  floorNumber: number;
  slots?: TowerPartyGridSlot[];
  tactic?: TeamTactic;
  heroPolicies?: Record<string, SkillPolicy>;
  energyPriority?: string[];
  idempotencyKey?: string;
}

export interface TowerAttemptResponseDto {
  attemptId: string;
  floorNumber: number;
  winner: TowerSide;
  roundsUsed: number;
  remainingHpPercent: number;
  score: number;
  isFirstClear: boolean;
  rewardsGranted?: TowerFloorReward;
  combatants?: import('@/domain/combat/combat.types').TowerEntity[];
  replayEvents: TowerReplayEvent[];
  catalogVersion?: string;
  balanceVersion?: string;
  isAcknowledged: boolean;
  createdAt?: string;
}
