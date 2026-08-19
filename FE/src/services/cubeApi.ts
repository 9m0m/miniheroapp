import { apiClient } from './client';
import { ItemInstance } from '../types/game.types';

export interface Transmute9Response {
  resultItem: ItemInstance;
  isJackpot: boolean;
  isFallback: boolean;
  remainingGold: number;
  message: string;
}

export const cubeApi = {
  /**
   * The Cube 9-Item Matrix: Ghép 9 món cùng phẩm cấp -> 1 món phẩm cấp trên.
   */
  transmute9: async (
    userId: string,
    itemInstanceIds: string[],
    category?: string
  ): Promise<Transmute9Response> => {
    const res = await apiClient.post<Transmute9Response>('/cube/transmute-9', {
      userId,
      itemInstanceIds,
      category,
    });
    return res.data;
  },

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
