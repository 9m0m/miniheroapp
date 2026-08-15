import { create } from 'zustand';
import {
  Hero,
  HeroClass,
  ItemInstance,
  ItemTemplate,
  Monster,
  FloatingText,
  ItemSlot,
  Stats,
  MonetizationStatus,
  UserProfile,
  ActiveModal,
  MockPaymentConfig,
  BattleLogEntry,
} from '../types/game.types';
import { computeItemStats, createDefaultStats, addStats, clampStats } from '../engine/statEvaluator';
import { gameApi } from '../services/api';

export const STARTER_TEMPLATES: Record<string, ItemTemplate> = {
  'wpn_iron_sword': {
    id: 'wpn_iron_sword',
    name: 'Recruit Iron Sword',
    description: 'A balanced starter blade for Warriors.',
    icon: '⚔️',
    slot: 'MAIN_HAND',
    requiredClass: 'WARRIOR',
    baseRarity: 'COMMON',
    elementalType: 'PHYSICAL',
    baseStats: { physAtk: 25, atkPercent: 2 },
    iLvlScalingFactor: 0.08,
  },
  'wpn_royal_claymore': {
    id: 'wpn_royal_claymore',
    name: 'Royal Claymore',
    description: 'Forged from titanium steel tempered in lava.',
    icon: '🗡️',
    slot: 'MAIN_HAND',
    requiredClass: 'WARRIOR',
    baseRarity: 'RARE',
    elementalType: 'PHYSICAL',
    baseStats: { physAtk: 65, critRate: 5, elemDmgBonus: 10 },
    iLvlScalingFactor: 0.08,
  },
  'wpn_excalibur': {
    id: 'wpn_excalibur',
    name: 'Holy Blade Excalibur',
    description: 'A legendary divine sword that cleaves through darkness.',
    icon: '✨',
    slot: 'MAIN_HAND',
    requiredClass: 'WARRIOR',
    baseRarity: 'LEGENDARY',
    elementalType: 'PHYSICAL',
    baseStats: { physAtk: 180, critRate: 15, critDmg: 35, lifeSteal: 10 },
    iLvlScalingFactor: 0.08,
  },
  'shd_iron_shield': {
    id: 'shd_iron_shield',
    name: 'Steel Guardian Shield',
    description: 'Solid defense against physical attacks.',
    icon: '🛡️',
    slot: 'OFF_HAND',
    requiredClass: 'WARRIOR',
    baseRarity: 'UNCOMMON',
    elementalType: 'PHYSICAL',
    baseStats: { armor: 40, maxHp: 80, dmgReduction: 3 },
    iLvlScalingFactor: 0.08,
  },
  'shd_aegis_bulwark': {
    id: 'shd_aegis_bulwark',
    name: 'Aegis Divine Bulwark',
    description: 'A legendary shield capable of repelling deity attacks.',
    icon: '🔰',
    slot: 'OFF_HAND',
    requiredClass: 'WARRIOR',
    baseRarity: 'EPIC',
    elementalType: 'PHYSICAL',
    baseStats: { armor: 120, maxHp: 250, dmgReduction: 8 },
    iLvlScalingFactor: 0.08,
  },
  'wpn_hunting_bow': {
    id: 'wpn_hunting_bow',
    name: 'Windrunner Bow',
    description: 'Rapid and precise lightweight composite bow.',
    icon: '🏹',
    slot: 'MAIN_HAND',
    requiredClass: 'RANGER',
    baseRarity: 'COMMON',
    elementalType: 'PHYSICAL',
    baseStats: { physAtk: 30, atkSpeed: 0.2, critRate: 8 },
    iLvlScalingFactor: 0.08,
  },
  'wpn_windrunner_bow': {
    id: 'wpn_windrunner_bow',
    name: 'Gale Tempest Bow',
    description: 'Fires supersonic gale arrows tearing through space.',
    icon: '🎯',
    slot: 'MAIN_HAND',
    requiredClass: 'RANGER',
    baseRarity: 'EPIC',
    elementalType: 'COLD',
    baseStats: { physAtk: 90, atkSpeed: 0.35, critRate: 15, critDmg: 30 },
    iLvlScalingFactor: 0.08,
  },
  'wpn_fire_staff': {
    id: 'wpn_fire_staff',
    name: 'Pyromancer Staff',
    description: 'Channels primordial flames to incinerate foes.',
    icon: '🔥',
    slot: 'MAIN_HAND',
    requiredClass: 'MAGE',
    baseRarity: 'RARE',
    elementalType: 'FIRE',
    baseStats: { magicAtk: 45, atkPercent: 8, elemDmgBonus: 15 },
    iLvlScalingFactor: 0.08,
  },
  'wpn_holy_bell': {
    id: 'wpn_holy_bell',
    name: 'Sanctified Chime',
    description: 'Restores party vitality and wards off evil.',
    icon: '🔔',
    slot: 'OFF_HAND',
    requiredClass: 'PRIEST',
    baseRarity: 'UNCOMMON',
    elementalType: 'CHAOS',
    baseStats: { hpRegen: 15, maxHp: 60, cdr: 5 },
    iLvlScalingFactor: 0.08,
  },
  'acc_ruby_ring': {
    id: 'acc_ruby_ring',
    name: 'Molten Ruby Ring',
    description: 'Empowers all physical and magic damage.',
    icon: '💍',
    slot: 'RING_1',
    requiredClass: null,
    baseRarity: 'UNCOMMON',
    elementalType: 'FIRE',
    baseStats: { physAtk: 15, magicAtk: 15, critRate: 5 },
    iLvlScalingFactor: 0.08,
  },
  'acc_emerald_ring': {
    id: 'acc_emerald_ring',
    name: 'Emerald Falcon Ring',
    description: 'Significantly boosts Critical Strike Rate and Damage.',
    icon: '💍',
    slot: 'RING_2',
    requiredClass: null,
    baseRarity: 'RARE',
    elementalType: 'PHYSICAL',
    baseStats: { critRate: 8, critDmg: 20 },
    iLvlScalingFactor: 0.08,
  },
  'acc_heart_amulet': {
    id: 'acc_heart_amulet',
    name: 'Dragonheart Amulet',
    description: 'Bestows immense vitality, health regeneration, and lifesteal.',
    icon: '📿',
    slot: 'NECKLACE',
    requiredClass: null,
    baseRarity: 'RARE',
    elementalType: 'PHYSICAL',
    baseStats: { maxHp: 120, hpRegen: 10, lifeSteal: 3 },
    iLvlScalingFactor: 0.08,
  },
  'acc_dragon_talisman': {
    id: 'acc_dragon_talisman',
    name: 'Aegis Dragon Talisman',
    description: 'Supreme relic reducing damage taken and accelerating cooldowns.',
    icon: '🧿',
    slot: 'TALISMAN',
    requiredClass: null,
    baseRarity: 'EPIC',
    elementalType: 'PHYSICAL',
    baseStats: { physAtk: 25, magicAtk: 25, dmgReduction: 5, cdr: 5 },
    iLvlScalingFactor: 0.08,
  },
};

