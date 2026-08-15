import { create } from 'zustand';
import { Hero, HeroClass, ItemInstance, ItemTemplate, Monster, FloatingText, ItemSlot, Stats } from '../types/game.types';
import { computeItemStats, createDefaultStats, addStats, clampStats } from '../engine/statEvaluator';

export const STARTER_TEMPLATES: Record<string, ItemTemplate> = {
  // Warrior Gear
  'wpn_iron_sword': {
    id: 'wpn_iron_sword',
    name: 'Kiếm Sắt Tân Binh',
    description: 'Vũ khí cơ bản của Đấu Sĩ.',
    icon: '⚔️',
    slot: 'MAIN_HAND',
    requiredClass: 'WARRIOR',
    baseRarity: 'COMMON',
    elementalType: 'PHYSICAL',
    baseStats: { physAtk: 25, atkPercent: 2 },
    iLvlScalingFactor: 0.08,
  },
  'shd_iron_shield': {
    id: 'shd_iron_shield',
    name: 'Khiên Thép Hộ Mệnh',
    description: 'Bảo vệ kiên cố trước mọi đòn đánh.',
    icon: '🛡️',
    slot: 'OFF_HAND',
    requiredClass: 'WARRIOR',
    baseRarity: 'UNCOMMON',
    elementalType: 'PHYSICAL',
    baseStats: { armor: 40, maxHp: 80, dmgReduction: 3 },
    iLvlScalingFactor: 0.08,
  },
  // Ranger Gear
  'wpn_hunting_bow': {
    id: 'wpn_hunting_bow',
    name: 'Cung Săn Gió Lốc',
    description: 'Bắn nhanh và chính xác.',
    icon: '🏹',
    slot: 'MAIN_HAND',
    requiredClass: 'RANGER',
    baseRarity: 'COMMON',
    elementalType: 'PHYSICAL',
    baseStats: { physAtk: 30, atkSpeed: 0.2, critRate: 8 },
    iLvlScalingFactor: 0.08,
  },
  // Mage Gear
  'wpn_fire_staff': {
    id: 'wpn_fire_staff',
    name: 'Trượng Hỏa Xà',
    description: 'Kêu gọi sức mạnh của lửa thiêu rụi kẻ thù.',
    icon: '🔥',
    slot: 'MAIN_HAND',
    requiredClass: 'MAGE',
    baseRarity: 'RARE',
    elementalType: 'FIRE',
    baseStats: { magicAtk: 45, atkPercent: 8, elemDmgBonus: 15 },
    iLvlScalingFactor: 0.08,
  },
  // Priest Gear
  'wpn_holy_bell': {
    id: 'wpn_holy_bell',
    name: 'Chuông Thánh Cứu Rỗi',
    description: 'Hồi phục sinh lực và bảo hộ đồng đội.',
    icon: '🔔',
    slot: 'OFF_HAND',
    requiredClass: 'PRIEST',
    baseRarity: 'UNCOMMON',
    elementalType: 'CHAOS',
    baseStats: { hpRegen: 15, maxHp: 60, cdr: 5 },
    iLvlScalingFactor: 0.08,
  },
};

interface GameState {
  // Currencies & Progression
  gold: number;
  gems: number;
  enhanceStones: number;
  worldIndex: number; // 1 to 4
  stageIndex: number; // 1 to 10
  currentWave: number; // 1 to 30
  isAutoRepeat: boolean;

  // Heroes
  heroes: Record<HeroClass, Hero>;
  selectedHeroClass: HeroClass;

  // Inventory
  inventory: ItemInstance[];
  templates: Record<string, ItemTemplate>;

  // Combat State
  currentMonster: Monster | null;
  floatingTexts: FloatingText[];

  // Actions
  selectHero: (heroClass: HeroClass) => void;
  equipItem: (heroClass: HeroClass, item: ItemInstance) => void;
  unequipItem: (heroClass: HeroClass, slot: ItemSlot) => void;
  addGold: (amount: number) => void;
  addGems: (amount: number) => void;
  addItemToInventory: (item: ItemInstance) => void;
  removeItemFromInventory: (itemId: string) => void;
  setCurrentMonster: (monster: Monster | null) => void;
  addFloatingText: (text: string, x: number, y: number, color: string, isCrit?: boolean) => void;
  clearOldFloatingTexts: () => void;
  advanceWave: () => void;
  repeatStage: () => void;
  getHeroTotalStats: (heroClass: HeroClass) => Stats;
}

