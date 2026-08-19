import client from './client';
import { RecruitmentBanner, RecruitmentPullRequest, RecruitmentPullResponse } from '@/types/recruitment.types';

export const recruitmentApi = {
  async getBanners(): Promise<RecruitmentBanner[]> {
    const res = await client.get<RecruitmentBanner[]>('/recruitment/banners');
    return res.data;
  },

  async pull(request: RecruitmentPullRequest, userId?: string): Promise<RecruitmentPullResponse> {
    const params = userId ? { userId } : {};
    const res = await client.post<RecruitmentPullResponse>('/recruitment/pull', request, { params });
    return res.data;
  },

  async getHistory(userId?: string): Promise<unknown[]> {
    const params = userId ? { userId } : {};
    const res = await client.get<unknown[]>('/recruitment/history', { params });
    return res.data;
  },
};
