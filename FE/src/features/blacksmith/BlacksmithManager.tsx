'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Anvil, Hammer, Sparkles, Coins } from 'lucide-react';
import { BlacksmithCraftTab } from './components/BlacksmithCraftTab';
import { BlacksmithEnhanceTab } from './components/BlacksmithEnhanceTab';

export default function BlacksmithManager() {
  const gold = useGameStore((state) => state.gold);
  const enhanceStones = useGameStore((state) => state.enhanceStones);
  const [activeTab, setActiveTab] = useState<'CRAFT' | 'ENHANCE'>('CRAFT');

  return (
    <div className="flex flex-col gap-2.5 p-3 text-xs overflow-y-auto flex-1 pb-16 max-w-lg mx-auto select-none bg-[#06080e]">
      {/* 1. Sub-Tab Switcher */}
      <div className="grid grid-cols-2 gap-1.5 bg-[#0a0e17] p-1 rounded-lg border border-[#1e293b] shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('CRAFT')}
          className={`py-2 px-3 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px] ${
            activeTab === 'CRAFT'
              ? 'btn-game-amber shadow-sm font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Anvil size={14} aria-hidden="true" />
          <span>Forge Crafting</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ENHANCE')}
          className={`py-2 px-3 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px] ${
            activeTab === 'ENHANCE'
              ? 'btn-game-amber shadow-sm font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hammer size={14} aria-hidden="true" />
          <span>Equipment Enhance (+15)</span>
        </button>
      </div>

      {/* 2. Resources Summary Ribbon */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0e131d] border border-[#1e293b] rounded-lg text-[11px]">
        <div className="flex items-center gap-1.5">
          <Coins size={13} className="text-amber-400" />
          <span className="text-slate-400">Gold:</span>
          <span className="font-bold text-amber-300 font-mono tabular-nums">{gold.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-purple-400" />
          <span className="text-slate-400">Enhance Stones:</span>
          <span className="font-bold text-cyan-300 font-mono tabular-nums">{enhanceStones}</span>
        </div>
      </div>

      {/* ─── TAB A: FORGE CRAFTING ─────────────────────────────────────────── */}
      {activeTab === 'CRAFT' && <BlacksmithCraftTab />}

      {/* ─── TAB B: EQUIPMENT ENHANCE (+15) ────────────────────────────────── */}
      {activeTab === 'ENHANCE' && <BlacksmithEnhanceTab />}
    </div>
  );
}
