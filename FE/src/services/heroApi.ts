import { apiClient } from './client';
import { Hero, ItemInstance, ItemSlot } from '../types/game.types';

export const heroApi = {
  /**
   * Lấy danh sách 4 Tướng kèm trang bị đang mặc và toàn bộ Stats & Live DPS tính toán từ BE.
   */
  getHeroes: async (userId?: string): Promise<Hero[]> => {
    const res = await apiClient.get<any[]>('/heroes', {
      params: userId ? { userId } : {},
    });

    return res.data.map((h) => {
      const equipmentMap: Partial<Record<ItemSlot, ItemInstance>> = {};
      if (h.equippedItems) {
        h.equippedItems.forEach((item: any) => {
          equipmentMap[item.equippedSlot as ItemSlot] = {
            id: item.id,
            templateId: item.templateId,
            itemLevel: item.itemLevel,
            rarity: item.rarity,
            enhanceLevel: item.enhanceLevel,
            sockets: item.sockets || [],
            blessingId: item.blessingId,
            subStats: item.subStats,
            computedStats: item.computedStats,
          };
        });
      }

      return {
        id: h.id,
        name: getHeroNameByClass(h.heroClass),
        heroClass: h.heroClass,
        level: h.level,
        exp: h.exp,
        currentHp: h.computedStats?.maxHp || 100,
        equipment: equipmentMap,
        skillPoints: 0,
        computedStats: h.computedStats,
        liveDps: h.liveDps,
      };
    });
  },
};

function getHeroNameByClass(heroClass: string): string {
  switch (heroClass) {
    case 'WARRIOR':
      return 'Warrior';
    case 'RANGER':
      return 'Archer';
    case 'MAGE':
      return 'Wizard';
    case 'PRIEST':
      return 'Priest';
    default:
      return 'Hero';
  }
}
