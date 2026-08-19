export interface UserProfile {
  id: string;
  worldIdHash: string;
  displayName: string;
  gold: number;
  essence: number;
  gems: number;
  enhanceStones: number;
  piggyBankGems: number;
  isGoldenPassActive: boolean;
  loginDayIndex: number;
  loginLastClaimedAt: string | null;
}
