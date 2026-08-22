import { StateCreator } from 'zustand';
import { ItemInstance } from '../../types/item.types';
import { ActiveModal } from '../../types/monetization.types';
import { idempotencyManager } from '@/services/idempotency';
import { monetizationApi } from '@/services/monetizationApi';

export interface MonetizationSlice {
  userId: string | null;
  piggyBankGems: number;
  isGoldenPassActive: boolean;
  goldenPassClaimedDays: number[];
  loginDayIndex: number;
  loginLastClaimedAt: string | null;
  canClaimToday: boolean;
  activeModal: ActiveModal;
  mockPaymentConfig: any;
  enhancingItem: ItemInstance | null;
  openedRewardItem: ItemInstance | null;

  setUserId: (id: string | null) => void;
  openModal: (modalName: ActiveModal) => void;
  closeModal: () => void;
  fetchMonetizationStatus: () => Promise<void>;
  claimPassDay: (dayIndex: number) => Promise<void>;
  smashPiggyBank: () => Promise<void>;
  claimDailyPass: (day: number) => boolean;
  buyGoldenPass: () => void;
  triggerWldPayment: (config: any) => void;
  executeMockWldPay: () => boolean;

  openChestVaultModal: () => void;
  openEnhanceModal: (item?: ItemInstance) => void;
  closeEnhanceModal: () => void;
  closeChestRewardModal: () => void;
}

export const createMonetizationSlice: StateCreator<any, [], [], MonetizationSlice> = (set, get) => ({
  userId: null,
  piggyBankGems: 150,
  isGoldenPassActive: false,
  goldenPassClaimedDays: [],
  loginDayIndex: 1,
  loginLastClaimedAt: null,
  canClaimToday: true,
  activeModal: null,
  mockPaymentConfig: null,
  enhancingItem: null,
  openedRewardItem: null,

  setUserId: (id) => {
    idempotencyManager.setUserId(id);
    set({ userId: id });
  },
  openModal: (modalName) => set({ activeModal: modalName }),
  closeModal: () => set({ activeModal: null, mockPaymentConfig: null }),

  fetchMonetizationStatus: async () => {
    try {
      const res = await monetizationApi.getStatus();
      set({
        piggyBankGems: res.piggyBankGems,
        isGoldenPassActive: res.isGoldenPassActive,
        loginDayIndex: res.loginDayIndex,
        loginLastClaimedAt: res.loginLastClaimedAt,
        canClaimToday: res.canClaimToday,
      });
    } catch (err) {
      console.warn('Failed to fetch monetization status from backend, using local defaults', err);
    }
  },

  claimPassDay: async (dayIndex) => {
    const { addFloatingText, userId } = get();
    try {
      const res = await monetizationApi.claimDailyPass(userId || undefined);
      set({
        gems: res.gems,
        loginDayIndex: res.loginDayIndex,
        loginLastClaimedAt: res.loginLastClaimedAt,
        canClaimToday: false,
      });
      addFloatingText?.(`Claimed Day ${dayIndex} Pass Rewards!`, 180, 70, '#F59E0B', true);
    } catch (err: any) {
      addFloatingText?.(err.message || 'Could not claim daily pass reward', 180, 70, '#EF4444', true);
    }
  },

  smashPiggyBank: async () => {
    const { addFloatingText, userId } = get();
    try {
      const res = await monetizationApi.smashPiggyBank(userId || undefined);
      set({
        gems: res.gems,
        piggyBankGems: res.piggyBankGems,
        activeModal: null,
      });
      addFloatingText?.('Smashed Piggy Bank! Gems Collected!', 180, 70, '#10B981', true);
    } catch (err: any) {
      addFloatingText?.(err.message || 'Could not unlock piggy bank', 180, 70, '#EF4444', true);
    }
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
    get().triggerWldPayment({
      featureKey: 'GOLDEN_PASS',
      title: 'Hero Awakening Pass (7-Day)',
      priceWld: 1.0,
      description: 'Unlock 5x rewards daily, Royal Claymore, and the legendary Holy Blade Excalibur.',
      benefitText: 'Instantly enables 5x multiplier on all 7-day milestone rewards.',
    });
  },

  triggerWldPayment: (config) => {
    set({
      mockPaymentConfig: config,
      activeModal: 'MOCK_WLD_PAY',
    });
  },

  executeMockWldPay: () => {
    const { mockPaymentConfig, addFloatingText } = get();
    if (!mockPaymentConfig) return false;

    if (mockPaymentConfig.featureKey === 'PIGGY_BANK') {
      get().smashPiggyBank();
    } else if (mockPaymentConfig.featureKey === 'GOLDEN_PASS') {
      set({ isGoldenPassActive: true });
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
  closeChestRewardModal: () => set({ activeModal: null, openedRewardItem: null }),
});
