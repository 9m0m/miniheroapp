import { apiClient } from './client';
import { ItemInstance, ItemSlot } from '../types/game.types';

export const inventoryApi = {
  /**
   * Lấy danh sách toàn bộ vật phẩm đang nằm trong túi đồ người chơi.
   */
  getInventory: async (userId?: string): Promise<ItemInstance[]> => {
    const res = await apiClient.get<ItemInstance[]>('/inventory', {
      params: userId ? { userId } : {},
    });
    return res.data;
  },

  /**
   * Trang bị 1 vật phẩm từ túi đồ lên Tướng (tự động validate class và slot).
   */
  equipItem: async (
    userId: string,
    heroId: string,
    itemInstanceId: string,
    targetSlot?: ItemSlot
  ): Promise<any> => {
    const res = await apiClient.post('/inventory/equip', {
      userId,
      heroId,
      itemInstanceId,
      targetSlot,
    });
    return res.data;
  },

  /**
   * Tháo vật phẩm từ Tướng về lại túi đồ.
   */
  unequipItem: async (userId: string, itemInstanceId: string): Promise<any> => {
    const res = await apiClient.post('/inventory/unequip', {
      userId,
      itemInstanceId,
    });
    return res.data;
  },
};
