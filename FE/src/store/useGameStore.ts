import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { HeroClass, ItemSlot } from '../types/enums';
import { ItemInstance, ItemTemplate } from '../types/item.types';
import { Hero } from '../types/hero.types';
import { STARTER_TEMPLATES } from '../constants/starterTemplates';
import { gameApi, inventoryApi } from '../services/api';
import { authenticateUser } from '../services/minikit';
import { createHeroSlice, HeroSlice, sanitizeCoreV2Party } from './slices/createHeroSlice';
import { createInventorySlice, InventorySlice } from './slices/createInventorySlice';
import { createBattleSlice, BattleSlice } from './slices/createBattleSlice';
import { createWorkshopSlice, WorkshopSlice } from './slices/createWorkshopSlice';
import { createMonetizationSlice, MonetizationSlice } from './slices/createMonetizationSlice';
import { evaluateHeroLiveStats } from '../engine/statEvaluator';
import { idempotencyManager } from '../services/idempotency';

import { configApi, FeatureFlags } from '../services/configApi';
import { onboardingApi } from '../services/onboardingApi';
import { expeditionApi } from '../services/expeditionApi';
import { towerApi } from '../services/towerApi';
import { OnboardingState } from '../types/onboarding.types';
import { ExpeditionRun } from '../types/expedition.types';
import { TowerProgressDto } from '../types/tower.types';

export interface GameStoreState
  extends HeroSlice,
    InventorySlice,
    BattleSlice,
    WorkshopSlice,
    MonetizationSlice {
  sessionStatus: 'idle' | 'bootstrapping' | 'ready' | 'recovering' | 'failed' | 'auth_required';
  templates: Record<string, ItemTemplate>;
  featureFlags: FeatureFlags;
  onboardingState: OnboardingState | null;
  activeExpeditions: ExpeditionRun[];
  towerProgress: TowerProgressDto | null;
  fetchInitialData: () => Promise<void>;
  refreshOnboarding: () => Promise<void>;
  refreshExpeditions: () => Promise<void>;
  refreshTowerProgress: () => Promise<void>;
  resetUserSession: () => void;
}

