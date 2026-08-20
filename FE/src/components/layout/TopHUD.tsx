'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
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
        className="w-full bg-gradient-to-b from-[#131926] to-[#0d121c] border-b border-[#222d3d] px-3 py-2 flex flex-col gap-1.5 z-30 select-none shadow-[0_4px_16px_rgba(0,0,0,0.6)] shrink-0"
      >
        {/* Main Currency Bar & Menu Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0" aria-label="Player currencies">
            {/* Gold Capsule */}
            <div
              className="flex items-center gap-1.5 bg-[#080b12] px-2.5 py-1 rounded-md border border-amber-500/40 text-amber-300 text-xs font-bold min-h-[36px] shadow-inner"
              title={`Gold: ${gold.toLocaleString()}`}
            >
              <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
                <Coins size={11} className="text-amber-400" aria-hidden="true" />
              </div>
              <span className="font-mono tabular-nums text-[11px] tracking-tight">{gold.toLocaleString()}</span>
            </div>

            {/* Gems Capsule */}
            <div
              className="flex items-center gap-1.5 bg-[#080b12] px-2.5 py-1 rounded-md border border-cyan-500/40 text-cyan-300 text-xs font-bold min-h-[36px] shadow-inner"
              title={`Gems: ${gems.toLocaleString()}`}
            >
              <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shrink-0">
                <Gem size={11} className="text-cyan-400" aria-hidden="true" />
              </div>
              <span className="font-mono tabular-nums text-[11px] tracking-tight">{gems.toLocaleString()}</span>
            </div>

            {/* Enhance Stones Capsule */}
            <div
              className="flex items-center gap-1.5 bg-[#080b12] px-2.5 py-1 rounded-md border border-purple-500/40 text-purple-300 text-xs font-bold min-h-[36px] shadow-inner"
              title={`Enhance Stones: ${enhanceStones.toLocaleString()}`}
            >
              <div className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-400/50 flex items-center justify-center shrink-0">
                <Sparkles size={11} className="text-purple-400" aria-hidden="true" />
              </div>
              <span className="font-mono tabular-nums text-[11px] tracking-tight">{enhanceStones.toLocaleString()}</span>
            </div>
          </div>

          {/* Feature Menu Trigger (Opens overlay BottomSheet) */}
          <button
            type="button"
            onClick={() => setShowMenu(true)}
            aria-label="Open feature menu"
            aria-haspopup="dialog"
            aria-expanded={showMenu}
            className="p-2 rounded-md btn-game-dark text-slate-300 hover:text-slate-100 flex items-center justify-center min-w-[40px] min-h-[40px] cursor-pointer shrink-0 active:scale-95"
          >
            <Menu size={17} />
          </button>
        </div>
      </header>

      {/* Feature Menu Overlay Bottom Sheet */}
      <FeatureMenuSheet isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </>
  );
};

export default TopHUD;
