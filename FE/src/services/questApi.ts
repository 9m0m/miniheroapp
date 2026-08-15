import { apiClient } from './client';
import { QuestOverviewResponse, QuestTemplateEntity, QuestType } from '../types/quest.types';

export const questApi = {
  // Player APIs
  getQuestOverview: async (userId: string): Promise<QuestOverviewResponse> => {
    const res = await apiClient.get<QuestOverviewResponse>(`/quests/overview?userId=${userId}`);
    return res.data;
  },

  claimQuest: async (userId: string, questId: string): Promise<QuestOverviewResponse> => {
    const res = await apiClient.post<QuestOverviewResponse>(
      `/quests/claim?userId=${userId}&questId=${questId}`
    );
    return res.data;
  },

  claimMilestone: async (
    userId: string,
    questType: QuestType,
    milestoneIndex: number
  ): Promise<QuestOverviewResponse> => {
    const res = await apiClient.post<QuestOverviewResponse>(
      `/quests/milestones/claim?userId=${userId}&questType=${questType}&milestoneIndex=${milestoneIndex}`
    );
    return res.data;
  },

  // Admin APIs
  getAllTemplates: async (): Promise<QuestTemplateEntity[]> => {
    const res = await apiClient.get<QuestTemplateEntity[]>('/admin/quests');
    return res.data;
  },

  createTemplate: async (template: Partial<QuestTemplateEntity>): Promise<QuestTemplateEntity> => {
    const res = await apiClient.post<QuestTemplateEntity>('/admin/quests', template);
    return res.data;
  },

  updateTemplate: async (id: string, template: Partial<QuestTemplateEntity>): Promise<QuestTemplateEntity> => {
    const res = await apiClient.put<QuestTemplateEntity>(`/admin/quests/${id}`, template);
    return res.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/quests/${id}`);
  },
};
