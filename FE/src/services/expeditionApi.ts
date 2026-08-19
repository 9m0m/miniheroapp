import client from './client';
import { ExpeditionConfig, ExpeditionRun, ExpeditionDispatch, ExpeditionClaimResponse } from '@/types/expedition.types';

export const expeditionApi = {
  async getConfig(): Promise<ExpeditionConfig> {
    const res = await client.get<ExpeditionConfig>('/expeditions/config');
    return res.data;
  },

  async getActiveRuns(userId?: string): Promise<ExpeditionRun[]> {
    const params = userId ? { userId } : {};
    const res = await client.get<ExpeditionRun[]>('/expeditions', { params });
    return res.data;
  },

  async dispatch(request: ExpeditionDispatch, userId?: string): Promise<ExpeditionRun> {
    const params = userId ? { userId } : {};
    const res = await client.post<ExpeditionRun>('/expeditions', request, { params });
    return res.data;
  },

  async claim(runId: string, idempotencyKey?: string, userId?: string): Promise<ExpeditionClaimResponse> {
    const params: Record<string, string> = {};
    if (idempotencyKey) params.idempotencyKey = idempotencyKey;
    if (userId) params.userId = userId;
    const res = await client.post<ExpeditionClaimResponse>(`/expeditions/${runId}/claim`, null, { params });
    return res.data;
  },

  async cancel(runId: string, userId?: string): Promise<ExpeditionRun> {
    const params = userId ? { userId } : {};
    const res = await client.post<ExpeditionRun>(`/expeditions/${runId}/cancel`, null, { params });
    return res.data;
  },
};
