import { apiClient } from './client';
import { TowerFloorDto, TowerAttemptRequestDto, TowerAttemptResponseDto, TowerProgressDto, TowerPartyV2Dto } from '@/types/tower.types';
import { TowerReplayEvent } from '@/domain/combat/combat.types';

export const towerApi = {
  async getCurrentSeason(): Promise<{ seasonId: string; mode: string; name: string; totalFloors: number }> {
    const res = await apiClient.get<{ seasonId: string; mode: string; name: string; totalFloors: number }>(
      '/tower/seasons/current?mode=PROGRESS'
    );
    return res.data;
  },

  async getFloors(seasonId = 'season-1'): Promise<TowerFloorDto[]> {
    const res = await apiClient.get<TowerFloorDto[]>(`/tower/seasons/${seasonId}/floors`);
    return res.data;
  },

  async getFloorByNumber(floorNumber: number): Promise<TowerFloorDto> {
    const res = await apiClient.get<TowerFloorDto>(`/tower/floors/${floorNumber}`);
    return res.data;
  },

  async getMyProgress(): Promise<TowerProgressDto> {
    const res = await apiClient.get<TowerProgressDto>('/tower/progress/me');
    return res.data;
  },

  async getPartyV2(): Promise<TowerPartyV2Dto> {
    const res = await apiClient.get<TowerPartyV2Dto>('/tower/party/v2');
    return res.data;
  },

  async savePartyV2(party: TowerPartyV2Dto): Promise<TowerPartyV2Dto> {
    const res = await apiClient.post<TowerPartyV2Dto>('/tower/party/v2', party);
    return res.data;
  },

  async createAttempt(request: TowerAttemptRequestDto): Promise<TowerAttemptResponseDto> {
    const res = await apiClient.post<TowerAttemptResponseDto>('/tower/attempts', request);
    return res.data;
  },

  async getAttempt(attemptId: string): Promise<TowerAttemptResponseDto> {
    const res = await apiClient.get<TowerAttemptResponseDto>(`/tower/attempts/${attemptId}`);
    return res.data;
  },

  async getAttemptReplay(attemptId: string): Promise<TowerReplayEvent[]> {
    const res = await apiClient.get<TowerReplayEvent[]>(`/tower/attempts/${attemptId}/replay`);
    return res.data;
  },

  async acknowledgeAttempt(attemptId: string): Promise<TowerAttemptResponseDto> {
    const res = await apiClient.post<TowerAttemptResponseDto>(`/tower/attempts/${attemptId}/acknowledge`, {});
    return res.data;
  },
};