interface GameState {
  // User & Progression
  userId: string | null;
  gold: number;
  gems: number;
  enhanceStones: number;
  worldIndex: number;
  stageIndex: number;
  currentWave: number;
  maxClearedStage: number;
  isAutoRepeat: boolean;

  // Earning & Monetization
  piggyBankGems: number;
  isGoldenPassActive: boolean;
  loginDayIndex: number;
  growthFundUnlocked: boolean;
  claimedGrowthFundStages: number[];

  // Modal UI State
  activeModal: ActiveModal;
  mockPaymentConfig: MockPaymentConfig | null;
  enhancingItem: ItemInstance | null;

  // Heroes & Party Formation
  heroes: Record<HeroClass, Hero>;
  selectedHeroClass: HeroClass;
  activeParty: HeroClass[];
  toggleDeployHero: (heroClass: HeroClass) => void;
  setPartyFormation: (party: HeroClass[]) => void;

  // Inventory
  inventory: ItemInstance[];
  templates: Record<string, ItemTemplate>;

  // Combat State
  currentMonster: Monster | null;
  floatingTexts: FloatingText[];

  // Actions
  fetchInitialData: () => Promise<void>;
  selectHero: (heroClass: HeroClass) => void;
  equipItem: (heroClass: HeroClass, item: ItemInstance) => Promise<void>;
  unequipItem: (heroClass: HeroClass, slot: ItemSlot) => Promise<void>;
  addGold: (amount: number) => void;
  addGems: (amount: number) => void;
  addItemToInventory: (item: ItemInstance) => void;
  removeItemFromInventory: (itemId: string) => void;
  setCurrentMonster: (monster: Monster | null) => void;
  addFloatingText: (text: string, x: number, y: number, color: string, isCrit?: boolean) => void;
  clearOldFloatingTexts: () => void;
  advanceWave: () => Promise<void>;
  repeatStage: () => void;
  getHeroTotalStats: (heroClass: HeroClass) => Stats;

