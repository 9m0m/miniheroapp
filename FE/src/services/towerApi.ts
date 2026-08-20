import { apiClient } from './client';
import { TowerFloorDto, TowerAttemptRequestDto, TowerAttemptResponseDto, TowerProgressDto, TowerPartyV2Dto } from '@/types/tower.types';

export const towerApi = {
  /**
   * Lấy danh sách 30 tầng của mùa giải hiện tại
   */
  async getFloors(seasonId?: string): Promise<TowerFloorDto[]> {
    const sId = seasonId || 'season-1';
    const res = await apiClient.get<TowerFloorDto[]>(`/tower/seasons/${sId}/floors`);
    return res.data;
  },

  /**
   * Lấy tiến độ Tower và đội hình đã lưu của user
   */
  async getMyProgress(): Promise<TowerProgressDto> {
    const res = await apiClient.get<TowerProgressDto>('/tower/progress/me');
    return res.data;
  },

  /**
   * Lưu đội hình 3x2 Grid, chiến thuật, hero policies và energy priority
   */
  async savePartyV2(party: TowerPartyV2Dto): Promise<TowerPartyV2Dto> {
    const res = await apiClient.post<TowerPartyV2Dto>('/tower/party/v2', party);
    return res.data;
  },

  /**
   * Khởi chạy lượt đánh Tower (Backend authoritative combat resolution)
   */
  async createAttempt(request: TowerAttemptRequestDto): Promise<TowerAttemptResponseDto> {
    const res = await apiClient.post<TowerAttemptResponseDto>('/tower/attempts', request);
    return res.data;
  },

  /**
   * Xác nhận hoàn tất lượt đánh hoặc đầu hàng để giải phóng attempt
   */
  async acknowledgeAttempt(attemptId: string): Promise<TowerAttemptResponseDto> {
    const res = await apiClient.post<TowerAttemptResponseDto>(`/tower/attempts/${attemptId}/acknowledge`, {});
    return res.data;
  },
};
