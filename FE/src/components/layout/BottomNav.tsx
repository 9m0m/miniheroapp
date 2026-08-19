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
      className="bg-slate-900/95 border-t border-slate-800 py-1 px-2 flex justify-around items-center z-20 select-none shadow-lg backdrop-blur-md pb-[max(0.25rem,env(safe-area-inset-bottom))]"
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
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl min-h-[44px] min-w-[60px] transition-[color,background-color,transform] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
              isActive
                ? 'text-amber-400 bg-amber-400/10 font-bold shadow-sm'
                : isLocked
                ? 'text-slate-600 opacity-40 cursor-not-allowed'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            <Icon
              size={18}
              className={isActive ? 'text-amber-400' : isLocked ? 'text-slate-600' : 'text-slate-400'}
              aria-hidden="true"
            />
            <span className="text-xs">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
