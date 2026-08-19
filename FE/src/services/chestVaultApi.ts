import { apiClient } from './client';
import { ChestVaultDto, OpenVaultChestResponse } from '../types/chestVault.types';

export const chestVaultApi = {
  /**
   * Lấy thông tin số lượng rương theo từng tier trong Chest Vault
   */
  getChestVault: async (userId?: string): Promise<ChestVaultDto> => {
    const res = await apiClient.get<ChestVaultDto>('/chest-vault', {
      params: userId ? { userId } : {},
    });
    return res.data;
  },

  /**
   * Mở 1 rương từ Chest Vault với Idempotency Key và nhận phần thưởng trang bị
   */
  openChest: async (params: {
    chestId?: string;
    chestTier?: string;
    idempotencyKey?: string;
  }): Promise<OpenVaultChestResponse> => {
    const res = await apiClient.post<OpenVaultChestResponse>('/chest-vault/open', params);
    return res.data;
  },
};
