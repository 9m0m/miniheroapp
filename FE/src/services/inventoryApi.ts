import { apiClient } from './client';
import { ItemInstance, ItemSlot, ItemTemplate } from '../types/game.types';

export const inventoryApi = {
  /**
   * Lấy danh sách toàn bộ Item Templates chuẩn từ Database Backend.
   */
  getItemTemplates: async (): Promise<ItemTemplate[]> => {
    const res = await apiClient.get<ItemTemplate[]>('/item-templates');
    return res.data;
  },

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

  /**
   * Mở rương vật phẩm từ server (Authoritative loot drops).
   */
  openChest: async (userId: string, chestItemInstanceId: string): Promise<any> => {
    const res = await apiClient.post('/inventory/open-chest', {
      userId,
      chestItemInstanceId,
    });
    return res.data;
  },

  /**
   * Mở rộng số ô túi đồ của người chơi và lưu vào database.
   */
  unlockSlots: async (userId: string, targetSlots: number): Promise<number> => {
    const res = await apiClient.post<number>('/inventory/unlock-slots', null, {
      params: { userId, targetSlots },
    });
    return res.data;
  },
};
