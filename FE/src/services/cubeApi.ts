import { apiClient } from './client';
import { ItemInstance } from '../types/game.types';

export const cubeApi = {
  /**
   * Smart Fusion: Ghép 3 món cùng phẩm cấp -> 1 món phẩm cấp trên.
   */
  smartFusion: async (userId: string, itemInstanceIds: string[]): Promise<ItemInstance> => {
    const res = await apiClient.post<ItemInstance>('/cube/fuse', {
      userId,
      itemInstanceIds,
    });
    return res.data;
  },

  /**
   * Gem Fusion: Ghép 3 viên ngọc Tier N -> 1 viên ngọc Tier N+1.
   */
  gemFusion: async (userId: string, gemType: string, sourceTier: number): Promise<string> => {
    const res = await apiClient.post<string>('/cube/fuse-gems', {
      userId,
      gemType,
      sourceTier,
    });
    return res.data;
  },
};