export const useGameStore = create<GameState>((set, get) => ({
  gold: 2500,
  gems: 10,
  enhanceStones: 25,
  worldIndex: 1,
  stageIndex: 1,
  currentWave: 1,
  isAutoRepeat: false,

  selectedHeroClass: 'WARRIOR',

  templates: STARTER_TEMPLATES,

  heroes: {
    WARRIOR: {
      id: 'h_warrior',
      name: 'Arthur (Hiệp Sĩ)',
      heroClass: 'WARRIOR',
      level: 5,
      exp: 120,
      currentHp: 240,
      skillPoints: 2,
      equipment: {
        MAIN_HAND: {
          id: 'inst_w_01',
          templateId: 'wpn_iron_sword',
          itemLevel: 5,
          rarity: 'COMMON',
          enhanceLevel: 3,
          sockets: [],
        },
        OFF_HAND: {
          id: 'inst_w_02',
          templateId: 'shd_iron_shield',
          itemLevel: 5,
          rarity: 'UNCOMMON',
          enhanceLevel: 2,
          sockets: [],
        },
      },
    },
    RANGER: {
      id: 'h_ranger',
      name: 'Robin (Xạ Thủ)',
      heroClass: 'RANGER',
      level: 5,
      exp: 100,
      currentHp: 180,
      skillPoints: 2,
      equipment: {
        MAIN_HAND: {
          id: 'inst_r_01',
          templateId: 'wpn_hunting_bow',
          itemLevel: 5,
          rarity: 'COMMON',
          enhanceLevel: 4,
          sockets: [],
        },
      },
    },
    MAGE: {
      id: 'h_mage',
      name: 'Merlin (Pháp Sư)',
      heroClass: 'MAGE',
      level: 5,
      exp: 150,
      currentHp: 160,
      skillPoints: 2,
      equipment: {
        MAIN_HAND: {
          id: 'inst_m_01',
          templateId: 'wpn_fire_staff',
          itemLevel: 5,
          rarity: 'RARE',
          enhanceLevel: 5,
          sockets: ['RUBY_T1'],
        },
      },
    },
    PRIEST: {
      id: 'h_priest',
      name: 'Elena (Mục Sư)',
      heroClass: 'PRIEST',
      level: 5,
      exp: 140,
      currentHp: 200,
      skillPoints: 2,
      equipment: {
        OFF_HAND: {
          id: 'inst_p_01',
          templateId: 'wpn_holy_bell',
          itemLevel: 5,
          rarity: 'UNCOMMON',
          enhanceLevel: 2,
          sockets: [],
        },
      },
    },
  },

  inventory: [
    {
      id: 'bag_item_01',
      templateId: 'wpn_fire_staff',
      itemLevel: 10,
      rarity: 'EPIC',
      enhanceLevel: 0,
      sockets: ['RUBY_T2', 'EMERALD_T1'],
      blessingId: 'SCROLL_OF_MIGHT',
    },
  ],

  currentMonster: {
    id: 'mob_01',
    name: 'Goblin Chiến Binh',
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

  equipItem: (heroClass, item) => {
    const template = get().templates[item.templateId];
    if (!template) return;

    set((state) => {
      const hero = state.heroes[heroClass];
      const oldEquip = hero.equipment[template.slot];

      // Remove from bag, add old item to bag
      const newInventory = state.inventory.filter((i) => i.id !== item.id);
      if (oldEquip) {
        newInventory.push(oldEquip);
      }

      return {
        heroes: {
          ...state.heroes,
          [heroClass]: {
            ...hero,
            equipment: {
              ...hero.equipment,
              [template.slot]: item,
            },
          },
        },
        inventory: newInventory,
      };
    });
  },

  unequipItem: (heroClass, slot) => {
    set((state) => {
      const hero = state.heroes[heroClass];
      const item = hero.equipment[slot];
      if (!item) return state;

      const newEquipment = { ...hero.equipment };
      delete newEquipment[slot];

      return {
        heroes: {
          ...state.heroes,
          [heroClass]: {
            ...hero,
            equipment: newEquipment,
          },
        },
        inventory: [...state.inventory, item],
      };
    });
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

  advanceWave: () => {
    set((s) => {
      if (s.currentWave < 30) {
        return { currentWave: s.currentWave + 1 };
      } else {
        // Stage clear!
        return {
          currentWave: 1,
          stageIndex: s.stageIndex < 10 ? s.stageIndex + 1 : 1,
          worldIndex: s.stageIndex === 10 ? (s.worldIndex < 4 ? s.worldIndex + 1 : 1) : s.worldIndex,
          gold: s.gold + 500, // Stage clear gold bonus
        };
      }
    });
  },

  repeatStage: () => set({ currentWave: 1, isAutoRepeat: true }),

  getHeroTotalStats: (heroClass) => {
    const state = get();
    const hero = state.heroes[heroClass];
    const total = createDefaultStats();

    // Base stats by class
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

    // Add equipped gear stats
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
}));