const INITIAL_STARTER_BAG: ItemInstance[] = [
  { id: 'bag_init_swd', templateId: 'wpn_iron_sword', itemLevel: 1, rarity: 'COMMON', enhanceLevel: 0, sockets: [] },
  { id: 'bag_init_shd', templateId: 'shd_iron_shield', itemLevel: 1, rarity: 'COMMON', enhanceLevel: 0, sockets: [] },
  { id: 'bag_init_bow', templateId: 'wpn_hunting_bow', itemLevel: 1, rarity: 'COMMON', enhanceLevel: 0, sockets: [] },
  { id: 'bag_init_wnd', templateId: 'wpn_apprentice_wand', itemLevel: 1, rarity: 'COMMON', enhanceLevel: 0, sockets: [] },
  { id: 'bag_init_orb', templateId: 'wpn_void_orb', itemLevel: 1, rarity: 'COMMON', enhanceLevel: 0, sockets: [] },
];

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get, api) => ({
      sessionStatus: 'bootstrapping',
      templates: STARTER_TEMPLATES,
      featureFlags: {
        coreV2Enabled: true,
        towerV2Enabled: true,
        paidRecruitmentEnabled: true,
        paidExpeditionSlotsEnabled: true,
      },
      onboardingState: null,
      activeExpeditions: [],
      towerProgress: null,

      ...createHeroSlice(set, get, api),
      ...createInventorySlice(set, get, api),
      ...createBattleSlice(set, get, api),
      ...createWorkshopSlice(set, get, api),
      ...createMonetizationSlice(set, get, api),

      // Hydrate state from Spring Boot Backend
      fetchInitialData: async () => {
        try {
          if (get().sessionStatus !== 'ready') {
            set({ sessionStatus: 'bootstrapping' });
          }

          // Auto-authenticate with World App or Local Dev session
          await authenticateUser().catch(() => null);

          // 0. Fetch live Item Templates from Server Database
          const remoteTemplates = await inventoryApi.getItemTemplates().catch(() => []);
          const templatesMap: Record<string, ItemTemplate> = { ...STARTER_TEMPLATES };
          if (remoteTemplates && remoteTemplates.length > 0) {
            remoteTemplates.forEach((tpl: any) => {
              const stats = tpl.baseStats || {};
              const rawSlot = tpl.slot || tpl.slotType || 'MAIN_HAND';
              const standardizedSlot = (rawSlot === 'RING_2' ? 'RING_1' : ['NECKLACE', 'EARRING'].includes(rawSlot) ? 'TALISMAN' : rawSlot) as ItemSlot;

              templatesMap[tpl.id] = {
                id: tpl.id,
                name: tpl.name,
                description: tpl.description || '',
                itemType: tpl.itemType || (tpl.id.startsWith('chest_') ? 'CHEST' : tpl.id.startsWith('key_') ? 'KEY' : ['RING_1', 'TALISMAN'].includes(standardizedSlot) ? 'ACCESSORY' : 'EQUIPMENT'),
                slot: standardizedSlot,
                baseRarity: tpl.baseRarity || tpl.rarity || 'COMMON',
                elementalType: tpl.elementalType || 'PHYSICAL',
                requiredClass: tpl.requiredClass || null,
                iLvlScalingFactor: tpl.iLvlScalingFactor || tpl.ilvlScalingFactor || 1.0,
                baseStats: {
                  physAtk: stats.physAtk ?? tpl.basePhysAtk ?? 0,
                  magicAtk: stats.magicAtk ?? tpl.baseMagicAtk ?? 0,
                  atkPercent: stats.atkPercent ?? tpl.baseAtkPercent ?? 0,
                  atkSpeed: stats.atkSpeed ?? tpl.baseAtkSpeed ?? 0,
                  critRate: stats.critRate ?? tpl.baseCritRate ?? 0,
                  critDmg: stats.critDmg ?? tpl.baseCritDmg ?? 0,
                  elemDmgBonus: stats.elemDmgBonus ?? tpl.baseElemDmgBonus ?? 0,
                  maxHp: stats.maxHp ?? tpl.baseMaxHp ?? 0,
                  armor: stats.armor ?? tpl.baseArmor ?? 0,
                  dmgReduction: stats.dmgReduction ?? tpl.baseDmgReduction ?? 0,
                  hpRegen: stats.hpRegen ?? tpl.baseHpRegen ?? 0,
                  lifeSteal: stats.lifeSteal ?? tpl.baseLifeSteal ?? 0,
                  physDodge: stats.physDodge ?? tpl.basePhysDodge ?? 0,
                  spellEvasion: stats.spellEvasion ?? tpl.baseSpellEvasion ?? 0,
                  cdr: stats.cdr ?? tpl.baseCdr ?? 0,
                },
              };
            });
          }

          // 1. Fetch user profile
          const userProfile = await gameApi.getProfile().catch(() => null);
          if (!userProfile || !userProfile.id) {
            set({ templates: templatesMap, sessionStatus: 'auth_required' });
            return;
          }

          const userId = userProfile.id;
          // Synchronously initialize durable idempotency manager with authoritative userId before any economy actions
          idempotencyManager.setUserId(userId);

          // 2. Fetch parallel game modules
          const [
            heroesListResult,
            bagItemsResult,
            chestVaultDto,
            monetizationStatus,
            featureFlags,
            onboardingState,
            activeExpeditions,
            towerProgress,
          ] = await Promise.all([
            gameApi.getHeroes(userId).then((data) => ({ ok: true, data })).catch(() => ({ ok: false, data: null })),
            gameApi.getInventory(userId).then((data) => ({ ok: true, data })).catch(() => ({ ok: false, data: null })),
            gameApi.getChestVault(userId).catch(() => null),
            gameApi.getMonetizationStatus(userId).catch(() => null),
            configApi.getFeatureFlags().catch(() => ({
              coreV2Enabled: true,
              towerV2Enabled: true,
              paidRecruitmentEnabled: true,
              paidExpeditionSlotsEnabled: true,
            })),
            onboardingApi.getState().catch(() => null),
            expeditionApi.getActiveRuns(userId).catch(() => []),
            towerApi.getMyProgress().catch(() => null),
          ]);

          // 3. Hydrate heroes into the Core v2 authoritative instance mapping
          const ownedHeroesById: Record<string, any> = {};
          const heroesMap: Record<HeroClass, Hero> = {} as any;
          const heroHp: Record<HeroClass, number> = {} as any;

          if (heroesListResult.ok && Array.isArray(heroesListResult.data)) {
            heroesListResult.data.forEach((h: any) => {
              const equipMap: Partial<Record<ItemSlot, ItemInstance>> = { ...(h.equipment || {}) };
              if ((h as any).equippedItems && Array.isArray((h as any).equippedItems)) {
                (h as any).equippedItems.forEach((inst: any) => {
                  const slot = (inst.template?.slotType || inst.equippedSlot) as ItemSlot;
                  if (slot) {
                    equipMap[slot] = {
                      id: inst.id,
                      templateId: inst.template?.id || inst.templateId,
                      itemLevel: inst.itemLevel,
                      rarity: inst.currentRarity || inst.rarity,
                      enhanceLevel: inst.enhanceLevel || 0,
                      sockets: inst.sockets || [],
                      blessingId: inst.blessingId,
                      computedStats: inst.computedStats,
                    };
                  }
                });
              }

              const cleanName = h.name && !h.name.startsWith('hero.')
                ? h.name
                : (h.heroTemplateId === 'hero.knight' ? 'Knight' : h.heroTemplateId === 'hero.ranger' ? 'Ranger' : (h.name || h.heroTemplateId || 'Hero'));

              const heroObj: any = {
                id: h.id,
                name: cleanName,
                role: h.role || (h.heroTemplateId?.includes('knight') ? 'TANK' : h.heroTemplateId?.includes('ranger') ? 'MARKSMAN' : 'BRUISER'),
                heroClass: h.heroClass || (h.heroTemplateId?.includes('knight') ? 'WARRIOR' : h.heroTemplateId?.includes('ranger') ? 'RANGER' : 'WARRIOR'),
                level: h.level || 1,
                stars: h.stars || 1,
                shards: h.shards || 0,
                busyStatus: h.busyStatus || 'IDLE',
                equipment: equipMap,
                exp: h.exp || 0,
                skillPoints: h.skillPoints || 0,
                skills: h.skills || {},
                templateId: h.heroTemplateId || h.templateId || 'hero.knight',
              };

              const liveStats = evaluateHeroLiveStats(
                heroObj,
                templatesMap
              );
              heroObj.computedStats = liveStats;

              heroObj.towerStats = {
                atk: liveStats.physAtk || liveStats.magicAtk || 100,
                maxHp: liveStats.maxHp || 1000,
                speed: liveStats.atkSpeed ? Math.round(liveStats.atkSpeed * 100) : 100,
                critRate: liveStats.critRate || 0.05,
                critDmg: liveStats.critDmg || 1.5,
                armor: liveStats.armor || 50,
              };

              // Core v2 Authoritative instance mapping
              ownedHeroesById[h.id] = heroObj;

              // Legacy Campaign Adapter: only map if heroClass is present
              if (h.heroClass) {
                heroesMap[h.heroClass as HeroClass] = {
                  ...heroObj,
                  computedStats: liveStats,
                };
                heroHp[h.heroClass as HeroClass] = liveStats.maxHp;
              }
            });
          } else {
            // Retain cached state on network/server fetch failure
            Object.assign(ownedHeroesById, get().ownedHeroesById);
            Object.assign(heroesMap, get().heroes);
            Object.assign(heroHp, get().heroHp);
          }

          // Reconcile and sanitize Core v2 party (UUID-based) — dedupe, ownership check, max 3
          const currentCoreParty = get().coreV2Party || [];
          const sanitizedCoreParty = sanitizeCoreV2Party(currentCoreParty, ownedHeroesById);

          // Reconcile and sanitize legacy Campaign activeParty (class-based)
          const validClasses = new Set(Object.keys(heroesMap));
          const currentLegacyParty = get().activeParty || [];
          const sanitizedLegacyParty = currentLegacyParty.filter((c) => validClasses.has(c));

          // 4. Transform Inventory (Preserve Stash isolation & exclude chests)
          const currentStash = get().stashItems || {};
          const currentStashIds = new Set<string>();
          Object.values(currentStash).forEach((tabItems) => {
            (tabItems || []).forEach((it) => currentStashIds.add(it.id));
          });

          let finalInventory: ItemInstance[];
          if (bagItemsResult.ok && Array.isArray(bagItemsResult.data)) {
            finalInventory = bagItemsResult.data
              .filter((inst: any) => !currentStashIds.has(inst.id) && !inst.templateId?.startsWith('chest_') && inst.template?.itemType !== 'CHEST')
              .map((inst: any) => ({
                id: inst.id,
                templateId: inst.template?.id || inst.templateId,
                itemLevel: inst.itemLevel,
                rarity: inst.currentRarity || inst.rarity,
                enhanceLevel: inst.enhanceLevel || 0,
                sockets: inst.sockets || [],
                blessingId: inst.blessingId,
                computedStats: inst.computedStats,
              }));
          } else {
            // Keep local cached inventory if request failed (prevent clearing bag on 5xx/401/timeout)
            finalInventory = get().inventory || [];
          }

          // 5. Update State
          set({
            userId,
            sessionStatus: 'ready',
            templates: templatesMap,
            featureFlags: featureFlags || {
              coreV2Enabled: true,
              towerV2Enabled: true,
              paidRecruitmentEnabled: true,
              paidExpeditionSlotsEnabled: true,
            },
            onboardingState,
            activeExpeditions: activeExpeditions || [],
            towerProgress,
            gold: userProfile.gold ?? get().gold,
            essence: userProfile.essence ?? get().essence ?? 0,
            gems: userProfile.gems ?? get().gems,
            enhanceStones: userProfile.enhanceStones ?? get().enhanceStones,
            piggyBankGems: monetizationStatus?.piggyBankGems ?? userProfile.piggyBankGems ?? get().piggyBankGems,
            isGoldenPassActive: monetizationStatus?.isGoldenPassActive ?? userProfile.isGoldenPassActive ?? get().isGoldenPassActive,
            heroes: heroesMap,
            ownedHeroesById,
            heroHp,
            coreV2Party: sanitizedCoreParty,
            inventory: finalInventory,
            stashItems: currentStash,
            chestVault: chestVaultDto || get().chestVault || {
              normalChests: 0,
              totalChests: 0,
            },
            maxInventorySlots: Math.max(18, (userProfile as any).inventorySlots || get().maxInventorySlots || 42),
          });

          console.log('✅ Synchronized state & dynamic templates from Backend Database successfully!');
        } catch (err) {
          console.warn('Backend sync fallback to local offline cache:', err);
          set({ sessionStatus: get().userId ? 'ready' : 'auth_required' });
        }
      },

      refreshOnboarding: async () => {
        const userId = get().userId;
        if (!userId) return;
        try {
          const state = await onboardingApi.getState();
          set({ onboardingState: state });
        } catch {}
      },

      refreshExpeditions: async () => {
        const userId = get().userId;
        if (!userId) return;
        try {
          const runs = await expeditionApi.getActiveRuns(userId);
          set({ activeExpeditions: runs });
        } catch {}
      },

      refreshTowerProgress: async () => {
        const userId = get().userId;
        if (!userId) return;
        try {
          const progress = await towerApi.getMyProgress();
          set({ towerProgress: progress });
        } catch {}
      },

      resetUserSession: () => {
        // Clear all cached storage
        try {
          localStorage.removeItem('worldhero_game_save_v1');
          sessionStorage.clear();
        } catch {}

        set({
          userId: null,
          sessionStatus: 'auth_required',
          gold: 0,
          essence: 0,
          gems: 0,
          enhanceStones: 0,
          chestVault: {
            normalChests: 0,
            totalChests: 0,
          },
          inventory: [],
          stashItems: {},
          unlockedStashTabs: [1],
          maxInventorySlots: 50,
          ownedHeroesById: {},
          heroes: {} as Record<HeroClass, Hero>,
          heroHp: {} as Record<HeroClass, number>,
          coreV2Party: [],
          onboardingState: null,
          activeExpeditions: [],
          towerProgress: null,
          piggyBankGems: 0,
          isGoldenPassActive: false,
          goldenPassClaimedDays: [],
          activeModal: null,
          mockPaymentConfig: null,
        });
      },
    }),
    {
      name: 'worldhero_core_v2_save_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gold: state.gold,
        gems: state.gems,
        enhanceStones: state.enhanceStones,
        coreV2Party: state.coreV2Party,
        heroes: state.heroes,
        inventory: state.inventory,
        stashItems: state.stashItems,
        unlockedStashTabs: state.unlockedStashTabs,
        maxInventorySlots: state.maxInventorySlots,
        isGoldenPassActive: state.isGoldenPassActive,
        chestVault: state.chestVault,
      }),
    }
  )
);
