import { apiClient } from './client';
import { WaveClearResponse } from '../types/game.types';

export const battleApi = {
  /**
   * Gửi kết quả vượt Wave lên server, nhận Gold/Đá, tích lũy Piggy Bank và rớt rương đồ.
   */
  clearWave: async (
    userId: string,
    world: number,
    stage: number,
    wave: number,
    isBossWave: boolean
  ): Promise<WaveClearResponse> => {
    const res = await apiClient.post<WaveClearResponse>('/battle/wave-clear', {
      userId,
      world,
      stage,
      wave,
      isBossWave,
    });
    return res.data;
  },
};
