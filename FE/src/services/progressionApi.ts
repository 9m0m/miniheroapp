import { apiClient } from './client';
import { Hero } from '@/types/hero.types';
import { ItemSlot, ItemInstance } from '@/types/game.types';

function normalizeHeroDto(h: any): Hero {
  const equipmentMap: Partial<Record<ItemSlot, ItemInstance>> = {};
  if (h.equippedItems && Array.isArray(h.equippedItems)) {
    h.equippedItems.forEach((item: any) => {
      if (item && item.equippedSlot) {
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
      }
    });
  }

  const templateId = h.heroTemplateId || h.templateId || '';
  return {
    id: h.id,
    name: h.name || templateId,
    heroClass: h.heroClass || null,
    templateId,
    role: h.role,
    level: h.level ?? 1,
    stars: h.stars ?? 1,
    shards: h.shards ?? 0,
    exp: h.exp ?? 0,
    currentHp: h.computedStats?.maxHp || (h.towerStats?.maxHp ? h.towerStats.maxHp : 150),
    equipment: equipmentMap,
    skillPoints: h.skillPoints ?? 0,
    skills: h.skills || {},
    computedStats: h.computedStats,
    towerStats: h.towerStats,
    liveDps: h.liveDps,
  };
}

/**
 * Tower & Hero Economy Progression API.
 * Every mutation REQUIRES a client-managed operationKey to enforce end-to-end idempotency.
 * Callers obtain and retain the operationKey via idempotencyManager across retry attempts.
 */
export const progressionApi = {
  /**
   * Level-up a hero to targetLevel with an explicit, client-retained operationKey.
   */
  async levelUpHero(heroId: string, targetLevel: number, operationKey: string): Promise<Hero> {
    if (!operationKey || operationKey.trim() === '') {
      throw new Error('progressionApi.levelUpHero requires a non-empty operationKey for idempotency.');
    }
    const res = await apiClient.post<any>(`/heroes/${heroId}/level-up`, {
      targetLevel,
      operationKey,
    });
    return normalizeHeroDto(res.data);
  },

  /**
   * Star-up a hero with an explicit, client-retained operationKey.
   */
  async starUpHero(heroId: string, operationKey: string): Promise<Hero> {
    if (!operationKey || operationKey.trim() === '') {
      throw new Error('progressionApi.starUpHero requires a non-empty operationKey for idempotency.');
    }
    const res = await apiClient.post<any>(`/heroes/${heroId}/star-up`, {
      operationKey,
    });
    return normalizeHeroDto(res.data);
  },

  /**
   * Enhance an item by one level with an explicit, client-retained operationKey.
   */
  async enhanceItem(itemId: string, operationKey: string): Promise<ItemInstance> {
    if (!operationKey || operationKey.trim() === '') {
      throw new Error('progressionApi.enhanceItem requires a non-empty operationKey for idempotency.');
    }
    const res = await apiClient.post<ItemInstance>(`/tower-gear/enhance`, {
      itemId,
      operationKey,
    });
    return res.data;
  },

  /**
   * Transfer enhancement level between two items with an explicit, client-retained operationKey.
   */
  async transferEnhance(
    sourceItemId: string,
    targetItemId: string,
    operationKey: string
  ): Promise<ItemInstance> {
    if (!operationKey || operationKey.trim() === '') {
      throw new Error('progressionApi.transferEnhance requires a non-empty operationKey for idempotency.');
    }
    const res = await apiClient.post<ItemInstance>(`/tower-gear/transfer`, {
      sourceItemId,
      targetItemId,
      operationKey,
    });
    return res.data;
  },

  /**
   * Salvage items for enhance stones with an explicit, client-retained operationKey.
   * Validates duplicate item IDs client-side to match backend rejection semantics.
   */
  async salvageItems(itemIds: string[], operationKey: string): Promise<{ stonesGained: number }> {
    if (!operationKey || operationKey.trim() === '') {
      throw new Error('progressionApi.salvageItems requires a non-empty operationKey for idempotency.');
    }
    if (!itemIds || itemIds.length === 0) {
      return { stonesGained: 0 };
    }
    const uniqueIds = new Set(itemIds);
    if (uniqueIds.size !== itemIds.length) {
      throw new Error('Duplicate item IDs provided in salvage request');
    }
    const sortedIds = Array.from(uniqueIds).sort();
    const res = await apiClient.post<{ stonesGained: number }>(`/tower-gear/salvage`, {
      itemIds: sortedIds,
      operationKey,
    });
    return res.data;
  },
};
