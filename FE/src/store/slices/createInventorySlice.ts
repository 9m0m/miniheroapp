import { StateCreator } from 'zustand';
import { HeroClass, ItemSlot, ItemRarity } from '../../types/enums';
import { ItemInstance } from '../../types/item.types';
import { inventoryApi } from '../../services/inventoryApi';
import { idempotencyManager } from '@/services/idempotency';

export interface InventorySlice {
  inventory: ItemInstance[];
  maxInventorySlots: number;
  stashItems: Record<number, ItemInstance[]>;
  activeStashTab: number;
  unlockedStashTabs: number[];
  enhancingItem: ItemInstance | null;
  openedRewardItem: ItemInstance | null;

  setEnhancingItem: (item: ItemInstance | null) => void;
  setOpenedRewardItem: (item: ItemInstance | null) => void;
  expandInventorySlots: () => boolean;
  unlockSingleSlot: () => boolean;
  unlockSlotToIndex: (targetSlotIndex: number) => boolean;
  unlockStashTab: (tab: number) => boolean;
  setActiveStashTab: (tab: number) => void;
  equipItem: (heroClass: HeroClass, item: ItemInstance) => void;
  unequipItem: (heroClass: HeroClass, slot: ItemSlot) => void;
  moveToStash: (item: ItemInstance, targetTab?: number) => boolean;
  moveToInventory: (item: ItemInstance) => boolean;
  salvageItem: (item: ItemInstance) => void;
  salvageTowerGear: (itemIds: string[]) => Promise<{ success: boolean; stonesGained?: number }>;
  sortInventory: () => void;
}

