export type QuestType = 'DAILY' | 'WEEKLY';

export type QuestActionType =
  | 'MONSTER_KILL'
  | 'WAVE_CLEAR'
  | 'BOSS_KILL_W31'
  | 'EQUIPMENT_ENHANCE'
  | 'CHEST_OPEN'
  | 'CUBE_FUSION'
  | 'ALCHEMY_BREW'
  | 'SKILL_UPGRADE'
  | 'GEM_SOCKET'
  | 'TRIAL_RUN'
  | 'GOLD_EARNED';

export interface QuestDto {
  id: string;
  title: string;
  description: string;
  icon: string;
  questType: QuestType;
  actionType: QuestActionType;
  targetCount: number;
  currentCount: number;
  activityPoints: number;
  goldReward: number;
  gemsReward: number;
  stonesReward: number;
  itemTemplateId?: string;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface MilestoneRewardDto {
  milestoneIndex: number; // 1 to 6
  pointsRequired: number; // 20, 40, 60, 80, 100, 120 (Daily) or 100, 200, 300, 400, 500, 600 (Weekly)
  goldReward: number;
  gemsReward: number;
  stonesReward: number;
  itemRewardName?: string;
  icon: string;
  isClaimed: boolean;
  canClaim: boolean;
}

export interface QuestOverviewResponse {
  dailyQuests: QuestDto[];
  weeklyQuests: QuestDto[];
  dailyActivityPoints: number;
  weeklyActivityPoints: number;
  dailyMilestones: MilestoneRewardDto[];
  weeklyMilestones: MilestoneRewardDto[];
  dailyPeriodKey: string;
  weeklyPeriodKey: string;
}

export interface QuestTemplateEntity {
  id: string;
  title: string;
  description: string;
  icon: string;
  questType: QuestType;
  actionType: QuestActionType;
  targetCount: number;
  activityPoints: number;
  goldReward: number;
  gemsReward: number;
  stonesReward: number;
  itemTemplateId?: string;
  isActive: boolean;
  sortOrder: number;
}
