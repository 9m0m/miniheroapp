import { apiClient } from './client';
import { TrialType, TrialLeaderboardEntry, BuildInspectResponse } from '../types/trial.types';

export const trialApi = {
  getLeaderboard: async (trialType: TrialType): Promise<TrialLeaderboardEntry[]> => {
    const res = await apiClient.get<TrialLeaderboardEntry[]>(`/arena/leaderboard?trialType=${trialType}`);
    return res.data;
  },

  submitRecord: async (payload: {
    userId: string;
    trialType: TrialType;
    dpsPeak: number;
    totalDamage: number;
    timeTakenSec: number;
    heroesSnapshotJson: string;
  }): Promise<TrialLeaderboardEntry> => {
    const res = await apiClient.post<TrialLeaderboardEntry>('/arena/submit', payload);
    return res.data;
  },

  togglePrivacy: async (userId: string, isPublic: boolean): Promise<void> => {
    await apiClient.post(`/arena/privacy?userId=${userId}&isPublic=${isPublic}`);
  },

  inspectBuild: async (targetUserId: string): Promise<BuildInspectResponse> => {
    const res = await apiClient.get<BuildInspectResponse>(
      `/arena/inspect?targetUserId=${targetUserId}`
    );
    return res.data;
  },

  getAdminAuditList: async (): Promise<TrialLeaderboardEntry[]> => {
    const res = await apiClient.get<TrialLeaderboardEntry[]>('/arena/admin/audit');
    return res.data;
  },
};
