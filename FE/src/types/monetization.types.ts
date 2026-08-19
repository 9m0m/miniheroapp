export type ActiveModal = 
  | 'PIGGY_BANK' 
  | 'AWAKENING_PASS' 
  | 'MOCK_WLD_PAY' 
  | 'ENHANCE' 
  | 'SKILL_TREE' 
  | 'QUESTS'
  | 'TRIAL_ARENA'
  | 'CORE_PARTY_FORMATION'
  | 'CHEST_REWARD'
  | 'CHEST_VAULT'
  | 'RECRUITMENT'
  | 'EXPEDITION'
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
}
