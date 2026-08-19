import client from './client';
import { OnboardingState, OnboardingAdvanceRequest } from '@/types/onboarding.types';

export const onboardingApi = {
  async getState(userId?: string): Promise<OnboardingState> {
    const params = userId ? { userId } : {};
    const res = await client.get<OnboardingState>('/onboarding/state', { params });
    return res.data;
  },

  async advance(request: OnboardingAdvanceRequest, userId?: string): Promise<OnboardingState> {
    const params = userId ? { userId } : {};
    const res = await client.post<OnboardingState>('/onboarding/advance', request, { params });
    return res.data;
  },
};
