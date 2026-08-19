'use client';

import React, { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/store/useGameStore';
import { gameApi } from '@/services/api';
import { Package, Sparkles, Loader2 } from 'lucide-react';
import { ChestTier } from '@/types/chestVault.types';

interface ChestVaultSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TierConfig {
  tier: ChestTier;
  name: string;
  desc: string;
  badge: string;
  badgeColor: string;
  borderColor: string;
}

const CHEST_TIERS: TierConfig[] = [
  {
    tier: 'chest_normal',
    name: 'Normal Chest',
    desc: 'Common (85%), Uncommon (12%), Rare (3%)',
    badge: 'Standard',
    badgeColor: 'text-slate-400 bg-slate-800 border-slate-700',
    borderColor: 'border-slate-800',
  },
];

export const ChestVaultSheet: React.FC<ChestVaultSheetProps> = ({ isOpen, onClose }) => {
  const chestVault = useGameStore((state) => (state as any).chestVault) || {
    normalChests: 0,
    totalChests: 0,
  };
  const inventory = useGameStore((state) => state.inventory);
  const maxInventorySlots = useGameStore((state) => state.maxInventorySlots);
  const setOpenedRewardItem = useGameStore((state) => state.setOpenedRewardItem);
  const openModal = useGameStore((state) => state.openModal);
  const addFloatingText = useGameStore((state) => state.addFloatingText);

  const [openingTier, setOpeningTier] = useState<ChestTier | null>(null);

  const getTierCount = (tier: ChestTier): number => {
    return tier === 'chest_normal' ? chestVault.normalChests || 0 : 0;
  };

  const handleOpenChest = async (tier: ChestTier) => {
    if (openingTier) return; // Prevent double-tap

    const gearCount = inventory.length;
    if (gearCount >= maxInventorySlots) {
      addFloatingText?.(`Backpack is Full (${gearCount}/${maxInventorySlots})!`, 180, 70, '#EF4444', true);
      return;
    }

    const count = getTierCount(tier);
    if (count <= 0) return;

    setOpeningTier(tier);
    const idempotencyKey = `open_${tier}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    try {
      const res = await gameApi.openVaultChest({
        chestTier: tier,
        idempotencyKey,
      });

      if (res && res.openedItem) {
        useGameStore.setState((s: any) => ({
          inventory: [res.openedItem, ...s.inventory],
          chestVault: res.chestVault || {
            ...s.chestVault,
            normalChests: tier === 'chest_normal' ? Math.max(0, s.chestVault.normalChests - 1) : s.chestVault.normalChests,
            totalChests: Math.max(0, s.chestVault.totalChests - 1),
          },
        }));

        setOpenedRewardItem(res.openedItem);
        openModal('CHEST_REWARD');
        onClose();
      }
    } catch (err: any) {
      console.warn('Failed to open chest from Chest Vault:', err);
      const msg = err?.message || 'Could not open chest. Please retry.';
      addFloatingText?.(msg, 180, 70, '#EF4444', true);
    } finally {
      setOpeningTier(null);
    }
  };

  const total = chestVault.totalChests || 0;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Chest Vault (${total})`}>
      <div className="flex flex-col gap-3 py-1">
        <p className="text-xs text-slate-400">
          Chests are stored safely in your vault without taking up backpack space. Open chests to acquire equipment.
        </p>

        {total === 0 ? (
          <div className="p-6 rounded-lg bg-slate-900 border border-slate-800 text-center flex flex-col items-center gap-2">
            <Package className="w-8 h-8 text-slate-500" />
            <p className="text-sm font-semibold text-slate-300">No chests in Vault yet</p>
            <p className="text-xs text-slate-500">
              Defeat enemies and stage bosses in battle to earn chests.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {CHEST_TIERS.map((cfg) => {
              const count = getTierCount(cfg.tier);
              const isOpening = openingTier === cfg.tier;

              return (
                <div
                  key={cfg.tier}
                  className={`flex items-center justify-between p-3 rounded-lg bg-slate-900 border ${cfg.borderColor}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-semibold text-slate-200">{cfg.name}</h4>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${cfg.badgeColor}`}>
                          x{count}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{cfg.desc}</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={count > 0 ? 'primary' : 'secondary'}
                    disabled={count === 0 || openingTier !== null}
                    onClick={() => handleOpenChest(cfg.tier)}
                    className="min-h-[44px] min-w-[70px]"
                  >
                    {isOpening ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
