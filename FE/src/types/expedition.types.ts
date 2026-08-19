export type ExpeditionRunStatus = 'RUNNING' | 'COMPLETED' | 'CLAIMED' | 'CANCELLED';

export interface ExpeditionConfig {
  totalSlots: number;
  unlockedSlots: number;
  tutorialDurationSeconds: number;
  normalDurationSeconds: number;
  paidSlotsEnabled: boolean;
}

export interface ExpeditionRun {
  id: string;
  slotIndex: number;
  isTutorial: boolean;
  status: ExpeditionRunStatus;
  heroIds: string[];
  heroTemplateIds: string[];
  startedAt: string;
  completesAt: string;
  durationSeconds?: number;
  remainingSeconds: number;
  isClaimable: boolean;
  rewardPreview: Record<string, unknown>;
}

export interface ExpeditionDispatch {
  slotIndex: number;
  heroIds: string[];
  idempotencyKey: string;
}

export interface ExpeditionClaimResponse {
  expeditionRunId: string;
  slotIndex: number;
  rewardsGranted: Record<string, unknown>;
  releasedHeroIds: string[];
  ledgerId: string;
}
