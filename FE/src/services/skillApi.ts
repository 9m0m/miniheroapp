import { apiClient } from './client';
import { HeroSkillTree } from '../types/skill.types';

export const skillApi = {
  /**
   * Lấy cấu hình và trạng thái Cây Kỹ Năng của 1 Tướng.
   */
  getSkillTree: async (heroId: string): Promise<HeroSkillTree> => {
    const res = await apiClient.get<HeroSkillTree>(`/heroes/${heroId}/skills`);
    return res.data;
  },

  /**
   * Nâng cấp 1 nhánh kỹ năng tiêu Gold.
   */
  upgradeSkill: async (userId: string, heroId: string, skillId: string): Promise<any> => {
    const res = await apiClient.post('/heroes/skills/upgrade', {
      userId,
      heroId,
      skillId,
    });
    return res.data;
  },
};
