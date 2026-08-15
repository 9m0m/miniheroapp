'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Box, Sparkles, Gem, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ItemRarity } from '@/types/game.types';

export default function CubeManager() {
  const { inventory, templates, gold, gems, addGold } = useGameStore();
  const [activeCubeMode, setActiveCubeMode] = useState<'FUSION' | 'GEMS' | 'REFORGE'>('FUSION');

  return (
    <div className="flex flex-col gap-3 p-3 text-xs overflow-y-auto flex-1 pb-16">
      {/* 1. Mode Selector */}
      <div className="grid grid-cols-3 gap-1.5 bg-game-dark p-1 rounded-lg border border-game-border">
        <button
          onClick={() => setActiveCubeMode('FUSION')}
          className={`py-1.5 rounded-md font-bold transition-all flex items-center justify-center gap-1 ${
            activeCubeMode === 'FUSION'
              ? 'bg-yellow-500 text-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Ghép Đồ</span>
        </button>

        <button
          onClick={() => setActiveCubeMode('GEMS')}
          className={`py-1.5 rounded-md font-bold transition-all flex items-center justify-center gap-1 ${
            activeCubeMode === 'GEMS'
              ? 'bg-cyan-500 text-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gem className="w-3.5 h-3.5" />
          <span>Ghép Ngọc</span>
        </button>

        <button
          onClick={() => setActiveCubeMode('REFORGE')}
          className={`py-1.5 rounded-md font-bold transition-all flex items-center justify-center gap-1 ${
            activeCubeMode === 'REFORGE'
              ? 'bg-purple-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tẩy Dòng</span>
        </button>
      </div>

      {/* 2. The Cube Core Vessel */}
      <div className="bg-game-card p-4 rounded-xl border border-game-border flex flex-col items-center justify-center gap-3 relative shadow-inner">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-3xl shadow-lg border border-cyan-400/50 animate-pulse">
          🎲
        </div>

        <div className="text-center">
          <h3 className="font-bold text-sm text-slate-100">
            {activeCubeMode === 'FUSION' && 'Smart Fusion (Ghép 3 Đồ Cùng Phẩm)'}
            {activeCubeMode === 'GEMS' && 'Gem Fusion (Ghép 3 Ngọc Lên Cấp)'}
            {activeCubeMode === 'REFORGE' && 'Sub-stat Reforge (Khóa Dòng & Tẩy Lại)'}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {activeCubeMode === 'FUSION' && '100% ra phẩm cấp cao hơn, không bị lệch món.'}
            {activeCubeMode === 'GEMS' && '3 Ngọc Tier N ➔ 1 Ngọc Tier N+1.'}
            {activeCubeMode === 'REFORGE' && 'Khóa 1 dòng chỉ số vàng và reroll các dòng còn lại.'}
          </p>
        </div>

        {/* 3 Input Slots */}
        <div className="flex items-center gap-3 mt-1">
          <div className="w-12 h-12 rounded-lg border-2 border-dashed border-yellow-500/40 bg-game-dark/80 flex items-center justify-center text-slate-500 text-lg">
            +
          </div>
          <div className="w-12 h-12 rounded-lg border-2 border-dashed border-yellow-500/40 bg-game-dark/80 flex items-center justify-center text-slate-500 text-lg">
            +
          </div>
          <div className="w-12 h-12 rounded-lg border-2 border-dashed border-yellow-500/40 bg-game-dark/80 flex items-center justify-center text-slate-500 text-lg">
            +
          </div>
        </div>

        <button className="w-full mt-2 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold rounded-lg shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all">
          <Sparkles className="w-4 h-4" />
          <span>Kích Hoạt The Cube (Chi Phí: 200 Gold)</span>
        </button>
      </div>

      {/* 3. Bag Items Selection */}
      <div className="bg-game-card p-3 rounded-lg border border-game-border flex flex-col gap-2">
        <h4 className="font-bold text-slate-300 text-xs">Vật Phẩm Trong Túi Đồ ({inventory.length})</h4>
        {inventory.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic py-2 text-center">Túi đồ đang trống. Cày quái để nhận thêm đồ!</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {inventory.map((item) => {
              const tmpl = templates[item.templateId];
              return (
                <div
                  key={item.id}
                  className="bg-game-dark p-1.5 rounded border border-purple-500/40 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-all"
                >
                  <span className="text-xl">{tmpl?.icon || '📦'}</span>
                  <span className="text-[9px] text-slate-300 font-semibold truncate w-full text-center mt-1">
                    {tmpl?.name}
                  </span>
                  <span className="text-[8px] text-purple-400 font-mono">
                    {item.rarity}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
