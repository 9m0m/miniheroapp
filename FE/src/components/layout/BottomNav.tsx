'use client';

import React, { useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  TabType,
  resolveNavigationConfig,
  normalizeTab,
} from '@/config/navigationConfig';

export type { TabType };

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const featureFlags = useGameStore((s) => s.featureFlags);
  const onboardingState = useGameStore((s) => s.onboardingState);

  const navMatrix = resolveNavigationConfig(featureFlags);
  const isTutorialActive = Boolean(onboardingState?.step && onboardingState.step !== 'COMPLETE');
  const tabs = navMatrix.availableTabs;
  const canonicalTown = navMatrix.canonicalTownTab;

  const handleTabClick = (tabId: TabType) => {
    if (isTutorialActive && tabId !== canonicalTown) {
      return;
    }
    onSelectTab(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (isTutorialActive) return;
    let targetIndex = index;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = tabs.length - 1;
    } else {
      return;
    }

    const nextTab = tabs[targetIndex];
    if (nextTab) {
      onSelectTab(nextTab.id);
      tabRefs.current[targetIndex]?.focus();
    }
  };

  const normalizedActive = normalizeTab(activeTab, navMatrix);

  return (
    <nav
      role="tablist"
      aria-label="Main game views"
      className="bg-gradient-to-b from-[#131926] to-[#0a0e17] border-t border-[#222d3d] py-1 px-2 flex justify-around items-center z-20 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.7)] pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;
        const isActive = normalizedActive === tab.id;
        const isLocked = isTutorialActive && tab.id !== canonicalTown;

        return (
          <button
            type="button"
            key={tab.id}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            role="tab"
            id={`tab-${tab.id.toLowerCase()}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id.toLowerCase()}`}
            aria-disabled={isLocked}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-md min-h-[44px] min-w-[64px] transition-[color,background,transform] duration-150 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              isActive
                ? 'text-amber-400 bg-amber-500/10 font-bold shadow-inner'
                : isLocked
                ? 'text-slate-600 opacity-40 cursor-not-allowed'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            {/* Active Top Glow Pip */}
            {isActive && (
              <span className="absolute -top-1 w-6 h-[2px] bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" aria-hidden="true" />
            )}
            <Icon
              size={18}
              className={isActive ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]' : isLocked ? 'text-slate-600' : 'text-slate-400'}
              aria-hidden="true"
            />
            <span className="text-[10px] tracking-wider uppercase font-semibold">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
