import { StateCreator } from 'zustand';
import { ItemInstance, ItemRarity, ItemType } from '@/types/game.types';
import { cubeApi } from '@/services/api';
import { idempotencyManager } from '@/services/idempotency';
import { inventoryApi } from '@/services/inventoryApi';

export interface WorkshopSlice {
  enhanceItem: (item: ItemInstance) => Promise<{ success: boolean; newLevel: number }>;
  transferEnhance: (sourceItemId: string, targetItemId: string) => Promise<{ success: boolean; updatedItem?: any }>;
  transmuteCube9: (
    selectedItems: ItemInstance[],
    itemType: ItemType
  ) => {
    resultItem: ItemInstance | null;
    isJackpot: boolean;
    isFallback: boolean;
  };
  smartFusion: (itemIds: string[]) => Promise<any>;
  gemFusion: (gemType: string, tier: number) => Promise<string>;
  inlayGem: (item: ItemInstance, gemId: string) => boolean;
  inlayGemToItem: (item: ItemInstance, gemId: string) => boolean;
  brewAlchemy: (recipeId: string) => boolean;
  craftAccessory: (recipeId: string) => Promise<boolean> | boolean;
  brewBlessing: (type: string) => boolean;
  blessItemWithScroll: (item: ItemInstance, blessingId: string) => boolean;
}