  // Phase 3 Actions: Enhancement, The Cube, Crafting
  openEnhanceModal: (item: ItemInstance) => void;
  closeEnhanceModal: () => void;
  enhanceItem: (useInsurance: boolean) => Promise<boolean>;
  smartFusion: (itemIds: string[]) => Promise<ItemInstance | null>;
  gemFusion: (gemType: string, sourceTier: number) => Promise<string | null>;
  craftAccessory: (recipeId: string) => Promise<boolean>;
  brewBlessing: (recipeId: string) => Promise<boolean>;
  inlayGemToItem: (itemInstanceId: string, gemId: string) => Promise<void>;
  blessItemWithScroll: (itemInstanceId: string, blessingId: string) => Promise<void>;

  // Phase 4: Skill Tree, Worlds & Battle Combat Logs
  openSkillTreeModal: () => void;
  upgradeHeroSkill: (heroId: string, skillId: string) => Promise<boolean>;
  openWorldMapModal: () => void;
  openBattleLogModal: () => void;
  recordBattleVictory: (world: number, stage: number, timeSec: number, gold: number, stones: number, dropName?: string) => void;
  recordBattleDefeat: (world: number, stage: number, defeatedWave: number, timeSec: number) => void;
  battleLogs: BattleLogEntry[];

  // Monetization Actions
  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;
  triggerWldPayment: (config: MockPaymentConfig) => void;
  smashPiggyBank: () => Promise<void>;
  claimDailyPass: () => Promise<void>;
  claimGrowthFund: (stageMilestone: number) => Promise<void>;
  executeMockWldPay: (featureKey: string, amountWld: number) => Promise<void>;

