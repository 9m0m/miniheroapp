export interface BattleLogEntry {
  id: string;
  world: number;
  stage: number;
  result: 'VICTORY' | 'DEFEAT';
  clearTimeSeconds: number;
  defeatedAtWave?: number;
  goldEarned: number;
  stonesEarned: number;
  droppedItemName?: string;
  causeOfDeath?: string;
  tacticalTip?: string;
  timestamp: number;
}
