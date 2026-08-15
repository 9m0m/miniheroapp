import { ElementalType, HeroClass, ItemRarity, ItemSlot, Stats } from './game.types';

export type AdminRole = 'ROLE_USER' | 'ROLE_SUPERADMIN';

export interface AdminAuthResponse {
  token: string;
  username: string;
  role: AdminRole;
  message: string;
  expiresIn: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalItemTemplates: number;
  totalMonsterTemplates: number;
  totalStageWaveConfigs: number;
  totalSkillConfigs: number;
  totalWorlds: number;
  totalStages: number;
  serverStatus: string;
  databaseEngine: string;
}

export interface MonsterTemplate {
  id: string;
  name: string;
  category: string;
  elementalType: ElementalType;
  baseHp: number;
  baseAtk: number;
  baseArmor: number;
  attackSpeed: number;
  iconKey: string;
  isBoss: boolean;
  goldReward: number;
}

export type MonsterConfig = MonsterTemplate;

export interface StageWaveConfig {
  id?: string;
  worldIndex: number;
  stageIndex: number;
  waveNumber: number;
  monsterId: string;
  monsterName?: string;
  monsterIcon?: string;
  monsterCount: number; // 3 to 15 monsters per wave
  hpMultiplier: number;
  atkMultiplier: number;
  armorMultiplier: number;
  bossEnrageSkill?: string | null;
}

export interface DropTableConfig {
  id?: string;
  worldIndex: number;
  stageIndex: number;
  chestDropChance: number;
  bossChestDropChance: number;
  stoneDropChance: number;
  goldMultiplier: number;
  // Normal Chest Rarity Weights
  normalCommonWeight?: number;
  normalUncommonWeight?: number;
  normalRareWeight?: number;
  normalEpicWeight?: number;
  normalLegendaryWeight?: number;
  // Boss Chest Rarity Weights
  bossCommonWeight?: number;
  bossUncommonWeight?: number;
  bossRareWeight?: number;
  bossEpicWeight?: number;
  bossLegendaryWeight?: number;
}

export interface StageDetailConfig {
  worldIndex: number;
  stageIndex: number;
  stageName: string;
  dropTable: DropTableConfig;
  waves: StageWaveConfig[];
}

export interface SkillConfig {
  id: string;
  heroClass: HeroClass;
  skillId: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  baseGoldCost: number;
  goldCostPerLevel: number;
  bonusDescription: string;
  statBonusesJson?: string;
}

export interface BattleSimulationRequest {
  worldIndex: number;
  stageIndex: number;
  waveNumber: number;
  heroTotalAtk: number;
  heroTotalHp: number;
  heroTotalArmor: number;
  heroAtkSpeed: number;
  heroCritRate: number;
  heroCritDmg: number;
  simulationRounds: number;
}

export interface BattleSimulationResult {
  totalRounds: number;
  wins: number;
  losses: number;
  winRatePercent: number;
  avgTimeToKillSec: number;
  avgHeroDps: number;
  avgDamageDealt: number;
  avgDamageTaken: number;
  monsterName: string;
  monsterCount: number;
  monsterTotalHp: number;
  monsterAtk: number;
  balanceAssessment: string;
  battleLogHighlights: string[];
}
