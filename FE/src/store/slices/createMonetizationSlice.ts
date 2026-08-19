import { StateCreator } from 'zustand';
import { HeroClass } from '../../types/enums';
import { ItemInstance } from '../../types/item.types';
import { idempotencyManager } from '@/services/idempotency';

export interface MonetizationSlice {
  userId: string | null;
  piggyBankGems: number;
  isGoldenPassActive: boolean;
  goldenPassClaimedDays: number[];
  activeModal: string | null;
  mockPaymentConfig: any;
  loginDayIndex: number;

  setUserId: (id: string | null) => void;
  openModal: (modalName: string) => void;
  closeModal: () => void;
  smashPiggyBank: () => boolean;
  claimDailyPass: (day: number) => boolean;
  buyGoldenPass: () => void;
  triggerWldPayment: (config: any) => void;
  executeMockWldPay: () => boolean;

  openChestVaultModal: () => void;
  openEnhanceModal: (item?: ItemInstance) => void;
  closeEnhanceModal: () => void;
  openSkillTreeModal: (heroClass?: HeroClass) => void;
  closeChestRewardModal: () => void;
}

export const createMonetizationSlice: StateCreator<any, [], [], MonetizationSlice> = (set, get) => ({
  userId: null,
  piggyBankGems: 150,
  isGoldenPassActive: false,
  goldenPassClaimedDays: [],
  activeModal: null,
  mockPaymentConfig: null,
  loginDayIndex: 1,

  setUserId: (id) => {
    idempotencyManager.setUserId(id);
    set({ userId: id });
  },
  openModal: (modalName) => set({ activeModal: modalName }),
  closeModal: () => set({ activeModal: null, mockPaymentConfig: null }),

  smashPiggyBank: () => {
    const { piggyBankGems, gems, addFloatingText } = get();
    if (piggyBankGems < 500) {
      addFloatingText?.('Piggy Bank is not full yet!', 180, 70, '#F59E0B', true);
      return false;
    }
    set({
      gems: gems + piggyBankGems,
      piggyBankGems: 0,
    });
    addFloatingText?.(`Smashed Piggy Bank! +${piggyBankGems} Gems`, 180, 70, '#34D399', true);
    return true;
  },

  claimDailyPass: (day) => {
    const { goldenPassClaimedDays, addFloatingText } = get();
    if (goldenPassClaimedDays.includes(day)) return false;

    set({
      goldenPassClaimedDays: [...goldenPassClaimedDays, day],
    });
    addFloatingText?.(`Claimed Day ${day} Pass Rewards!`, 180, 70, '#34D399', true);
    return true;
  },

  buyGoldenPass: () => {
    const { isGoldenPassActive, addFloatingText } = get();
    if (isGoldenPassActive) return;
    set({ isGoldenPassActive: true });
    addFloatingText?.('Awakening Pass Premium Activated!', 180, 70, '#F59E0B', true);
  },

  triggerWldPayment: (config) => {
    set({
      mockPaymentConfig: config,
      activeModal: 'MOCK_WLD_PAY',
    });
  },

  executeMockWldPay: () => {
    const { mockPaymentConfig, buyGoldenPass, smashPiggyBank, addFloatingText } = get();
    if (!mockPaymentConfig) return false;

    if (mockPaymentConfig.action === 'BUY_GOLDEN_PASS') {
      buyGoldenPass();
    } else if (mockPaymentConfig.action === 'SMASH_PIGGY') {
      smashPiggyBank();
    }

    set({ activeModal: null, mockPaymentConfig: null });
    addFloatingText?.('World ID Payment Confirmed & Verified on Chain!', 180, 70, '#34D399', true);
    return true;
  },

  openChestVaultModal: () => set({ activeModal: 'CHEST_VAULT' }),
  openEnhanceModal: (item) => {
    if (item) set({ enhancingItem: item });
    set({ activeModal: 'ENHANCE' });
  },
  closeEnhanceModal: () => set({ activeModal: null, enhancingItem: null }),
  openSkillTreeModal: (heroClass) => {
    if (heroClass) set({ selectedHero: heroClass, selectedHeroClass: heroClass });
    set({ activeModal: 'SKILL_TREE' });
  },
  closeChestRewardModal: () => set({ activeModal: null, openedRewardItem: null }),
});
