import { StateCreator } from 'zustand';
import { HeroClass } from '../../types/enums';
import { Hero } from '../../types/hero.types';
import { Stats } from '../../types/stats.types';
import { createDefaultStats, evaluateHeroLiveStats } from '../../engine/statEvaluator';
import { heroApi } from '../../services/heroApi';
import { idempotencyManager } from '@/services/idempotency';

export interface HeroSlice {
  heroes: Record<HeroClass, Hero>;
  ownedHeroesById: Record<string, Hero>;
  activeParty: HeroClass[];
  selectedHero: HeroClass;
  selectedHeroClass: HeroClass;
  heroHp: Record<HeroClass, number>;
  heroDeadUntil: Record<HeroClass, number | null>;

  setOwnedHeroesById: (heroesMap: Record<string, Hero>) => void;
  setSelectedHero: (heroClass: HeroClass) => void;
  selectHero: (heroClass: HeroClass) => void;
  setHeroHp: (heroClass: HeroClass, hp: number) => void;
  damageHero: (heroClass: HeroClass, dmg: number) => { isDead: boolean; remainingHp: number; applied: boolean };
  reviveHeroFree: (heroClass: HeroClass) => boolean;
  reviveExpiredHeroes: (now: number) => boolean;
  reviveHeroInstant: (heroClass: HeroClass) => boolean;
  reviveAndHealAllHeroes: () => void;
  coreV2Party: string[];
  setCoreV2Party: (party: string[]) => void;
  addHeroToCoreParty: (heroId: string) => boolean;
  removeHeroFromCoreParty: (heroId: string) => boolean;
  toggleDeployCoreHero: (heroId: string) => void;
  addToParty: (heroClass: HeroClass) => boolean;
  removeFromParty: (heroClass: HeroClass) => boolean;
  toggleDeployHero: (heroClass: HeroClass) => void;
  setParty: (party: HeroClass[]) => void;
  setPartyFormation: (party: HeroClass[]) => void;
  getHeroTotalStats: (heroClass: HeroClass) => Stats;
  handlePartyWipe: () => void;
  autoEquipHero: (heroClass: HeroClass) => void;
  levelUpHero: (heroId: string, targetLevel: number) => Promise<{ success: boolean; hero?: Hero }>;
  starUpHero: (heroId: string) => Promise<{ success: boolean; hero?: Hero }>;
}

export const INITIAL_STARTER_HEROES: Record<HeroClass, Hero> = {
  WARRIOR: {
    id: 'hero_warrior',
    name: 'Warrior',
    heroClass: 'WARRIOR',
    templateId: 'hero.warrior',
    role: 'BRUISER',
    level: 1,
    stars: 1,
    shards: 0,
    exp: 0,
    currentHp: 220,
    skillPoints: 0,
    equipment: {},
    skills: {},
  },
  RANGER: {
    id: 'hero_ranger',
    name: 'Archer',
    heroClass: 'RANGER',
    templateId: 'hero.ranger',
    role: 'MARKSMAN',
    level: 1,
    stars: 1,
    shards: 0,
    exp: 0,
    currentHp: 150,
    skillPoints: 0,
    equipment: {},
    skills: {},
  },
  MAGE: {
    id: 'hero_mage',
    name: 'Wizard',
    heroClass: 'MAGE',
    templateId: 'hero.wizard',
    role: 'MAGE',
    level: 1,
    stars: 1,
    shards: 0,
    exp: 0,
    currentHp: 130,
    skillPoints: 0,
    equipment: {},
    skills: {},
  },
  PRIEST: {
    id: 'hero_priest',
    name: 'Priest',
    heroClass: 'PRIEST',
    templateId: 'hero.priest',
    role: 'SUPPORT',
    level: 1,
    stars: 1,
    shards: 0,
    exp: 0,
    currentHp: 160,
    skillPoints: 0,
    equipment: {},
    skills: {},
  },
};

/**
 * Centralised invariant enforcer for the Core v2 party UUID list.
 * - Filters out any ID that is not present in ownedHeroesById (ownership check)
 * - Removes duplicates (preserves first occurrence)
 * - Caps the result at 3 entries (max party size)
 */
export function sanitizeCoreV2Party(
  ids: string[],
  ownedHeroesById: Record<string, unknown>,
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const id of ids) {
    if (!id || !ownedHeroesById[id] || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
    if (result.length === 3) break;
  }
  return result;
}