export const createWorkshopSlice: StateCreator<any, [], [], WorkshopSlice> = (set, get) => ({
  transferEnhance: async (sourceItemId: string, targetItemId: string) => {
    const { inventory, addFloatingText } = get();
    const payloadKey = `${sourceItemId}:${targetItemId}`;
    let operationKey: string;

    try {
      operationKey = idempotencyManager.getOrCreateKey('TRANSFER', payloadKey);
    } catch (keyErr: any) {
      addFloatingText?.(keyErr?.message || 'Cannot initiate transfer — not authenticated', 180, 70, '#EF4444', true);
      return { success: false };
    }

    try {
      const { progressionApi } = await import('@/services/progressionApi');
      const updatedItem = await progressionApi.transferEnhance(sourceItemId, targetItemId, operationKey);

      idempotencyManager.clearKey('TRANSFER', payloadKey);

      const updatedInventory = inventory.map((i: ItemInstance) => {
        if (i.id === targetItemId) {
          return { ...i, ...updatedItem };
        }
        if (i.id === sourceItemId) {
          return { ...i, enhanceLevel: 0 };
        }
        return i;
      });

      set({ inventory: updatedInventory });

      try {
        const { userApi } = await import('@/services/userApi');
        const profile = await userApi.getProfile();
        if (profile) {
          set({
            gold: profile.gold ?? get().gold,
            enhanceStones: profile.enhanceStones ?? get().enhanceStones,
          });
        }
      } catch {
        // Soft fallback
      }

      addFloatingText?.('Enhancement Transferred Successfully!', 180, 70, '#34D399', true);
      return { success: true, updatedItem };
    } catch (err: any) {
      idempotencyManager.handleMutationError('TRANSFER', payloadKey, err);
      if (err?.response?.status === 409) {
        addFloatingText?.('State conflict detected — re-syncing from server…', 180, 70, '#F59E0B', true);
        try {
          const { userApi } = await import('@/services/userApi');
          const [profile, freshInventory] = await Promise.all([
            userApi.getProfile(),
            inventoryApi.getInventory(),
          ]);
          if (profile) set({ gold: profile.gold, enhanceStones: profile.enhanceStones });
          if (freshInventory) set({ inventory: freshInventory });
          addFloatingText?.('State re-synced from server', 180, 70, '#34D399', true);
        } catch (syncErr: any) {
          const syncMsg = syncErr?.message || 'State sync failed — please refresh the page';
          addFloatingText?.(syncMsg, 180, 70, '#EF4444', true);
        }
      } else {
        const msg = err.response?.data?.message || err.message || 'Transfer failed on server';
        addFloatingText?.(msg, 180, 70, '#EF4444', true);
      }
      return { success: false };
    }
  },
  enhanceItem: async (item) => {
    const { inventory, gold, enhanceStones, addFloatingText } = get();
    const currentEnhance = item.enhanceLevel || 0;
    if (currentEnhance >= 15) {
      addFloatingText?.('Item is already at Max Enhancement (+15)!', 180, 70, '#F87171', true);
      return { success: false, newLevel: currentEnhance };
    }

    const ENHANCE_GOLD_COSTS = [
      100, 200, 300, 500, 800, 1200, 1700, 2300, 3000, 4000, 5500, 7500, 10000, 14000, 20000
    ];
    const ENHANCE_STONE_COSTS = [
      1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 18, 25
    ];

    const goldCost = currentEnhance < 15 ? ENHANCE_GOLD_COSTS[currentEnhance] : 0;
    const stoneCost = currentEnhance < 15 ? ENHANCE_STONE_COSTS[currentEnhance] : 0;

    if (gold < goldCost || enhanceStones < stoneCost) {
      addFloatingText?.(`Need ${goldCost} Gold & ${stoneCost} Stones to Enhance!`, 180, 70, '#F87171', true);
      return { success: false, newLevel: currentEnhance };
    }

    const payloadKey = `${item.id}:${currentEnhance}`;
    let operationKey: string;

    try {
      operationKey = idempotencyManager.getOrCreateKey('ENHANCE', payloadKey);
    } catch (keyErr: any) {
      addFloatingText?.(keyErr?.message || 'Cannot initiate enhance — not authenticated', 180, 70, '#EF4444', true);
      return { success: false, newLevel: currentEnhance };
    }

    try {
      const { progressionApi } = await import('@/services/progressionApi');
      const updatedItem = await progressionApi.enhanceItem(item.id, operationKey);

      // On successful terminal response, clear the pending key
      idempotencyManager.clearKey('ENHANCE', payloadKey);

      const newLevel = updatedItem.enhanceLevel;
      const updatedInventory = inventory.map((i: ItemInstance) => {

        if (i.id === item.id) {
          return { ...i, ...updatedItem, enhanceLevel: newLevel };
        }
        return i;
      });

      set({
        gold: Math.max(0, gold - goldCost),
        enhanceStones: Math.max(0, enhanceStones - stoneCost),
        inventory: updatedInventory,
      });

      try {
        const { userApi } = await import('@/services/userApi');
        const profile = await userApi.getProfile();
        if (profile) {
          set({
            gold: profile.gold ?? get().gold,
            enhanceStones: profile.enhanceStones ?? get().enhanceStones,
          });
        }
      } catch {
        // Soft fallback
      }

      addFloatingText?.(`Enhance SUCCESS! (+${newLevel})`, 180, 70, '#34D399', true);
      return { success: true, newLevel };
    } catch (err: any) {
      idempotencyManager.handleMutationError('ENHANCE', payloadKey, err);
      if (err?.response?.status === 409) {
        addFloatingText?.('State conflict detected — re-syncing from server…', 180, 70, '#F59E0B', true);
        try {
          const { userApi } = await import('@/services/userApi');
          const [profile, freshInventory] = await Promise.all([
            userApi.getProfile(),
            inventoryApi.getInventory(),
          ]);
          if (profile) set({ gold: profile.gold, enhanceStones: profile.enhanceStones });
          if (freshInventory) {
            set({ inventory: freshInventory });
            // P2: Update enhancingItem so the open Enhance modal shows authoritative state.
            const currentEnhancingItem = get().enhancingItem;
            if (currentEnhancingItem) {
              const refreshed = freshInventory.find((i: ItemInstance) => i.id === currentEnhancingItem.id);
              if (refreshed) set({ enhancingItem: refreshed });
            }
          }
          addFloatingText?.('State re-synced from server', 180, 70, '#34D399', true);
        } catch (syncErr: any) {
          const syncMsg = syncErr?.message || 'State sync failed — please refresh the page';
          addFloatingText?.(syncMsg, 180, 70, '#EF4444', true);
        }
      } else {
        const msg = err.response?.data?.message || err.message || 'Enhance failed on server';
        addFloatingText?.(msg, 180, 70, '#EF4444', true);
      }
      return { success: false, newLevel: currentEnhance };
    }
  },

  transmuteCube9: (selectedItems, itemType) => {
    const { inventory, templates, addFloatingText } = get();

    if (selectedItems.length !== 9) {
      addFloatingText?.('The Cube requires exactly 9 Items of the same Rarity!', 180, 70, '#F87171', true);
      return { resultItem: null, isJackpot: false, isFallback: false };
    }

    const baseRarity = selectedItems[0].rarity;
    const allSameRarity = selectedItems.every((i) => i.rarity === baseRarity);
    if (!allSameRarity) {
      addFloatingText?.('All 9 items must share the exact same Rarity!', 180, 70, '#F87171', true);
      return { resultItem: null, isJackpot: false, isFallback: false };
    }

    const rarityOrder: ItemRarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'ANCIENT'];
    const currentIdx = rarityOrder.indexOf(baseRarity);
    if (currentIdx === -1 || currentIdx >= rarityOrder.length - 1) {
      addFloatingText?.('Item is already at Celestial Max Rarity!', 180, 70, '#F87171', true);
      return { resultItem: null, isJackpot: false, isFallback: false };
    }

    // 10% Jackpot probability for +2 tiers jump
    const roll = Math.random();
    let targetRarityIdx = currentIdx + 1;
    let isJackpot = false;
    let isFallback = false;

    if (roll < 0.10 && currentIdx + 2 < rarityOrder.length) {
      targetRarityIdx = currentIdx + 2;
      isJackpot = true;
    }

    let targetRarity = rarityOrder[targetRarityIdx];

    // Find candidate templates matching targetRarity and itemType
    const candidateTemplates = Object.values(templates).filter((tpl: any) => {
      if (tpl.rarity !== targetRarity) return false;
      if (tpl.itemType === 'CHEST' || tpl.itemType === 'KEY') return false;
      if (itemType === 'EQUIPMENT') return tpl.itemType === 'EQUIPMENT';
      if (itemType === 'ACCESSORY') return tpl.itemType === 'ACCESSORY';
      if (itemType === 'MATERIAL') return tpl.itemType === 'MATERIAL';
      if (itemType === 'GEM') return tpl.itemType === 'GEM';
      return true;
    });

    let chosenTpl: any = null;
    if (candidateTemplates.length > 0) {
      chosenTpl = candidateTemplates[Math.floor(Math.random() * candidateTemplates.length)];
    } else {
      // Graceful fallback to random template of same rarity
      const fallbackList = Object.values(templates).filter(
        (t: any) => t.rarity === baseRarity && t.itemType !== 'CHEST' && t.itemType !== 'KEY'
      );
      chosenTpl = fallbackList[Math.floor(Math.random() * fallbackList.length)] || templates[selectedItems[0].templateId];
      targetRarity = baseRarity;
      isFallback = true;
    }

    // Generate new item instance
    const avgItemLevel = Math.round(
      selectedItems.reduce((acc, it) => acc + (it.itemLevel || 1), 0) / selectedItems.length
    );

    const resultItem: ItemInstance = {
      id: `cube_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      templateId: chosenTpl.id,
      rarity: targetRarity,
      itemLevel: Math.max(1, avgItemLevel + (isJackpot ? 5 : 2)),
      enhanceLevel: 0,
      sockets: [],
    };

    // Remove 9 consumed items and add new transmuted item
    const consumedIds = new Set(selectedItems.map((i) => i.id));
    const newInventory = inventory.filter((it: ItemInstance) => !consumedIds.has(it.id));
    newInventory.push(resultItem);

    set({
      inventory: newInventory,
    });

    if (isJackpot) {
      addFloatingText?.(`JACKPOT TRANSMUTATION! Created [${targetRarity}] ${chosenTpl.name}!`, 180, 50, '#EC4899', true);
    } else if (isFallback) {
      addFloatingText?.(`Transmuted: Retained [${targetRarity}] ${chosenTpl.name}`, 180, 50, '#F59E0B');
    } else {
      addFloatingText?.(`Transmuted 9 Items into [${targetRarity}] ${chosenTpl.name}!`, 180, 50, '#34D399');
    }

    // Server-Side Authoritative Transmutation Sync
    const userId = get().userId;
    if (userId) {
      cubeApi.transmute9(userId, selectedItems.map((i) => i.id), itemType).then((res) => {
        if (res && res.resultItem) {
          set((s: any) => ({
            inventory: s.inventory.map((it: ItemInstance) => (it.id === resultItem.id ? res.resultItem : it)),
            gold: res.remainingGold ?? s.gold,
          }));
        }
      }).catch((err) => {
        console.warn('Backend transmute9 sync error (fallback active):', err);
      });
    }

    return { resultItem, isJackpot, isFallback };
  },

  smartFusion: async (itemIds) => {
    const { inventory, transmuteCube9 } = get();
    const items = itemIds.map((id: string) => inventory.find((i: ItemInstance) => i.id === id)).filter(Boolean);
    if (items.length >= 3) {
      // Compatibility wrapper
      return transmuteCube9(items, 'EQUIPMENT');
    }
    return null;
  },

  gemFusion: async (gemType, tier) => {
    const { addFloatingText } = get();
    addFloatingText?.(`Synthesized Tier ${tier + 1} ${gemType}!`, 180, 70, '#38BDF8');
    return `Tier ${tier + 1} ${gemType}`;
  },

  inlayGem: (item, gemId) => {
    const { inventory, addFloatingText } = get();
    const currentSockets = item.sockets || [];
    if (currentSockets.length >= 3) {
      addFloatingText?.('Item already has maximum 3 sockets filled!', 180, 70, '#F87171', true);
      return false;
    }

    const updated = inventory.map((i: ItemInstance) => {
      if (i.id === item.id) {
        return { ...i, sockets: [...currentSockets, gemId] };
      }
      return i;
    });

    set({ inventory: updated });
    addFloatingText?.('Inlaid Gem successfully!', 180, 70, '#38BDF8');
    return true;
  },

  inlayGemToItem: (item, gemId) => get().inlayGem(item, gemId),

  brewAlchemy: (_recipeId) => {
    const { gold, addFloatingText } = get();
    const cost = 500;
    if (gold < cost) {
      addFloatingText?.('Not enough Gold to brew potion!', 180, 70, '#F87171', true);
      return false;
    }

    set({ gold: gold - cost });
    addFloatingText?.('Brewed Alchemy Elixir!', 180, 70, '#A855F7');
    return true;
  },

  craftAccessory: (_recipeId) => {
    const { gold, addFloatingText } = get();
    const cost = 800;
    if (gold < cost) {
      addFloatingText?.('Not enough Gold to craft accessory!', 180, 70, '#F87171', true);
      return false;
    }
    set({ gold: gold - cost });
    addFloatingText?.('Crafted Fine Accessory!', 180, 70, '#34D399');
    return true;
  },

  brewBlessing: (type) => {
    const { gold, addFloatingText } = get();
    set({ gold: gold - 500 });
    addFloatingText?.(`Crafted Blessing Scroll (${type})!`, 180, 70, '#38BDF8');
    return true;
  },

  blessItemWithScroll: (item, blessingId) => {
    const { inventory, addFloatingText } = get();
    const updated = inventory.map((i: ItemInstance) => {
      if (i.id === item.id) {
        return { ...i, blessingId };
      }
      return i;
    });
    set({ inventory: updated });
    addFloatingText?.(`Blessed ${item.id} with ${blessingId}!`, 180, 70, '#34D399');
    return true;
  },
});
