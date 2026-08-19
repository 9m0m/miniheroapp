import React from 'react';
import { Lock } from 'lucide-react';

interface StashTabSelectorProps {
  activeTab: number;
  unlockedTabs: number[];
  stashItems: Record<number, any[]>;
  onSelectTab: (tab: number) => void;
  onUnlockTab: (tab: number) => void;
}

export const StashTabSelector: React.FC<StashTabSelectorProps> = ({
  activeTab,
  unlockedTabs,
  stashItems,
  onSelectTab,
  onUnlockTab,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {[1, 2, 3, 4, 5, 6, 7].map((tab) => {
        const isUnlocked = unlockedTabs.includes(tab);
        const isActive = activeTab === tab;
        const count = stashItems[tab]?.length || 0;

        return (
          <button
            type="button"
            key={tab}
            onClick={() => {
              if (isUnlocked) {
                onSelectTab(tab);
              } else {
                onUnlockTab(tab);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap border ${
              isActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                : isUnlocked
                ? 'bg-game-dark/60 text-slate-400 border-game-border/60 hover:text-slate-200'
                : 'bg-game-dark/30 text-slate-500 border-dashed border-game-border/40 opacity-70 hover:opacity-100'
            }`}
          >
            {!isUnlocked && <Lock size={10} className="text-amber-400/80" />}
            <span>Tab {tab}</span>
            {isUnlocked && (
              <span className="text-xs text-slate-400 font-mono">({count}/72)</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
