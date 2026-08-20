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
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap border cursor-pointer ${
              isActive
                ? 'btn-game-amber shadow-sm'
                : isUnlocked
                ? 'bg-[#0e131d] text-slate-300 border-[#1e293b] hover:text-slate-100'
                : 'bg-[#0a0e17] text-slate-500 border-dashed border-[#1e293b] opacity-60 hover:opacity-90'
            }`}
          >
            {!isUnlocked && <Lock size={11} className="text-amber-400/80" />}
            <span>Tab {tab}</span>
            {isUnlocked && (
              <span className={`text-[10px] font-mono ${isActive ? 'text-slate-950 font-black' : 'text-slate-400'}`}>
                ({count}/72)
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StashTabSelector;
