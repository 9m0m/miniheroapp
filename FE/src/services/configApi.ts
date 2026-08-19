import client from './client';

export interface FeatureFlags {
  coreV2Enabled: boolean;
  towerV2Enabled: boolean;
  paidRecruitmentEnabled: boolean;
  paidExpeditionSlotsEnabled: boolean;
  catalogVersion?: string;
  balanceVersion?: string;
}

export const configApi = {
  async getFeatureFlags(): Promise<FeatureFlags> {
    const res = await client.get<FeatureFlags>('/config/features');
    return res.data;
  },
};
