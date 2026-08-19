import { StateCreator } from 'zustand';
import { ChestVaultDto } from '../../types/chestVault.types';

export interface FloatingCombatText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  isCrit: boolean;
  opacity: number;
  createdAt: number;
}

export interface BattleSlice {
  gold: number;
  essence: number;
  gems: number;
  enhanceStones: number;
  combatSpeed: number;
  chestVault: ChestVaultDto;
  floatingTexts: FloatingCombatText[];

  addGold: (amount: number) => void;
  addEssence: (amount: number) => void;
  addGems: (amount: number) => void;
  addEnhanceStones: (amount: number) => void;
  setCombatSpeed: (speed: number) => void;
  addFloatingText: (text: string, x: number, y: number, color?: string, isCrit?: boolean) => void;
}

export const createBattleSlice: StateCreator<any, [], [], BattleSlice> = (set) => ({
  gold: 0,
  essence: 0,
  gems: 0,
  enhanceStones: 0,
  combatSpeed: 1,
  chestVault: {
    normalChests: 0,
    totalChests: 0,
  },
  floatingTexts: [],

  addGold: (amount) => set((s: any) => ({ gold: s.gold + amount })),
  addEssence: (amount) => set((s: any) => ({ essence: (s.essence || 0) + amount })),
  addGems: (amount) => set((s: any) => ({ gems: s.gems + amount })),
  addEnhanceStones: (amount) => set((s: any) => ({ enhanceStones: s.enhanceStones + amount })),
  setCombatSpeed: (speed) => set({ combatSpeed: speed }),

  addFloatingText: (text, x, y, color = '#F8FAFC', isCrit = false) => {
    const id = `ft_${Date.now()}_${Math.random()}`;
    const newText: FloatingCombatText = {
      id,
      text,
      x,
      y,
      color,
      isCrit,
      opacity: 1,
      createdAt: Date.now(),
    };

    set((state: any) => ({
      floatingTexts: [...state.floatingTexts.slice(-20), newText],
    }));

    setTimeout(() => {
      set((state: any) => ({
        floatingTexts: state.floatingTexts.filter((t: any) => t.id !== id),
      }));
    }, 1200);
  },
});
