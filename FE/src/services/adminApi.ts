import { apiClient } from './client';
import {
  AdminAuthResponse,
  AdminDashboardStats,
  BattleSimulationRequest,
  BattleSimulationResult,
  ItemTemplate,
  MonsterTemplate,
  SkillConfig,
  StageDetailConfig,
} from '@/types/game.types';

const ADMIN_TOKEN_KEY = 'wh_admin_session_token';
const ADMIN_USER_KEY = 'wh_admin_session_user';

export const adminAuth = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY);
  },
  getUser: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_USER_KEY) || sessionStorage.getItem(ADMIN_USER_KEY);
  },
  setSession: (token: string, username: string, remember: boolean = true) => {
    if (typeof window === 'undefined') return;
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(ADMIN_TOKEN_KEY, token);
    storage.setItem(ADMIN_USER_KEY, username);
  },
  clearSession: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
  },
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!(localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY));
  },
};

export const adminApi = {
  // Auth
  login: async (username: string, password: string): Promise<AdminAuthResponse> => {
    const res = await apiClient.post<AdminAuthResponse>('/auth/admin/login', { username, password });
    return res.data;
  },

  // Dashboard Stats
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const res = await apiClient.get<AdminDashboardStats>('/admin/dashboard/stats');
    return res.data;
  },

  // Monster Templates
  getAllMonsters: async (): Promise<MonsterTemplate[]> => {
    const res = await apiClient.get<MonsterTemplate[]>('/admin/monsters');
    return res.data;
  },

  getMonsterById: async (id: string): Promise<MonsterTemplate> => {
    const res = await apiClient.get<MonsterTemplate>(`/admin/monsters/${id}`);
    return res.data;
  },

  createMonster: async (data: Partial<MonsterTemplate>): Promise<MonsterTemplate> => {
    const res = await apiClient.post<MonsterTemplate>('/admin/monsters', data);
    return res.data;
  },

  updateMonster: async (id: string, data: Partial<MonsterTemplate>): Promise<MonsterTemplate> => {
    const res = await apiClient.put<MonsterTemplate>(`/admin/monsters/${id}`, data);
    return res.data;
  },

  saveMonster: async (data: MonsterTemplate): Promise<MonsterTemplate> => {
    if (data.id) {
      const res = await apiClient.put<MonsterTemplate>(`/admin/monsters/${data.id}`, data);
      return res.data;
    } else {
      const res = await apiClient.post<MonsterTemplate>('/admin/monsters', data);
      return res.data;
    }
  },

  deleteMonster: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/monsters/${id}`);
  },

  // Stage Waves & Drop Table Configuration
  getStageDetailConfig: async (world: number, stage: number): Promise<StageDetailConfig> => {
    const res = await apiClient.get<StageDetailConfig>(`/admin/stages/${world}/${stage}`);
    return res.data;
  },

  updateStageDetailConfig: async (world: number, stage: number, data: StageDetailConfig): Promise<StageDetailConfig> => {
    const res = await apiClient.put<StageDetailConfig>(`/admin/stages/${world}/${stage}`, data);
    return res.data;
  },

  // Master Item Templates
  getAllItemTemplates: async (): Promise<ItemTemplate[]> => {
    const res = await apiClient.get<ItemTemplate[]>('/admin/item-templates');
    return res.data;
  },

  updateItemTemplate: async (id: string, data: Partial<ItemTemplate>): Promise<ItemTemplate> => {
    const res = await apiClient.put<ItemTemplate>(`/admin/item-templates/${id}`, data);
    return res.data;
  },

  // Skill Tree Configs
  getAllSkillConfigs: async (): Promise<SkillConfig[]> => {
    const res = await apiClient.get<SkillConfig[]>('/admin/skills');
    return res.data;
  },

  updateSkillConfig: async (skillId: string, data: Partial<SkillConfig>): Promise<SkillConfig> => {
    const res = await apiClient.put<SkillConfig>(`/admin/skills/${skillId}`, data);
    return res.data;
  },

  // Live Battle Math Simulation
  simulateBattle: async (params: BattleSimulationRequest): Promise<BattleSimulationResult> => {
    const res = await apiClient.post<BattleSimulationResult>('/admin/simulate-battle', params);
    return res.data;
  },
};
