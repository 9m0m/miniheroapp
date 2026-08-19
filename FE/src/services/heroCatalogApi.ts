import { apiClient } from './client';
import { HeroCatalogResponse, HeroTemplate } from '@/domain/heroes/hero.types';

export const heroCatalogApi = {
  async getCatalog(version = 'current'): Promise<HeroCatalogResponse> {
    const res = await apiClient.get<HeroCatalogResponse>(`/hero-catalog?version=${version}`);
    return res.data;
  },

  async getTemplateById(templateId: string): Promise<HeroTemplate> {
    const res = await apiClient.get<HeroTemplate>(`/hero-catalog/${templateId}`);
    return res.data;
  },

  async getEnabledTemplates(): Promise<HeroTemplate[]> {
    const res = await apiClient.get<HeroTemplate[]>('/hero-catalog/enabled');
    return res.data;
  },
};