export const createHeroSlice: StateCreator<any, [], [], HeroSlice> = (set, get) => ({
  heroes: {} as Record<HeroClass, Hero>,

  ownedHeroesById: {},

  setOwnedHeroesById: (heroesMap) => set({ ownedHeroesById: heroesMap }),

  activeParty: [],
  coreV2Party: [],
  selectedHero: 'WARRIOR',
  selectedHeroClass: 'WARRIOR',

  heroHp: {} as Record<HeroClass, number>,

  heroDeadUntil: {
    WARRIOR: null,
    RANGER: null,
    MAGE: null,
    PRIEST: null,
  },

  setSelectedHero: (heroClass) => set({ selectedHero: heroClass, selectedHeroClass: heroClass }),
  selectHero: (heroClass) => set({ selectedHero: heroClass, selectedHeroClass: heroClass }),

  setHeroHp: (heroClass, hp) => {
    set((state: any) => ({
      heroHp: {
        ...state.heroHp,
        [heroClass]: hp,
      },
    }));
  },

  damageHero: (heroClass, dmg) => {
    const state = get();
    const deadUntil = state.heroDeadUntil[heroClass];
    const now = Date.now();
    // Guard: already downed heroes (marker set OR hp <= 0) cannot receive damage or have timer reset
    if (deadUntil !== null && deadUntil !== undefined) {
      return { isDead: true, remainingHp: 0, applied: false };
    }

    const stats = state.getHeroTotalStats(heroClass);
    const currentHp = state.heroHp[heroClass] ?? stats.maxHp;
    if (currentHp <= 0) {
      return { isDead: true, remainingHp: 0, applied: false };
    }

    const newHp = Math.max(0, currentHp - dmg);

    if (newHp === 0) {
      const newDeadUntil = now + 120_000;
      set((s: any) => ({
        heroHp: { ...s.heroHp, [heroClass]: 0 },
        heroDeadUntil: { ...s.heroDeadUntil, [heroClass]: newDeadUntil },
      }));
      state.addFloatingText?.(`${heroClass} Defeated!`, 180, 50, '#EF4444', true);
      return { isDead: true, remainingHp: 0, applied: true };
    }

    set((s: any) => ({
      heroHp: { ...s.heroHp, [heroClass]: newHp },
    }));
    return { isDead: false, remainingHp: newHp, applied: true };
  },

  reviveHeroFree: (heroClass) => {
    const state = get();
    const deadTime = state.heroDeadUntil[heroClass];
    if (!deadTime || Date.now() < deadTime) return false;

    const stats = state.getHeroTotalStats(heroClass);
    set((s: any) => ({
      heroHp: { ...s.heroHp, [heroClass]: stats.maxHp },
      heroDeadUntil: { ...s.heroDeadUntil, [heroClass]: null },
    }));
    state.addFloatingText?.(`${heroClass} Revived!`, 180, 60, '#34D399');
    return true;
  },

  reviveExpiredHeroes: (now: number) => {
    const state = get();
    const allHeroClasses: HeroClass[] = ['WARRIOR', 'RANGER', 'MAGE', 'PRIEST'];
    const expiredHeroes = allHeroClasses.filter((heroClass) => {
      const deadUntil = state.heroDeadUntil[heroClass];
      return deadUntil !== null && deadUntil !== undefined && deadUntil <= now;
    });

    if (expiredHeroes.length === 0) return false;

    const newHpMap = { ...state.heroHp };
    const newDeadMap = { ...state.heroDeadUntil };

    expiredHeroes.forEach((heroClass) => {
      const stats = state.getHeroTotalStats(heroClass);
      newHpMap[heroClass] = stats.maxHp;
      newDeadMap[heroClass] = null;
      state.addFloatingText?.(`${heroClass} Revived!`, 180, 60, '#34D399');
    });

    set({
      heroHp: newHpMap,
      heroDeadUntil: newDeadMap,
    });

    return true;
  },

  reviveHeroInstant: (heroClass) => {
    const { gems, userId, getHeroTotalStats, addFloatingText } = get();
    const cost = 10;
    if (gems < cost) {
      addFloatingText?.('Need 10 Gems for Instant Revive!', 180, 60, '#EF4444', true);
      return false;
    }

    const stats = getHeroTotalStats(heroClass);
    // 1. Optimistic Client State Update
    set((s: any) => ({
      gems: Math.max(0, s.gems - cost),
      heroHp: { ...s.heroHp, [heroClass]: stats.maxHp },
      heroDeadUntil: { ...s.heroDeadUntil, [heroClass]: null },
    }));
    addFloatingText?.(`${heroClass} Revived Instantly! (-10 Gems)`, 180, 60, '#38BDF8');

    // 2. Authoritative Backend Persistence & Sync
    if (userId) {
      heroApi.reviveHero(heroClass, userId).then((res) => {
        if (res && res.remainingGems !== undefined) {
          set({ gems: res.remainingGems });
        }
      }).catch((err) => {
        console.warn('Revive backend sync warning:', err);
      });
    }
    return true;
  },

  reviveAndHealAllHeroes: () => {
    const state = get();
    const { getHeroTotalStats } = state;
    const newHpMap: Record<HeroClass, number> = {} as any;
    const newDeadMap: Record<HeroClass, number | null> = {
      WARRIOR: null,
      RANGER: null,
      MAGE: null,
      PRIEST: null,
    };

    (['WARRIOR', 'RANGER', 'MAGE', 'PRIEST'] as HeroClass[]).forEach((heroClass) => {
      const stats = getHeroTotalStats(heroClass);
      newHpMap[heroClass] = stats.maxHp || 100;
    });

    set({
      heroHp: newHpMap,
      heroDeadUntil: newDeadMap,
    });
  },

  setCoreV2Party: (party) => {
    const { ownedHeroesById } = get();
    const sanitized = sanitizeCoreV2Party(party, ownedHeroesById || {});
    set({ coreV2Party: sanitized });
  },

  addHeroToCoreParty: (heroId) => {
    const { coreV2Party, ownedHeroesById, addFloatingText } = get();
    if (!ownedHeroesById || !ownedHeroesById[heroId]) return false;
    if (coreV2Party.includes(heroId)) return false;
    if (coreV2Party.length >= 3) {
      addFloatingText?.('Maximum 3 Heroes in Active Squad!', 180, 60, '#F87171', true);
      return false;
    }
    set({ coreV2Party: [...coreV2Party, heroId] });
    return true;
  },

  removeHeroFromCoreParty: (heroId) => {
    const { coreV2Party } = get();
    if (!coreV2Party.includes(heroId)) return false;
    set({ coreV2Party: coreV2Party.filter((id: string) => id !== heroId) });
    return true;
  },

  toggleDeployCoreHero: (heroId) => {
    const { coreV2Party, addHeroToCoreParty, removeHeroFromCoreParty } = get();
    if (coreV2Party.includes(heroId)) {
      removeHeroFromCoreParty(heroId);
    } else {
      addHeroToCoreParty(heroId);
    }
  },

  addToParty: (heroClass) => {
    const { activeParty, addFloatingText } = get();
    if (activeParty.includes(heroClass)) return false;
    if (activeParty.length >= 3) {
      addFloatingText?.('Maximum 3 Heroes in Active Squad!', 180, 60, '#F87171', true);
      return false;
    }
    set({ activeParty: [...activeParty, heroClass] });
    return true;
  },

  removeFromParty: (heroClass) => {
    const { activeParty, addFloatingText } = get();
    if (!activeParty.includes(heroClass)) return false;
    if (activeParty.length <= 1) {
      addFloatingText?.('Must keep at least 1 Hero in Squad!', 180, 60, '#F87171', true);
      return false;
    }
    set({ activeParty: activeParty.filter((c: HeroClass) => c !== heroClass) });
    return true;
  },

  toggleDeployHero: (heroClass) => {
    const { activeParty, addToParty, removeFromParty } = get();
    if (activeParty.includes(heroClass)) {
      removeFromParty(heroClass);
    } else {
      addToParty(heroClass);
    }
  },

  setParty: (party) => set({ activeParty: party }),
  setPartyFormation: (party) => set({ activeParty: party }),

  getHeroTotalStats: (heroClass) => {
    const state = get();
    const hero = state.heroes[heroClass];
    if (!hero) {
      const fallback = createDefaultStats();
      fallback.critRate = 5.0;
      fallback.critDmg = 50.0;
      return fallback;
    }

    const base = createDefaultStats();
    base.critRate = 5.0;
    base.critDmg = 50.0;

    if (heroClass === 'WARRIOR') {
      base.maxHp = 220 + hero.level * 18;
      base.armor = 35 + hero.level * 4;
      base.physAtk = 22 + hero.level * 3;
      base.magicAtk = 0;
      base.atkSpeed = 1.0;
    } else if (heroClass === 'RANGER') {
      base.maxHp = 150 + hero.level * 10;
      base.armor = 16 + hero.level * 2;
      base.physAtk = 28 + hero.level * 4;
      base.magicAtk = 0;
      base.atkSpeed = 1.2;
    } else if (heroClass === 'MAGE') {
      base.maxHp = 130 + hero.level * 8;
      base.armor = 12 + hero.level * 1.5;
      base.physAtk = 0;
      base.magicAtk = 32 + hero.level * 5;
      base.atkSpeed = 0.9;
    } else if (heroClass === 'PRIEST') {
      base.maxHp = 160 + hero.level * 12;
      base.armor = 20 + hero.level * 2.5;
      base.physAtk = 10;
      base.magicAtk = 20 + hero.level * 3;
      base.atkSpeed = 0.95;
      base.hpRegen = 8;
    }

    return evaluateHeroLiveStats(hero, state.templates, base);
  },

  handlePartyWipe: () => {
    const state = get();
    state.reviveAndHealAllHeroes();
    set({
      currentMonster: null,
    });
    state.addFloatingText?.('Party defeated. Heroes restored.', 180, 50, '#EF4444', true);
  },

  autoEquipHero: (heroClass) => {
    const { heroes, inventory, templates, equipItem, addFloatingText } = get();
    const hero = heroes[heroClass];
    if (!hero) return;

    let equippedCount = 0;
    inventory.forEach((item: any) => {
      const tpl = templates[item.templateId];
      if (tpl && (!tpl.requiredClass || tpl.requiredClass === heroClass)) {
        if (!hero.equipment[tpl.slot]) {
          equipItem(heroClass, item);
          equippedCount++;
        }
      }
    });

    addFloatingText?.(
      equippedCount > 0
        ? `Auto-equipped ${equippedCount} items on ${heroClass}!`
        : `All slots filled or no gear available for ${heroClass}!`,
      180, 60, '#34D399'
    );
  },

  levelUpHero: async (heroId: string, targetLevel: number) => {
    const payloadKey = `${heroId}:${targetLevel}`;
    let operationKey: string;

    try {
      operationKey = idempotencyManager.getOrCreateKey('LEVEL_UP', payloadKey);
    } catch (keyErr: any) {
      get().addFloatingText?.(keyErr?.message || 'Cannot initiate level up — not authenticated', 180, 60, '#EF4444', true);
      return { success: false };
    }

    try {
      const { progressionApi } = await import('@/services/progressionApi');
      const updatedHero = await progressionApi.levelUpHero(heroId, targetLevel, operationKey);


      idempotencyManager.clearKey('LEVEL_UP', payloadKey);

      const state = get();
      const heroClass = updatedHero.heroClass;

      // Unconditionally update ownedHeroesById for all 24 heroes
      const updatedOwnedHeroes = {
        ...state.ownedHeroesById,
        [heroId]: { ...(state.ownedHeroesById?.[heroId] || {}), ...updatedHero },
      };

      // Only update legacy 4-hero adapter if heroClass exists
      let updatedHeroes = state.heroes;
      if (heroClass && state.heroes[heroClass]) {
        updatedHeroes = {
          ...state.heroes,
          [heroClass]: { ...state.heroes[heroClass], ...updatedHero },
        };
      }

      set({
        ownedHeroesById: updatedOwnedHeroes,
        heroes: updatedHeroes,
      });

      // Authoritatively sync user resources from server
      try {
        const { userApi } = await import('@/services/userApi');
        const profile = await userApi.getProfile();
        if (profile) {
          set({
            gold: profile.gold ?? state.gold,
            essence: profile.essence ?? state.essence,
            enhanceStones: profile.enhanceStones ?? state.enhanceStones,
          });
        }
      } catch {
        // Fallback gracefully if profile endpoint is unreachable
      }

      state.addFloatingText?.(`Level Up to Lv. ${targetLevel}!`, 180, 60, '#34D399', true);
      return { success: true, hero: updatedHero };
    } catch (err: any) {
      idempotencyManager.handleMutationError('LEVEL_UP', payloadKey, err);
      if (err?.response?.status === 409) {
        get().addFloatingText?.('State conflict detected — re-syncing from server…', 180, 60, '#F59E0B', true);
        try {
          const { userApi } = await import('@/services/userApi');
          const [profile, heroesList] = await Promise.all([userApi.getProfile(), heroApi.getHeroes()]);
          if (profile) set({ gold: profile.gold, essence: profile.essence, enhanceStones: profile.enhanceStones });
          if (heroesList) {
            const ownedMap: Record<string, any> = {};
            const campaignMap = { ...get().heroes };
            heroesList.forEach((h: any) => {
              ownedMap[h.id] = h;
              if (h.heroClass && campaignMap[h.heroClass]) {
                campaignMap[h.heroClass] = { ...campaignMap[h.heroClass], ...h };
              }
            });
            set({ ownedHeroesById: ownedMap, heroes: campaignMap });
          }
          get().addFloatingText?.('State re-synced from server', 180, 60, '#34D399', true);
        } catch (syncErr: any) {
          const syncMsg = syncErr?.message || 'State sync failed — please refresh the page';
          get().addFloatingText?.(syncMsg, 180, 60, '#EF4444', true);
        }
      } else {
        const msg = err.response?.data?.message || err.message || 'Level up failed on server';
        get().addFloatingText?.(msg, 180, 60, '#EF4444', true);
      }
      return { success: false };
    }
  },

  starUpHero: async (heroId: string) => {
    const payloadKey = `${heroId}`;
    let operationKey: string;

    try {
      operationKey = idempotencyManager.getOrCreateKey('STAR_UP', payloadKey);
    } catch (keyErr: any) {
      get().addFloatingText?.(keyErr?.message || 'Cannot initiate star up — not authenticated', 180, 60, '#EF4444', true);
      return { success: false };
    }

    try {
      const { progressionApi } = await import('@/services/progressionApi');
      const updatedHero = await progressionApi.starUpHero(heroId, operationKey);

      idempotencyManager.clearKey('STAR_UP', payloadKey);


      const state = get();
      const heroClass = updatedHero.heroClass;

      // Unconditionally update ownedHeroesById for all 24 heroes
      const updatedOwnedHeroes = {
        ...state.ownedHeroesById,
        [heroId]: { ...(state.ownedHeroesById?.[heroId] || {}), ...updatedHero },
      };

      // Only update legacy 4-hero adapter if heroClass exists
      let updatedHeroes = state.heroes;
      if (heroClass && state.heroes[heroClass]) {
        updatedHeroes = {
          ...state.heroes,
          [heroClass]: { ...state.heroes[heroClass], ...updatedHero },
        };
      }

      set({
        ownedHeroesById: updatedOwnedHeroes,
        heroes: updatedHeroes,
      });

      // Authoritatively sync user resources from server
      try {
        const { userApi } = await import('@/services/userApi');
        const profile = await userApi.getProfile();
        if (profile) {
          set({
            gold: profile.gold ?? state.gold,
            essence: profile.essence ?? state.essence,
            enhanceStones: profile.enhanceStones ?? state.enhanceStones,
          });
        }
      } catch {
        // Fallback gracefully if profile endpoint is unreachable
      }

      state.addFloatingText?.(`Star Up to ⭐${updatedHero.stars}!`, 180, 60, '#F59E0B', true);
      return { success: true, hero: updatedHero };
    } catch (err: any) {
      idempotencyManager.handleMutationError('STAR_UP', payloadKey, err);
      if (err?.response?.status === 409) {
        get().addFloatingText?.('State conflict detected — re-syncing from server…', 180, 60, '#F59E0B', true);
        try {
          const { userApi } = await import('@/services/userApi');
          const [profile, heroesList] = await Promise.all([userApi.getProfile(), heroApi.getHeroes()]);
          if (profile) set({ gold: profile.gold, essence: profile.essence, enhanceStones: profile.enhanceStones });
          if (heroesList) {
            const ownedMap: Record<string, any> = {};
            const campaignMap = { ...get().heroes };
            heroesList.forEach((h: any) => {
              ownedMap[h.id] = h;
              if (h.heroClass && campaignMap[h.heroClass]) {
                campaignMap[h.heroClass] = { ...campaignMap[h.heroClass], ...h };
              }
            });
            set({ ownedHeroesById: ownedMap, heroes: campaignMap });
          }
          get().addFloatingText?.('State re-synced from server', 180, 60, '#34D399', true);
        } catch (syncErr: any) {
          const syncMsg = syncErr?.message || 'State sync failed — please refresh the page';
          get().addFloatingText?.(syncMsg, 180, 60, '#EF4444', true);
        }
      } else {
        const msg = err.response?.data?.message || err.message || 'Star up failed on server';
        get().addFloatingText?.(msg, 180, 60, '#EF4444', true);
      }
      return { success: false };
    }
  },
});
