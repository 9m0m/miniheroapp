export type OnboardingStep =
  | 'WELCOME'
  | 'SUMMON_KNIGHT_REQUIRED'
  | 'SUMMON_RANGER_REQUIRED'
  | 'FIRST_EXPEDITION_REQUIRED'
  | 'FIRST_EXPEDITION_RUNNING'
  | 'FIRST_EXPEDITION_CLAIM_REQUIRED'
  | 'THIRD_SUMMON_REQUIRED'
  | 'COMPLETE';

export interface OnboardingState {
  step: OnboardingStep;
  lifetimePulls: number;
  knightSummoned: boolean;
  rangerSummoned: boolean;
  thirdSummonCompleted: boolean;
  firstExpeditionClaimed: boolean;
  towerUnlocked: boolean;
  standardSummonTickets: number;
}

export interface OnboardingAdvanceRequest {
  targetStep: OnboardingStep;
  idempotencyKey?: string;
}
