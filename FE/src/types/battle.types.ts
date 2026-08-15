import { ElementalType } from './enums';
import { ItemInstance } from './item.types';

export interface Monster {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  atk: number;
  armor: number;
  elementalType: ElementalType;
  isBoss?: boolean;
  x: number;
  y: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  isCrit?: boolean;
  opacity: number;
  createdAt: number;
}

export interface WaveClearResponse {
  goldEarned: number;
  enhanceStonesEarned: number;
  piggyBankGemsAdded: number;
  totalPiggyBankGems: number;
  droppedChest: boolean;
  droppedItem: ItemInstance | null;
  currentWorld: number;
  currentStage: number;
  currentWave: number;
  totalGold: number;
  totalGems: number;
  totalStones: number;
}
