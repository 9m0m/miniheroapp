'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Coins, Gem, Hammer, ShieldAlert, Crown, TrendingUp, Map, ScrollText, Swords, Award, Trophy } from 'lucide-react';

const WORLD_NAMES: Record<number, string> = {
  1: 'Emerald Forest',
  2: 'Frozen Citadel',
  3: 'Volcanic Caldera',
  4: 'Void Abyss',
};

const WORLD_ICONS: Record<number, string> = {
  1: '🌲',
  2: '❄️',
  3: '🔥',
  4: '🪐',
};

export default function TopHUD() {
  const {
    gold,
    gems,
    enhanceStones,
    worldIndex,
    stageIndex,
    currentWave,
    isAutoRepeat,
    piggyBankGems,
    openModal,
  } = useGameStore();

  const isBossWave = currentWave === 31;
  const waveProgressPercent = Math.min(100, Math.round((currentWave / 31) * 100));

  return (
    <header className="bg-game-card border-b border-game-border px-3 py-2 flex flex-col gap-2 z-20 select-none shadow-md">
      {/* 1. Currencies Row */}
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-1.5 bg-game-dark/90 px-2.5 py-1 rounded-full border border-yellow-500/30 text-yellow-400 font-mono shadow-inner">
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <span>{gold.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-game-dark/90 px-2.5 py-1 rounded-full border border-cyan-500/30 text-cyan-400 font-mono shadow-inner">
          <Gem className="w-3.5 h-3.5 text-cyan-400" />
          <span>{gems}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-game-dark/90 px-2.5 py-1 rounded-full border border-purple-500/30 text-purple-400 font-mono shadow-inner">
          <Hammer className="w-3.5 h-3.5 text-purple-400" />
          <span>{enhanceStones}</span>
        </div>

        {/* Piggy Bank Quick Button */}
        <button
          onClick={() => openModal('PIGGY_BANK')}
          className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm hover:brightness-110 active:scale-95 transition"
        >
          <span>🐷</span>
          <span className="font-mono">{piggyBankGems}</span>
        </button>
      </div>

      {/* 2. Stage Info & Quick Actions Bar */}
      <div className="flex items-center justify-between text-xs">
        {/* Stage Name & World Map Modal Button */}
        <button
          onClick={() => openModal('WORLD_MAP')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-100 font-bold text-xs hover:border-cyan-400/60 transition group"
          title="View 4 Worlds Map"
        >
          <span>{WORLD_ICONS[worldIndex] || '🌲'}</span>
          <span className="text-cyan-300 group-hover:text-cyan-200">
            Stage {worldIndex}-{stageIndex}
          </span>
          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
            ({WORLD_NAMES[worldIndex]})
          </span>
        </button>

        {/* Feature Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openModal('QUESTS')}
            className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-bold hover:bg-amber-500/25 transition active:scale-95 shadow-sm"
            title="Daily & Weekly Quests"
          >
            <Award size={12} className="text-amber-400" />
            <span>Quests</span>
          </button>

          <button
            onClick={() => openModal('TRIAL_ARENA')}
            className="flex items-center gap-1 bg-rose-500/15 border border-rose-500/40 text-rose-300 px-2 py-0.5 rounded-lg text-[10px] font-bold hover:bg-rose-500/25 transition active:scale-95 shadow-sm"
            title="Weekly Trial Arena & Leaderboard"
          >
            <Trophy size={12} className="text-rose-400" />
            <span>Arena</span>
          </button>

          <button
            onClick={() => openModal('BATTLE_LOGS')}
            className="flex items-center gap-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-lg text-[10px] font-bold hover:bg-cyan-500/25 transition active:scale-95"
            title="Expedition & Battle Logs"
          >
            <ScrollText size={12} className="text-cyan-400" />
            <span>Logs</span>
          </button>

          <button
            onClick={() => openModal('AWAKENING_PASS')}
            className="flex items-center gap-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-lg text-[10px] font-bold hover:bg-purple-500/25 transition active:scale-95"
          >
            <Crown size={12} className="text-amber-400" />
            <span>Pass</span>
          </button>

          <button
            onClick={() => openModal('GROWTH_FUND')}
            className="flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded-lg text-[10px] font-bold hover:bg-blue-500/25 transition active:scale-95"
          >
            <TrendingUp size={12} className="text-cyan-400" />
            <span>Fund</span>
          </button>

          {isAutoRepeat && (
            <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
              <ShieldAlert className="w-3 h-3" />
              <span>Auto</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Sleek Integrated Wave Progression Track */}
      <div className="flex flex-col gap-1 pt-0.5">
        <div className="flex items-center justify-between text-[10px] font-mono px-0.5">
          <span className="text-slate-400 font-sans font-semibold flex items-center gap-1">
            <Swords className="w-3 h-3 text-cyan-400" />
            <span>Wave Progression</span>
          </span>

          {isBossWave ? (
            <span className="text-red-400 font-bold flex items-center gap-1 animate-pulse">
              <span>👑 STAGE BOSS (WAVE 31)</span>
            </span>
          ) : (
            <span className="text-slate-300 font-bold">
              Wave <strong className="text-cyan-300">{currentWave}</strong>/30 ({waveProgressPercent}%)
            </span>
          )}
        </div>

        {/* Multi-segment Milestone Progress Bar */}
        <div className="relative w-full bg-slate-900/90 h-2.5 rounded-full overflow-hidden border border-slate-700/80 p-[1px] shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isBossWave
                ? 'bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 shadow-lg shadow-red-500/50 animate-pulse'
                : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400'
            }`}
            style={{ width: `${waveProgressPercent}%` }}
          />

          {/* Milestone markers at Wave 10, Wave 20, Wave 30, Wave 31 Boss */}
          <div className="absolute inset-0 flex justify-between px-1 pointer-events-none items-center text-[7px] text-slate-500 font-mono">
            <span className="opacity-0">1</span>
            <span className="opacity-60">| 10</span>
            <span className="opacity-60">| 20</span>
            <span className="opacity-60">| 30</span>
            <span className="text-[9px] text-amber-400 leading-none">👑 31</span>
          </div>
        </div>
      </div>
    </header>
  );
}
