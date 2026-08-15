import { apiClient } from './client';
import { ItemInstance } from '../types/game.types';

export interface EnhanceResult {
  success: boolean;
  status: 'SUCCESS' | 'FAILED_KEPT' | 'FAILED_DOWNGRADED';
  oldEnhanceLevel: number;
  newEnhanceLevel: number;
  successChance: number;
  goldCost: number;
  stonesCost: number;
  updatedItem: ItemInstance;
  updatedHero?: any;
  remainingGold: number;
  remainingStones: number;
}

export const upgradeApi = {
  /**
   * Cường hóa trang bị (+0 đến +15) với tùy chọn Bùa Bảo Hiểm Lucky Forge.
   */
  enhanceItem: async (
    userId: string,
    itemInstanceId: string,
    useInsurance: boolean
  ): Promise<EnhanceResult> => {
    const res = await apiClient.post<EnhanceResult>('/upgrade/enhance', {
      userId,
      itemInstanceId,
      useInsurance,
    });
    return res.data;
  },
};
