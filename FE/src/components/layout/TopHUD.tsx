'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Coins, Gem, Sparkles, Menu } from 'lucide-react';
import { FeatureMenuSheet } from './FeatureMenuSheet';

export const TopHUD: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);

  const gold = useGameStore((s) => s.gold);
  const gems = useGameStore((s) => s.gems);
  const enhanceStones = useGameStore((s) => s.enhanceStones);

  return (
    <>
      <header
        role="banner"
        aria-label="Game status header"
        className="w-full bg-slate-900/95 border-b border-slate-800 px-3 py-2 flex flex-col gap-2 z-30 select-none shadow-md backdrop-blur-md shrink-0"
      >
        {/* Main Currency Bar & Menu Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2" aria-label="Player currencies">
            {/* Gold */}
            <div
              className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-300 text-xs font-bold min-h-[38px]"
              title={`Gold: ${gold.toLocaleString()}`}
            >
              <Coins size={14} className="text-amber-400 shrink-0" aria-hidden="true" />
              <span className="font-mono">{gold.toLocaleString()}</span>
            </div>

            {/* Gems */}
            <div
              className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30 text-cyan-300 text-xs font-bold min-h-[38px]"
              title={`Gems: ${gems.toLocaleString()}`}
            >
              <Gem size={14} className="text-cyan-400 shrink-0" aria-hidden="true" />
              <span className="font-mono">{gems.toLocaleString()}</span>
            </div>

            {/* Enhance Stones */}
            <div
              className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-purple-500/30 text-purple-300 text-xs font-bold min-h-[38px]"
              title={`Enhance Stones: ${enhanceStones.toLocaleString()}`}
            >
              <Sparkles size={14} className="text-purple-400 shrink-0" aria-hidden="true" />
              <span className="font-mono">{enhanceStones.toLocaleString()}</span>
            </div>
          </div>

          {/* Feature Menu Trigger (Opens overlay BottomSheet) */}
          <button
            type="button"
            onClick={() => setShowMenu(true)}
            aria-label="Open feature menu"
            aria-haspopup="dialog"
            aria-expanded={showMenu}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Feature Menu Overlay Bottom Sheet */}
      <FeatureMenuSheet isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </>
  );
};

export default TopHUD;
