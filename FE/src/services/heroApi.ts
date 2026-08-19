import { apiClient } from './client';
import { Hero, ItemInstance, ItemSlot, HeroClass } from '../types/game.types';

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

      const templateId = h.heroTemplateId || h.templateId || (h.heroClass === 'WARRIOR' ? 'hero.warrior' : h.heroClass === 'RANGER' ? 'hero.ranger' : h.heroClass === 'MAGE' ? 'hero.wizard' : 'hero.priest');
      const role = h.role || (h.heroClass === 'WARRIOR' ? 'BRUISER' : h.heroClass === 'RANGER' ? 'MARKSMAN' : h.heroClass === 'MAGE' ? 'MAGE' : 'SUPPORT');

      return {
        id: h.id,
        name: h.heroClass ? getHeroNameByClass(h.heroClass) : (h.name || templateId),
        heroClass: h.heroClass || null,
        templateId,
        role,
        level: h.level || 1,
        stars: h.stars || 1,
        shards: h.shards || 0,
        exp: h.exp || 0,
        currentHp: h.computedStats?.maxHp || (h.towerStats?.maxHp ? h.towerStats.maxHp : 150),
        equipment: equipmentMap,
        skillPoints: 0,
        skills: h.skills || {},
        computedStats: h.computedStats,
        towerStats: h.towerStats,
        liveDps: h.liveDps,
      };
    });
  },

  /**
   * Hồi sinh ngay lập tức 1 Tướng bằng 10 Gems (Server-Authoritative)
   */
  reviveHero: async (heroClass: HeroClass, userId?: string): Promise<{ remainingGems: number; cost: number; message: string }> => {
    const res = await apiClient.post<any>('/heroes/revive', { heroClass }, {
      params: userId ? { userId } : {},
    });
    return res.data;
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
