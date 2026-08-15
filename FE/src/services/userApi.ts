import { apiClient } from './client';
import { UserProfile } from '../types/game.types';

export const userApi = {
  /**
   * Lấy thông tin tài khoản, ví tài nguyên (Gold, Gems, Stones) và tiến trình.
   */
  getProfile: async (userId?: string): Promise<UserProfile> => {
    const res = await apiClient.get<UserProfile>('/user/profile', {
      params: userId ? { userId } : {},
    });
    return res.data;
  },
};