export const createInventorySlice: StateCreator<any, [], [], InventorySlice> = (set, get) => ({
  inventory: [],
  maxInventorySlots: 42,
  stashItems: {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
  },
  activeStashTab: 1,
  unlockedStashTabs: [1],
  enhancingItem: null,
  openedRewardItem: null,

  setEnhancingItem: (item) => set({ enhancingItem: item }),
  setOpenedRewardItem: (item) => set({ openedRewardItem: item }),

  expandInventorySlots: () => {
    return get().unlockSingleSlot();
  },

  unlockSingleSlot: () => {
    const { gold, maxInventorySlots, userId, addFloatingText } = get();
    if (maxInventorySlots >= 90) {
      addFloatingText?.('Maximum Backpack Capacity (90 slots) reached!', 180, 70, '#F87171', true);
      return false;
    }
    const extraSlots = Math.max(0, maxInventorySlots - 18);
    const cost = 250 + extraSlots * 25;
    if (gold < cost) {
      addFloatingText?.(`Need ${cost.toLocaleString()} Gold to unlock slot #${maxInventorySlots + 1}!`, 180, 70, '#F87171', true);
      return false;
    }
    const nextSlots = maxInventorySlots + 1;
    set({
      gold: gold - cost,
      maxInventorySlots: nextSlots,
    });
    addFloatingText?.(`Unlocked Slot #${nextSlots}! (${nextSlots}/90)`, 180, 70, '#34D399');

    if (userId) {
      inventoryApi.unlockSlots(userId, nextSlots).catch(console.warn);
    }
    return true;
  },

  unlockSlotToIndex: (targetSlotIndex: number) => {
    const { gold, maxInventorySlots, userId, addFloatingText } = get();
    if (targetSlotIndex <= maxInventorySlots) return false;
    const clampedTarget = Math.min(90, targetSlotIndex);
    const slotsToBuy = clampedTarget - maxInventorySlots;
    if (slotsToBuy <= 0) return false;

    let totalCost = 0;
    for (let i = 0; i < slotsToBuy; i++) {
      const extraSlots = Math.max(0, (maxInventorySlots + i) - 18);
      totalCost += 250 + extraSlots * 25;
    }
    if (gold < totalCost) {
      addFloatingText?.(`Need ${totalCost.toLocaleString()} Gold to unlock up to slot #${clampedTarget}!`, 180, 70, '#F87171', true);
      return false;
    }
    set({
      gold: gold - totalCost,
      maxInventorySlots: clampedTarget,
    });
    addFloatingText?.(`Unlocked +${slotsToBuy} Slots! (${clampedTarget}/90)`, 180, 70, '#34D399');

    if (userId) {
      inventoryApi.unlockSlots(userId, clampedTarget).catch(console.warn);
    }
    return true;
  },

  unlockStashTab: (tab: number) => {
    const { gems, unlockedStashTabs, addFloatingText } = get();
    if (unlockedStashTabs.includes(tab)) return false;
    const cost = 100;
    if (gems < cost) {
      addFloatingText?.(`Need ${cost} Gems to unlock Stash Tab ${tab}!`, 180, 70, '#F87171', true);
      return false;
    }
    set({
      gems: gems - cost,
      unlockedStashTabs: [...unlockedStashTabs, tab],
      activeStashTab: tab,
    });
    addFloatingText?.(`Stash Tab ${tab} Unlocked (72 Slots)!`, 180, 70, '#38BDF8');
    return true;
  },

  setActiveStashTab: (tab) => set({ activeStashTab: tab }),

  equipItem: (heroClass, item) => {
    const { heroes, inventory, templates, userId, addFloatingText } = get();
    const hero = heroes[heroClass];
    const template = templates[item.templateId];

    if (!hero || !template) return;

    if (template.requiredClass && template.requiredClass !== heroClass) {
      addFloatingText?.(`Item requires ${template.requiredClass}!`, 180, 70, '#F87171', true);
      return;
    }

    const targetSlot = template.slot;
    const currentEquipped = hero.equipment[targetSlot];

    let newInventory = inventory.filter((i: ItemInstance) => i.id !== item.id);
    if (currentEquipped) {
      newInventory = [...newInventory, currentEquipped];
    }

    const updatedHero = {
      ...hero,
      equipment: {
        ...hero.equipment,
        [targetSlot]: item,
      },
    };

    set({
      heroes: { ...heroes, [heroClass]: updatedHero },
      inventory: newInventory,
    });

    addFloatingText?.(`Equipped ${template.name}`, 180, 70, '#34D399');

    // Background BE sync
    if (userId && hero.id && item.id) {
      inventoryApi.equipItem(userId, hero.id, item.id, targetSlot).catch((err) => {
        console.warn('Backend sync equip fallback to local state:', err);
      });
    }
  },

  unequipItem: (heroClass, slot) => {
    const { heroes, inventory, maxInventorySlots, templates, userId, addFloatingText } = get();
    const hero = heroes[heroClass];
    if (!hero) return;

    const equippedItem = hero.equipment[slot];
    if (!equippedItem) return;

    if (inventory.length >= maxInventorySlots) {
      addFloatingText?.('Backpack is full! Expand slots or salvage items.', 180, 70, '#F87171', true);
      return;
    }

    const newEquip = { ...hero.equipment };
    delete newEquip[slot];

    const updatedHero = {
      ...hero,
      equipment: newEquip,
    };

    set({
      heroes: { ...heroes, [heroClass]: updatedHero },
      inventory: [...inventory, equippedItem],
    });

    const template = templates[equippedItem.templateId];
    addFloatingText?.(`Unequipped ${template?.name || 'Item'}`, 180, 70, '#38BDF8');

    // Background BE sync
    if (userId && equippedItem.id) {
      inventoryApi.unequipItem(userId, equippedItem.id).catch((err) => {
        console.warn('Backend sync unequip fallback to local state:', err);
      });
    }
  },

  moveToStash: (item, targetTab) => {
    const { inventory, stashItems, activeStashTab, unlockedStashTabs, addFloatingText } = get();
    const tab = targetTab || activeStashTab;

    if (!unlockedStashTabs.includes(tab)) {
      addFloatingText?.(`Stash Tab ${tab} is locked! Unlock it first.`, 180, 70, '#F87171', true);
      return false;
    }

    const currentTabItems = stashItems[tab] || [];
    if (currentTabItems.length >= 72) {
      addFloatingText?.(`Stash Tab ${tab} is full (Max 72 items)!`, 180, 70, '#F87171', true);
      return false;
    }

    const newStash: Record<number, ItemInstance[]> = { ...stashItems };
    newStash[tab] = [...currentTabItems, item];

    set({
      inventory: inventory.filter((i: ItemInstance) => i.id !== item.id),
      stashItems: newStash,
    });
    addFloatingText?.(`Moved to Stash Tab ${tab}`, 180, 70, '#38BDF8');
    return true;
  },

  moveToInventory: (item) => {
    const { inventory, stashItems, maxInventorySlots, addFloatingText } = get();

    if (inventory.length >= maxInventorySlots) {
      addFloatingText?.('Backpack is full! Expand slots or salvage items.', 180, 70, '#F87171', true);
      return false;
    }

    const newStash: Record<number, ItemInstance[]> = { ...stashItems };
    for (const tabKey of Object.keys(stashItems)) {
      const tabNum = Number(tabKey);
      newStash[tabNum] = (newStash[tabNum] || []).filter((i: ItemInstance) => i.id !== item.id);
    }

    set({
      inventory: [...inventory, item],
      stashItems: newStash,
    });
    addFloatingText?.('Moved to Backpack', 180, 70, '#34D399');
    return true;
  },

  salvageItem: (item) => {
    const { inventory, enhanceStones, gold, addFloatingText } = get();

    const rarityGold: Record<ItemRarity, number> = {
      COMMON: 50,
      UNCOMMON: 150,
      RARE: 400,
      EPIC: 1200,
      LEGENDARY: 3500,
      MYTHIC: 10000,
      ANCIENT: 30000,
    };

    const goldReward = rarityGold[item.rarity] || 50;
    const stoneReward = item.rarity === 'COMMON' ? 1 : item.rarity === 'UNCOMMON' ? 2 : 4;

    set({
      inventory: inventory.filter((i: ItemInstance) => i.id !== item.id),
      gold: gold + goldReward,
      enhanceStones: enhanceStones + stoneReward,
    });

    addFloatingText?.(`Salvaged: +${goldReward} Gold, +${stoneReward} Stones`, 180, 70, '#F59E0B');
  },

  salvageTowerGear: async (itemIds: string[]) => {
    if (!itemIds || itemIds.length === 0) {
      return { success: false };
    }
    const uniqueIds = new Set(itemIds);
    if (uniqueIds.size !== itemIds.length) {
      get().addFloatingText?.('Duplicate item IDs in salvage selection', 180, 70, '#EF4444', true);
      return { success: false };
    }

    const sortedIds = Array.from(uniqueIds).sort();
    const payloadKey = sortedIds.join(',');
    let operationKey: string;

    try {
      operationKey = idempotencyManager.getOrCreateKey('SALVAGE', payloadKey);
    } catch (keyErr: any) {
      get().addFloatingText?.(keyErr?.message || 'Cannot initiate salvage — not authenticated', 180, 70, '#EF4444', true);
      return { success: false };
    }

    try {
      const { progressionApi } = await import('@/services/progressionApi');
      const res = await progressionApi.salvageItems(sortedIds, operationKey);


      idempotencyManager.clearKey('SALVAGE', payloadKey);

      const { inventory, enhanceStones, addFloatingText } = get();
      const removedSet = new Set(sortedIds);
      const updatedInventory = inventory.filter((i: ItemInstance) => !removedSet.has(i.id));

      set({
        inventory: updatedInventory,
        enhanceStones: enhanceStones + res.stonesGained,
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

      addFloatingText?.(`Salvaged: +${res.stonesGained} Stones`, 180, 70, '#F59E0B', true);
      return { success: true, stonesGained: res.stonesGained };
    } catch (err: any) {
      idempotencyManager.handleMutationError('SALVAGE', payloadKey, err);
      if (err?.response?.status === 409) {
        get().addFloatingText?.('State conflict detected — re-syncing from server…', 180, 70, '#F59E0B', true);
        try {
          const { userApi } = await import('@/services/userApi');
          const [profile, freshInventory] = await Promise.all([
            userApi.getProfile(),
            inventoryApi.getInventory(),
          ]);
          if (profile) set({ gold: profile.gold, enhanceStones: profile.enhanceStones });
          if (freshInventory) set({ inventory: freshInventory });
          get().addFloatingText?.('State re-synced from server', 180, 70, '#34D399', true);
        } catch (syncErr: any) {
          const syncMsg = (syncErr as any)?.message || 'State sync failed — please refresh the page';
          get().addFloatingText?.(syncMsg, 180, 70, '#EF4444', true);
        }
      } else {
        const msg = err.response?.data?.message || err.message || 'Salvage failed on server';
        get().addFloatingText?.(msg, 180, 70, '#EF4444', true);
      }
      return { success: false };
    }
  },

  sortInventory: () => {
    const { inventory, templates, addFloatingText } = get();
    const rarityWeight: Record<ItemRarity, number> = {
      ANCIENT: 7,
      MYTHIC: 6,
      LEGENDARY: 5,
      EPIC: 4,
      RARE: 3,
      UNCOMMON: 2,
      COMMON: 1,
    };

    const sorted = [...inventory].sort((a: ItemInstance, b: ItemInstance) => {
      const wA = rarityWeight[a.rarity as ItemRarity] || 0;
      const wB = rarityWeight[b.rarity as ItemRarity] || 0;
      if (wA !== wB) return wB - wA;

      const tA = templates[a.templateId]?.name || '';
      const tB = templates[b.templateId]?.name || '';
      return tA.localeCompare(tB);
    });

    set({ inventory: sorted });
    addFloatingText?.('Inventory Sorted by Rarity', 180, 70, '#38BDF8');
  },
});
