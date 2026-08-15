export type ActiveModal = 
  | 'PIGGY_BANK' 
  | 'AWAKENING_PASS' 
  | 'GROWTH_FUND' 
  | 'MOCK_WLD_PAY' 
  | 'ENHANCE' 
  | 'SKILL_TREE' 
  | 'WORLD_MAP' 
  | 'BATTLE_LOGS' 
  | 'QUESTS'
  | 'TRIAL_ARENA'
  | null;

export interface MockPaymentConfig {
  featureKey: string;
  title: string;
  priceWld: number;
  description: string;
  benefitText: string;
}

export interface MonetizationStatus {
  piggyBankGems: number;
  isPiggyBankFull: boolean;
  isGoldenPassActive: boolean;
  loginDayIndex: number;
  loginLastClaimedAt: string | null;
  canClaimToday: boolean;
  growthFundUnlocked: boolean;
  claimedGrowthFundStages: number[];
  maxClearedStage: number;
}
