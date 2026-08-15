import { apiClient } from './client';
import { MonetizationStatus, UserProfile } from '../types/game.types';

export const monetizationApi = {
  /**
   * Lấy trạng thái của Két Sắt, Chuỗi 7 Ngày Thức Tỉnh và Quỹ Thám Hiểm.
   */
  getStatus: async (userId?: string): Promise<MonetizationStatus> => {
    const res = await apiClient.get<MonetizationStatus>('/monetization/status', {
      params: userId ? { userId } : {},
    });
    return res.data;
  },

  /**
   * Đập Két Sắt Thần Tài và nhận toàn bộ Gems tích lũy.
   */
  smashPiggyBank: async (userId?: string): Promise<UserProfile> => {
    const res = await apiClient.post<UserProfile>('/monetization/smash-piggy-bank', null, {
      params: userId ? { userId } : {},
    });
    return res.data;
  },

  /**
   * Nhận quà đăng nhập hàng ngày (Free hoặc Golden Track).
   */
  claimDailyPass: async (userId?: string): Promise<UserProfile> => {
    const res = await apiClient.post<UserProfile>('/monetization/claim-daily-pass', null, {
      params: userId ? { userId } : {},
    });
    return res.data;
  },

  /**
   * Rút cổ tức Quỹ Thám Hiểm khi vượt qua các mốc Stage 10, 20, 30, 40.
   */
  claimGrowthFund: async (userId: string, stageMilestone: number): Promise<UserProfile> => {
    const res = await apiClient.post<UserProfile>('/monetization/claim-growth-fund', null, {
      params: { userId, stageMilestone },
    });
    return res.data;
  },

  /**
   * Mô phỏng thanh toán WLD qua MiniKit Sandbox.
   */
  mockWldPay: async (userId: string, featureKey: string, amountWld: number): Promise<UserProfile> => {
    const res = await apiClient.post<UserProfile>('/monetization/mock-wld-pay', {
      userId,
      featureKey,
      amountWld,
    });
    return res.data;
  },
};
