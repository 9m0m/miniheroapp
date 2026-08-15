export type TrialType = 'DPS_30S' | 'BOSS_SPEEDRUN';

export interface TrialLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  dpsPeak: number;
  totalDamage: number;
  timeTakenSec: number;
  isBuildPublic: boolean;
  recordedAt: string;
}

export interface BuildInspectResponse {
  userId: string;
  username: string;
  isBuildPublic: boolean;
  heroesSnapshotJson?: string | null;
  message: string;
}
