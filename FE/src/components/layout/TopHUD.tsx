'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Coins, Gem, Hammer, Trophy, ShieldAlert } from 'lucide-react';

export default function TopHUD() {
  const { gold, gems, enhanceStones, worldIndex, stageIndex, currentWave, isAutoRepeat } = useGameStore();

  const waveProgressPercent = Math.min(100, Math.round((currentWave / 30) * 100));

  return (
    <header className="bg-game-card border-b border-game-border p-3 flex flex-col gap-2 z-20 select-none shadow-md">
      {/* 1. Currencies Row */}
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-1.5 bg-game-dark/80 px-2.5 py-1 rounded-full border border-yellow-500/30 text-yellow-400">
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <span>{gold.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-game-dark/80 px-2.5 py-1 rounded-full border border-cyan-500/30 text-cyan-400">
          <Gem className="w-3.5 h-3.5 text-cyan-400" />
          <span>{gems}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-game-dark/80 px-2.5 py-1 rounded-full border border-purple-500/30 text-purple-400">
          <Hammer className="w-3.5 h-3.5 text-purple-400" />
          <span>{enhanceStones}</span>
        </div>

        <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
          <Trophy className="w-3 h-3" />
          <span>S1 (18d)</span>
        </div>
      </div>

      {/* 2. Stage Info & Wave Progress Bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100">
              Ải {worldIndex}-{stageIndex}
            </span>
            {currentWave === 30 ? (
              <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                STAGE BOSS
              </span>
            ) : (
              <span className="text-slate-400 text-xs">
                Wave {currentWave}/30
              </span>
            )}
          </div>

          {isAutoRepeat && (
            <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
              <ShieldAlert className="w-3 h-3" />
              <span>Auto Farm</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-game-dark h-2 rounded-full overflow-hidden border border-game-border/80">
          <div
            className={`h-full transition-all duration-300 ${
              currentWave === 30
                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
            }`}
            style={{ width: `${waveProgressPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
}
