import { apiClient } from './client';
import { ItemInstance } from '../types/game.types';

export const craftingApi = {

  /**
   * Ép Giấy Chúc Phúc lên trang bị.
   */
  blessItem: async (userId: string, itemInstanceId: string, blessingId: string): Promise<ItemInstance> => {
    const res = await apiClient.post<ItemInstance>('/crafting/bless', {
      userId,
      itemInstanceId,
      blessingId,
    });
    return res.data;
  },

  /**
   * Rèn Phụ Kiện Universal tại Xưởng Thợ Rèn.
   */
  craftAccessory: async (userId: string, recipeId: string): Promise<ItemInstance> => {
    const res = await apiClient.post<ItemInstance>('/crafting/blacksmith', {
      userId,
      recipeId,
    });
    return res.data;
  },

  /**
   * Nấu Giấy Chúc Phúc tại Lò Giả Kim.
   */
  brewAlchemy: async (userId: string, recipeId: string): Promise<string> => {
    const res = await apiClient.post<string>('/crafting/alchemy', {
      userId,
      recipeId,
    });
    return res.data;
  },
};
