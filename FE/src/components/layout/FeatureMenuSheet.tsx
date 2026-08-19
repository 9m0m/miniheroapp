'use client';

import React from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useGameStore } from '@/store/useGameStore';
import { Swords, Trophy, CalendarCheck, PiggyBank, Package, Castle, Sparkles, Compass } from 'lucide-react';

interface FeatureMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureMenuSheet: React.FC<FeatureMenuSheetProps> = ({ isOpen, onClose }) => {
  const openModal = useGameStore((state) => state.openModal);
  const chestVault = useGameStore((state) => (state as any).chestVault);
  const featureFlags = useGameStore((state) => state.featureFlags);
  const totalChests = chestVault?.totalChests || 0;

  const isTowerV2Enabled = featureFlags?.towerV2Enabled === true;
  const isCoreV2Enabled = featureFlags?.coreV2Enabled === true;

  const handleOpenFeature = (modalKey: any) => {
    onClose();
    openModal(modalKey);
  };

  const menuItems = [
    ...(isCoreV2Enabled
      ? [
          {
            id: 'RECRUITMENT',
            label: 'Altar of Heroes',
            subtext: 'Summon & Recruits',
            icon: Sparkles,
            color: 'text-amber-300',
            bg: 'bg-amber-950/60 border-amber-500/50 ring-1 ring-amber-500/30',
            action: () => handleOpenFeature('RECRUITMENT'),
          },
          {
            id: 'EXPEDITION',
            label: 'Expeditions',
            subtext: 'Patrol & Materials',
            icon: Compass,
            color: 'text-cyan-400',
            bg: 'bg-cyan-950/50 border-cyan-500/40 ring-1 ring-cyan-500/20',
            action: () => handleOpenFeature('EXPEDITION'),
          },
        ]
      : []),
    ...(isTowerV2Enabled
      ? [
          {
            id: 'TOWER',
            label: 'Progress Tower',
            subtext: '3v3 Auto-Turn Battle',
            icon: Castle,
            color: 'text-amber-400',
            bg: 'bg-amber-950/50 border-amber-500/40 ring-1 ring-amber-500/20',
            action: () => handleOpenFeature('TOWER'),
          },
        ]
      : []),
    {
      id: 'CHEST_VAULT',
      label: 'Chest Vault',
      subtext: totalChests > 0 ? `${totalChests} chests ready` : '0 chests',
      icon: Package,
      color: 'text-amber-400',
      bg: 'bg-amber-950/40 border-amber-900/50',
      action: () => handleOpenFeature('CHEST_VAULT'),
    },
    {
      id: 'QUESTS',
      label: 'Quests',
      subtext: 'Daily & Milestones',
      icon: Swords,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-900/50',
      action: () => handleOpenFeature('QUESTS'),
    },
    {
      id: 'TRIAL_ARENA',
      label: 'Trial Arena',
      subtext: 'Ranked Boss Rush',
      icon: Trophy,
      color: 'text-purple-400',
      bg: 'bg-purple-950/40 border-purple-900/50',
      action: () => handleOpenFeature('TRIAL_ARENA'),
    },
    {
      id: 'AWAKENING_PASS',
      label: 'Awakening Pass',
      subtext: '7-Day Rewards',
      icon: CalendarCheck,
      color: 'text-sky-400',
      bg: 'bg-sky-950/40 border-sky-900/50',
      action: () => handleOpenFeature('AWAKENING_PASS'),
    },
    {
      id: 'PIGGY_BANK',
      label: 'Piggy Bank',
      subtext: 'Gem Vault',
      icon: PiggyBank,
      color: 'text-pink-400',
      bg: 'bg-pink-950/40 border-pink-900/50',
      action: () => handleOpenFeature('PIGGY_BANK'),
    },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Features & Events">
      <div className="grid grid-cols-2 gap-2.5 py-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-[background-color,filter,transform] active:scale-[0.98] ${item.bg} hover:brightness-110 min-h-[56px] cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400`}
            >
              <div className={`p-2 rounded-md bg-slate-900/80 border border-slate-800 ${item.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="truncate min-w-0">
                <h4 className="text-xs font-semibold text-slate-100 truncate">{item.label}</h4>
                <p className="text-[11px] text-slate-400 truncate">{item.subtext}</p>
              </div>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
};
