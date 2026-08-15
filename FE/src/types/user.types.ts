export interface UserProfile {
  id: string;
  worldIdHash: string;
  displayName: string;
  gold: number;
  gems: number;
  enhanceStones: number;
  currentWorld: number;
  currentStage: number;
  currentWave: number;
  maxClearedStage: number;
  piggyBankGems: number;
  isGoldenPassActive: boolean;
  loginDayIndex: number;
  loginLastClaimedAt: string | null;
  growthFundUnlocked: boolean;
  growthFundClaimedStages: string;
}
