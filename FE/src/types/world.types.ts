import { ElementalType } from './enums';

export interface WorldConfig {
  worldIndex: number;
  name: string;
  description: string;
  backgroundTheme: string;
  dominantElement: ElementalType;
  bossName: string;
  bossIcon: string;
  totalStages: number;
  dropBonusList: string[];
}
