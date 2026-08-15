import { HeroClass } from './enums';

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  currentLevel: number;
  goldCostNextLevel: number;
  bonusDescription: string;
}

export interface HeroSkillTree {
  heroId: string;
  heroClass: HeroClass;
  heroName: string;
  nodes: SkillNode[];
}

export interface UpgradeSkillRequest {
  userId: string;
  heroId: string;
  skillId: string;
}
