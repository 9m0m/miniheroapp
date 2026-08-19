import { HeroRole } from '@/domain/heroes/hero.types';

export type BannerType = 'STANDARD' | 'FEATURED';

export interface RecruitmentBanner {
  bannerId: string;
  name: string;
  description: string;
  type: BannerType;
  ticketCost: number;
  isPaid: boolean;
  enabledHeroTemplateIds: string[];
  ratesDisplay: Record<string, string>;
}

export interface RecruitmentPullRequest {
  bannerId: string;
  ticketType: string;
  idempotencyKey: string;
}

export interface RecruitmentPullResponse {
  heroTemplateId: string;
  heroName: string;
  role: HeroRole;
  rarity: string;
  isNew: boolean;
  shardsGranted: number;
  heroInstanceId: string;
  lifetimePulls: number;
  remainingTickets: number;
  ledgerId: string;
}
