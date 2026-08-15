import { apiClient } from './client';
import { WorldConfig } from '../types/world.types';

export const worldApi = {
  /**
   * Lấy danh sách 4 Thế Giới (40 Stages) và thông tin Boss thế giới.
   */
  getAllWorlds: async (): Promise<WorldConfig[]> => {
    const res = await apiClient.get<WorldConfig[]>('/worlds');
    return res.data;
  },
};