  // System & Telemetry
  combatSpeed: number;
  setCombatSpeed: (speed: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  userId: null,
  gold: 5000,
  gems: 50,
  enhanceStones: 20,
  worldIndex: 1,
  stageIndex: 1,
  currentWave: 1,
  maxClearedStage: 0,
  isAutoRepeat: false,

  piggyBankGems: 150,
  isGoldenPassActive: false,
  loginDayIndex: 0,
  growthFundUnlocked: false,
  claimedGrowthFundStages: [],

  activeModal: null,
  mockPaymentConfig: null,
  enhancingItem: null,

  battleLogs: [
    {
      id: 'log-1',
      world: 1,
      stage: 1,
      result: 'VICTORY',
      clearTimeSeconds: 65,
      goldEarned: 1500,
      stonesEarned: 3,
      droppedItemName: 'Recruit Iron Sword (+0)',
      tacticalTip: 'Stage 1-1 completed with flying colors! Battle squad is ready for Stage 1-2.',
      timestamp: Date.now() - 1000 * 120,
    },
  ],

  selectedHeroClass: 'WARRIOR',
  activeParty: ['WARRIOR', 'RANGER', 'MAGE'],
  templates: STARTER_TEMPLATES,

  heroes: {
    WARRIOR: {
      id: 'h_warrior',
      name: 'Warrior',
      heroClass: 'WARRIOR',
      level: 1,
      exp: 0,
      currentHp: 200,
      skillPoints: 0,
      equipment: {
        MAIN_HAND: {
          id: 'inst_w_01',
          templateId: 'wpn_iron_sword',
          itemLevel: 1,
          rarity: 'COMMON',
          enhanceLevel: 1,
          sockets: [],
        },
        OFF_HAND: {
          id: 'inst_w_02',
          templateId: 'shd_iron_shield',
          itemLevel: 1,
          rarity: 'UNCOMMON',
          enhanceLevel: 0,
          sockets: [],
        },
      },
    },
    RANGER: {
      id: 'h_ranger',
      name: 'Archer',
      heroClass: 'RANGER',
      level: 1,
      exp: 0,
      currentHp: 140,
      skillPoints: 0,
      equipment: {
        MAIN_HAND: {
          id: 'inst_r_01',
          templateId: 'wpn_hunting_bow',
          itemLevel: 1,
          rarity: 'COMMON',
          enhanceLevel: 2,
          sockets: [],
        },
      },
    },
    MAGE: {
      id: 'h_mage',
      name: 'Wizard',
      heroClass: 'MAGE',
      level: 1,
      exp: 0,
      currentHp: 120,
      skillPoints: 0,
      equipment: {
        MAIN_HAND: {
          id: 'inst_m_01',
          templateId: 'wpn_fire_staff',
          itemLevel: 1,
          rarity: 'RARE',
          enhanceLevel: 0,
          sockets: [],
        },
      },
    },
    PRIEST: {
      id: 'h_priest',
      name: 'Priest',
      heroClass: 'PRIEST',
      level: 1,
      exp: 0,
      currentHp: 160,
      skillPoints: 0,
      equipment: {
        OFF_HAND: {
          id: 'inst_p_01',
          templateId: 'wpn_holy_bell',
          itemLevel: 1,
          rarity: 'UNCOMMON',
          enhanceLevel: 0,
          sockets: [],
        },
      },
    },
  },

  inventory: [
    {
      id: 'bag_item_01',
      templateId: 'acc_ruby_ring',
      itemLevel: 1,
      rarity: 'UNCOMMON',
      enhanceLevel: 0,
      sockets: [],
    },
    {
      id: 'bag_item_02',
      templateId: 'wpn_royal_claymore',
      itemLevel: 1,
      rarity: 'RARE',
      enhanceLevel: 3,
      sockets: ['RUBY_T1'],
    },
  ],

  currentMonster: {
    id: 'mob_01',
    name: 'Forest Goblin Scout',
    maxHp: 350,
    currentHp: 350,
    atk: 18,
    armor: 30,
    elementalType: 'PHYSICAL',
    x: 280,
    y: 90,
  },

  floatingTexts: [],

  selectHero: (heroClass) => set({ selectedHeroClass: heroClass }),

  toggleDeployHero: (heroClass) => {
    const { activeParty, addFloatingText } = get();
    if (activeParty.includes(heroClass)) {
      if (activeParty.length <= 1) {
        addFloatingText('⚠️ At least 1 Hero must be deployed!', 180, 70, '#F87171', true);
        return;
      }
      const newParty = activeParty.filter((h) => h !== heroClass);
      set({ activeParty: newParty });
      addFloatingText(`🛡️ ${heroClass} moved to Reserve`, 180, 70, '#94A3B8');
    } else {
      if (activeParty.length >= 3) {
        addFloatingText('⚠️ Party full (Max 3 Heroes)! Remove one first.', 180, 70, '#F87171', true);
        return;
      }
      const newParty = [...activeParty, heroClass];
      set({ activeParty: newParty });
      addFloatingText(`⚔️ ${heroClass} deployed to Party!`, 180, 70, '#34D399', true);
    }
  },

  setPartyFormation: (party) => {
    if (party.length > 0) {
      set({ activeParty: party });
    }
  },

  equipItem: async (heroClass, item) => {
    const { userId, templates, heroes, inventory } = get();
    const template = templates[item.templateId];
    if (!template) return;

    const hero = heroes[heroClass];
    const oldEquip = hero.equipment[template.slot];
    const newInventory = inventory.filter((i) => i.id !== item.id);
    if (oldEquip) newInventory.push(oldEquip);

    set({
      heroes: {
        ...heroes,
        [heroClass]: {
          ...hero,
          equipment: {
            ...hero.equipment,
            [template.slot]: item,
          },
        },
      },
      inventory: newInventory,
    });

    if (userId) {
      try {
        await gameApi.equipItem(userId, hero.id, item.id, template.slot);
      } catch (err) {
        console.error('Failed to equip item on BE:', err);
      }
    }
  },

  unequipItem: async (heroClass, slot) => {
    const { userId, heroes, inventory } = get();
    const hero = heroes[heroClass];
    const item = hero.equipment[slot];
    if (!item) return;

    const newEquipment = { ...hero.equipment };
    delete newEquipment[slot];

    set({
      heroes: {
        ...heroes,
        [heroClass]: {
          ...hero,
          equipment: newEquipment,
        },
      },
      inventory: [...inventory, item],
    });

    if (userId) {
      try {
        await gameApi.unequipItem(userId, item.id);
      } catch (err) {
        console.error('Failed to unequip item on BE:', err);
      }
    }
  },

  addGold: (amount) => set((s) => ({ gold: s.gold + amount })),
  addGems: (amount) => set((s) => ({ gems: s.gems + amount })),

  addItemToInventory: (item) => set((s) => ({ inventory: [...s.inventory, item] })),
  removeItemFromInventory: (itemId) => set((s) => ({ inventory: s.inventory.filter((i) => i.id !== itemId) })),

  setCurrentMonster: (monster) => set({ currentMonster: monster }),

  addFloatingText: (text, x, y, color, isCrit = false) => {
    const newText: FloatingText = {
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      isCrit,
      opacity: 1,
      createdAt: Date.now(),
    };
    set((s) => ({ floatingTexts: [...s.floatingTexts, newText] }));
  },

  clearOldFloatingTexts: () => {
    const now = Date.now();
    set((s) => ({
      floatingTexts: s.floatingTexts.filter((t) => now - t.createdAt < 1000),
    }));
  },

  advanceWave: async () => {
    const state = get();
    const isBoss = state.currentWave === 31;

    if (state.userId) {
      try {
        const res = await gameApi.clearWave(
          state.userId,
          state.worldIndex,
          state.stageIndex,
          state.currentWave,
          isBoss
        );

        const newInventory = [...state.inventory];
        if (res.droppedChest && res.droppedItem) {
          newInventory.push(res.droppedItem);
          state.addFloatingText('🎁 GEAR CHEST!', 180, 70, '#f59e0b', true);
        }

        set({
          gold: res.totalGold,
          gems: res.totalGems,
          enhanceStones: res.totalStones,
          piggyBankGems: res.totalPiggyBankGems,
          worldIndex: res.currentWorld,
          stageIndex: res.currentStage,
          currentWave: res.currentWave,
          inventory: newInventory,
        });
        return;
      } catch (err) {
        console.warn('BE wave clear failed, applying local fallback:', err);
      }
    }

    set((s) => {
      const addedPiggy = Math.min(1000, s.piggyBankGems + (isBoss ? 20 : 5));
      if (s.currentWave < 31) {
        return { currentWave: s.currentWave + 1, piggyBankGems: addedPiggy, gold: s.gold + 50 };
      } else {
        return {
          currentWave: 1,
          stageIndex: s.stageIndex < 10 ? s.stageIndex + 1 : 1,
          worldIndex: s.stageIndex === 10 ? (s.worldIndex < 4 ? s.worldIndex + 1 : 1) : s.worldIndex,
          gold: s.gold + 500,
          piggyBankGems: addedPiggy,
        };
      }
    });
  },

  repeatStage: () => set({ currentWave: 1, isAutoRepeat: true }),

  getHeroTotalStats: (heroClass) => {
    const state = get();
    const hero = state.heroes[heroClass];
    if (hero?.computedStats) {
      return hero.computedStats;
    }

    const total = createDefaultStats();
    if (heroClass === 'WARRIOR') {
      total.maxHp = 200 + hero.level * 20;
      total.armor = 50 + hero.level * 5;
      total.physAtk = 20 + hero.level * 3;
      total.dmgReduction = 5;
    } else if (heroClass === 'RANGER') {
      total.maxHp = 140 + hero.level * 12;
      total.physAtk = 30 + hero.level * 6;
      total.atkSpeed = 1.3;
      total.critRate = 12;
      total.physDodge = 8;
    } else if (heroClass === 'MAGE') {
      total.maxHp = 120 + hero.level * 10;
      total.magicAtk = 40 + hero.level * 8;
      total.atkPercent = 10;
      total.spellEvasion = 10;
    } else if (heroClass === 'PRIEST') {
      total.maxHp = 160 + hero.level * 15;
      total.hpRegen = 10 + hero.level * 2;
      total.magicAtk = 15 + hero.level * 3;
      total.cdr = 10;
    }

    for (const slot of Object.keys(hero.equipment) as ItemSlot[]) {
      const instance = hero.equipment[slot];
      if (instance) {
        const template = state.templates[instance.templateId];
        if (template) {
          const itemStats = computeItemStats(template, instance);
          addStats(total, itemStats);
        }
      }
    }

    clampStats(total);
    return total;
  },

  // Phase 3 Actions
  openEnhanceModal: (item) => set({ enhancingItem: item, activeModal: 'ENHANCE' }),
  closeEnhanceModal: () => set({ enhancingItem: null, activeModal: null }),

  enhanceItem: async (useInsurance: boolean) => {
    const { userId, enhancingItem, inventory, heroes } = get();
    if (!enhancingItem) return false;

    if (userId) {
      try {
        const res = await gameApi.enhanceItem(userId, enhancingItem.id, useInsurance);
        
        // Update bag item if in inventory
        const newInventory = inventory.map((i) => (i.id === res.updatedItem.id ? res.updatedItem : i));

        // Update hero if item was equipped
        const newHeroes = { ...heroes };
        if (res.updatedHero) {
          const heroClass = res.updatedHero.heroClass as HeroClass;
          newHeroes[heroClass] = {
            ...newHeroes[heroClass],
            ...res.updatedHero,
            equipment: newHeroes[heroClass].equipment,
          };
        }

        set({
          gold: res.remainingGold,
          enhanceStones: res.remainingStones,
          enhancingItem: res.updatedItem,
          inventory: newInventory,
          heroes: newHeroes,
        });

        return res.success;
      } catch (err) {
        console.error('Enhance failed on BE:', err);
      }
    }

    // Local Fallback
    const currentLvl = enhancingItem.enhanceLevel;
    const isSuccess = Math.random() < (currentLvl < 5 ? 1.0 : currentLvl < 10 ? 0.7 : 0.4);
    const newLvl = isSuccess ? currentLvl + 1 : currentLvl >= 10 && !useInsurance ? Math.max(10, currentLvl - 1) : currentLvl;
    const updated = { ...enhancingItem, enhanceLevel: newLvl };

    set((s) => ({
      gold: Math.max(0, s.gold - 500),
      enhanceStones: Math.max(0, s.enhanceStones - 2),
      enhancingItem: updated,
      inventory: s.inventory.map((i) => (i.id === updated.id ? updated : i)),
    }));

    return isSuccess;
  },

  smartFusion: async (itemIds: string[]) => {
    const { userId, inventory } = get();
    if (itemIds.length !== 3) return null;

    if (userId) {
      try {
        const fusedItem = await gameApi.smartFusion(userId, itemIds);
        const remainingBag = inventory.filter((i) => !itemIds.includes(i.id));
        set({
          inventory: [...remainingBag, fusedItem],
        });
        return fusedItem;
      } catch (err) {
        console.error('Smart Fusion failed on BE:', err);
      }
    }

    // Local Fallback
    const firstItem = inventory.find((i) => i.id === itemIds[0]);
    if (!firstItem) return null;
    const nextRarity = firstItem.rarity === 'COMMON' ? 'UNCOMMON' : firstItem.rarity === 'UNCOMMON' ? 'RARE' : firstItem.rarity === 'RARE' ? 'EPIC' : 'LEGENDARY';
    const fused: ItemInstance = {
      id: Math.random().toString(),
      templateId: firstItem.templateId,
      itemLevel: firstItem.itemLevel,
      rarity: nextRarity,
      enhanceLevel: 0,
      sockets: [],
    };
    const remainingBag = inventory.filter((i) => !itemIds.includes(i.id));
    set({
      gold: Math.max(0, get().gold - 500),
      inventory: [...remainingBag, fused],
    });
    return fused;
  },

  gemFusion: async (gemType: string, sourceTier: number) => {
    const { userId } = get();
    if (userId) {
      try {
        const result = await gameApi.gemFusion(userId, gemType, sourceTier);
        set((s) => ({ gold: Math.max(0, s.gold - 500 * sourceTier) }));
        return result;
      } catch (err) {
        console.error('Gem Fusion failed on BE:', err);
      }
    }
    return `${gemType}_T${sourceTier + 1}`;
  },

  craftAccessory: async (recipeId: string) => {
    const { userId, inventory } = get();
    if (userId) {
      try {
        const item = await gameApi.craftAccessory(userId, recipeId);
        set((s) => ({
          gold: Math.max(0, s.gold - 1000),
          enhanceStones: Math.max(0, s.enhanceStones - 5),
          inventory: [...inventory, item],
        }));
        return true;
      } catch (err) {
        console.error('Craft Accessory failed on BE:', err);
      }
    }
    return false;
  },

  brewBlessing: async (recipeId: string) => {
    const { userId } = get();
    if (userId) {
      try {
        await gameApi.brewAlchemy(userId, recipeId);
        set((s) => ({
          gold: Math.max(0, s.gold - 500),
          gems: Math.max(0, s.gems - 20),
        }));
        return true;
      } catch (err) {
        console.error('Brew Blessing failed on BE:', err);
      }
    }
    return false;
  },

  inlayGemToItem: async (itemInstanceId: string, gemId: string) => {
    const { userId, inventory } = get();
    if (userId) {
      try {
        const updated = await gameApi.inlayGem(userId, itemInstanceId, gemId);
        set({ inventory: inventory.map((i) => (i.id === updated.id ? updated : i)) });
      } catch (err) {
        console.error('Inlay Gem failed:', err);
      }
    }
  },

  blessItemWithScroll: async (itemInstanceId: string, blessingId: string) => {
    const { userId, inventory } = get();
    if (userId) {
      try {
        const updated = await gameApi.blessItem(userId, itemInstanceId, blessingId);
        set({ inventory: inventory.map((i) => (i.id === updated.id ? updated : i)) });
      } catch (err) {
        console.error('Bless Item failed:', err);
      }
    }
  },

  // Modal actions
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null, mockPaymentConfig: null, enhancingItem: null }),

  triggerWldPayment: (config) => {
    set({
      activeModal: 'MOCK_WLD_PAY',
      mockPaymentConfig: config,
    });
  },

  smashPiggyBank: async () => {
    const { userId, piggyBankGems, gems } = get();
    if (userId) {
      try {
        const res = await gameApi.smashPiggyBank(userId);
        set({
          gems: res.gems,
          piggyBankGems: res.piggyBankGems,
          activeModal: null,
        });
        return;
      } catch (err) {
        console.error('Smash Piggy Bank failed:', err);
      }
    }
    set({
      gems: gems + piggyBankGems,
      piggyBankGems: 0,
      activeModal: null,
    });
  },

  claimDailyPass: async () => {
    const { userId } = get();
    if (userId) {
      try {
        const res = await gameApi.claimDailyPass(userId);
        set({
          gold: res.gold,
          gems: res.gems,
          enhanceStones: res.enhanceStones,
          loginDayIndex: res.loginDayIndex,
          activeModal: null,
        });
        return;
      } catch (err) {
        console.error('Claim Daily Pass failed:', err);
      }
    }
    set((s) => ({
      loginDayIndex: (s.loginDayIndex + 1) % 7,
      gold: s.gold + 2000,
      gems: s.gems + 20,
      activeModal: null,
    }));
  },

  claimGrowthFund: async (stageMilestone) => {
    const { userId, claimedGrowthFundStages, gems, enhanceStones } = get();
    if (userId) {
      try {
        const res = await gameApi.claimGrowthFund(userId, stageMilestone);
        set({
          gems: res.gems,
          enhanceStones: res.enhanceStones,
          claimedGrowthFundStages: [...claimedGrowthFundStages, stageMilestone],
        });
        return;
      } catch (err) {
        console.error('Claim Growth Fund failed:', err);
      }
    }
    set({
      gems: gems + 250,
      enhanceStones: enhanceStones + 10,
      claimedGrowthFundStages: [...claimedGrowthFundStages, stageMilestone],
    });
  },

  executeMockWldPay: async (featureKey, amountWld) => {
    const { userId } = get();
    if (userId) {
      try {
        const profile = await gameApi.mockWldPay(userId, featureKey, amountWld);
        set({
          gold: profile.gold,
          gems: profile.gems,
          enhanceStones: profile.enhanceStones,
          piggyBankGems: profile.piggyBankGems,
          isGoldenPassActive: profile.isGoldenPassActive,
          growthFundUnlocked: profile.growthFundUnlocked,
          activeModal: null,
          mockPaymentConfig: null,
        });
        return;
      } catch (err) {
        console.error('Mock WLD pay failed on BE:', err);
      }
    }

    if (featureKey === 'PIGGY_BANK') {
      set((s) => ({ gems: s.gems + Math.max(500, s.piggyBankGems), piggyBankGems: 0, activeModal: null, mockPaymentConfig: null }));
    } else if (featureKey === 'GOLDEN_PASS') {
      set({ isGoldenPassActive: true, activeModal: null, mockPaymentConfig: null });
    } else if (featureKey === 'GROWTH_FUND') {
      set({ growthFundUnlocked: true, activeModal: null, mockPaymentConfig: null });
    }
  },

  // Phase 4 Implementations
  openSkillTreeModal: () => set({ activeModal: 'SKILL_TREE' }),
  openWorldMapModal: () => set({ activeModal: 'WORLD_MAP' }),
  openBattleLogModal: () => set({ activeModal: 'BATTLE_LOGS' }),

  recordBattleVictory: (world, stage, timeSec, gold, stones, dropName) => {
    const newLog: BattleLogEntry = {
      id: 'log-' + Date.now(),
      world,
      stage,
      result: 'VICTORY',
      clearTimeSeconds: timeSec,
      goldEarned: gold,
      stonesEarned: stones,
      droppedItemName: dropName,
      tacticalTip: `Stage ${world}-${stage} cleared in ${timeSec}s! Squad synergy is exceptional.`,
      timestamp: Date.now(),
    };
    set((state) => ({
      battleLogs: [newLog, ...state.battleLogs.slice(0, 19)],
    }));
  },

  recordBattleDefeat: (world, stage, defeatedWave, timeSec) => {
    const tip = defeatedWave >= 25
      ? `Defeated at Wave ${defeatedWave}/31 (Boss Phase). Try crafting Ward Scrolls or enhancing armor!`
      : `Overwhelmed at Wave ${defeatedWave}/31. Upgrade your Skill Tree or socket Gems for more HP and Dodge!`;

    const newLog: BattleLogEntry = {
      id: 'log-' + Date.now(),
      world,
      stage,
      result: 'DEFEAT',
      clearTimeSeconds: timeSec,
      defeatedAtWave: defeatedWave,
      goldEarned: 0,
      stonesEarned: 0,
      causeOfDeath: defeatedWave === 31 ? 'Boss AoE Enrage Burst' : 'Burst Damage Spike from Mob Pack',
      tacticalTip: tip,
      timestamp: Date.now(),
    };
    set((state) => ({
      battleLogs: [newLog, ...state.battleLogs.slice(0, 19)],
    }));
  },

  upgradeHeroSkill: async (heroId: string, skillId: string) => {
    const { userId, heroes, selectedHeroClass, gold } = get();
    if (userId) {
      try {
        const updatedHero = await gameApi.upgradeSkill(userId, heroId, skillId);
        const heroClass = updatedHero.heroClass as HeroClass;
        set((state) => ({
          heroes: {
            ...state.heroes,
            [heroClass]: {
              ...state.heroes[heroClass],
              skills: updatedHero.skills,
              computedStats: updatedHero.computedStats,
              liveDps: updatedHero.liveDps,
            },
          },
          gold: Math.max(0, state.gold - 500 * ((updatedHero.skills?.[skillId] || 1))),
        }));
        return true;
      } catch (err) {
        console.error('Upgrade skill failed on BE:', err);
      }
    }

    // Local fallback
    const hero = heroes[selectedHeroClass];
    const currentLvl = hero.skills?.[skillId] || 0;
    const cost = 500 * (currentLvl + 1);
    if (gold < cost) return false;

    const newSkills = { ...(hero.skills || {}), [skillId]: currentLvl + 1 };
    set((state) => ({
      gold: state.gold - cost,
      heroes: {
        ...state.heroes,
        [selectedHeroClass]: {
          ...hero,
          skills: newSkills,
        },
      },
    }));
    return true;
  },

  // Combat Speed Controls
  combatSpeed: 1,
  setCombatSpeed: (speed) => set({ combatSpeed: speed }),

  // Hydrate State on App Load & F5
  fetchInitialData: async () => {
    try {
      // 1. Get or create user profile
      const userProfile = await gameApi.getProfile();
      if (!userProfile || !userProfile.id) return;

      const userId = userProfile.id;

      // 2. Fetch heroes, inventory & monetization status in parallel
      const [heroesList, bagItems, monetizationStatus] = await Promise.all([
        gameApi.getHeroes(userId).catch(() => []),
        gameApi.getInventory(userId).catch(() => []),
        gameApi.getMonetizationStatus(userId).catch(() => null),
      ]);

      // 3. Transform Heroes
      const heroesMap: Record<HeroClass, Hero> = { ...get().heroes };
      if (heroesList && heroesList.length > 0) {
        heroesList.forEach((h: any) => {
          const heroClass = h.heroClass as HeroClass;
          const equipMap: Partial<Record<ItemSlot, ItemInstance>> = {};
          if (h.equippedItems && Array.isArray(h.equippedItems)) {
            h.equippedItems.forEach((inst: any) => {
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

          const heroNames: Record<HeroClass, string> = {
            WARRIOR: 'Warrior',
            RANGER: 'Archer',
            MAGE: 'Wizard',
            PRIEST: 'Priest',
          };

          heroesMap[heroClass] = {
            id: h.id,
            name: heroNames[heroClass] || h.name || heroClass,
            heroClass,
            level: h.level || 1,
            exp: h.exp || 0,
            currentHp: 150,
            skillPoints: 0,
            equipment: equipMap,
            skills: h.skills || {},
            computedStats: h.computedStats,
            liveDps: h.liveDps,
          };
        });
      }

      // 4. Transform Inventory
      const inventoryList: ItemInstance[] = (bagItems || []).map((inst: any) => ({
        id: inst.id,
        templateId: inst.template?.id || inst.templateId,
        itemLevel: inst.itemLevel,
        rarity: inst.currentRarity || inst.rarity,
        enhanceLevel: inst.enhanceLevel || 0,
        sockets: inst.sockets || [],
        blessingId: inst.blessingId,
        computedStats: inst.computedStats,
      }));

      // 5. Update Zustand store
      set({
        userId,
        gold: userProfile.gold,
        gems: userProfile.gems,
        enhanceStones: userProfile.enhanceStones,
        worldIndex: userProfile.currentWorld || 1,
        stageIndex: userProfile.currentStage || 1,
        currentWave: userProfile.currentWave || 1,
        maxClearedStage: userProfile.maxClearedStage || 0,
        piggyBankGems: monetizationStatus?.piggyBankGems ?? userProfile.piggyBankGems,
        isGoldenPassActive: monetizationStatus?.isGoldenPassActive ?? userProfile.isGoldenPassActive,
        growthFundUnlocked: monetizationStatus?.growthFundUnlocked ?? userProfile.growthFundUnlocked,
        heroes: heroesMap,
        inventory: inventoryList.length > 0 ? inventoryList : get().inventory,
      });

      console.log('✅ Synchronized state from Backend Database successfully!');
    } catch (err) {
      console.warn('Backend sync failed, running with local in-memory fallback:', err);
    }
  },
}));

