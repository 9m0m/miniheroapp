import { ElementalType, HeroClass } from './game.types';

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
  totalSkillConfigs: number;
  serverStatus: string;
  databaseEngine: string;
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
