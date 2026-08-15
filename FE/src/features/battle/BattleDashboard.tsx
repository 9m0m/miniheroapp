'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Swords, Zap, Map, ScrollText, Shield, Flame, Sparkles, Activity } from 'lucide-react';
import { HeroClass } from '@/types/game.types';

export default function BattleDashboard() {
  const {
    heroes,
    worldIndex,
    stageIndex,
    currentWave,
    combatSpeed,
    setCombatSpeed,
    openWorldMapModal,
    openBattleLogModal,
  } = useGameStore();

  const heroList = [
    { key: 'WARRIOR' as HeroClass, label: 'Arthur (Warrior)', color: 'from-blue-500 to-blue-700', textCol: 'text-blue-400', icon: '🛡️' },
    { key: 'RANGER' as HeroClass, label: 'Robin (Ranger)', color: 'from-emerald-500 to-emerald-700', textCol: 'text-emerald-400', icon: '🏹' },
    { key: 'MAGE' as HeroClass, label: 'Merlin (Mage)', color: 'from-purple-500 to-purple-700', textCol: 'text-purple-400', icon: '🔮' },
    { key: 'PRIEST' as HeroClass, label: 'Elena (Priest)', color: 'from-amber-500 to-amber-700', textCol: 'text-amber-400', icon: '✨' },
  ];

  // Calculate live DPS distribution
  const totalDps = heroList.reduce((acc, h) => acc + (heroes[h.key]?.liveDps || 30), 0);

  return (
    <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto bg-slate-950 text-white text-xs">
      {/* 1. Stage Progress Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">Current Expedition</span>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>World {worldIndex} - Stage {stageIndex}</span>
              {currentWave === 30 ? (
                <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                  STAGE BOSS 👑
                </span>
              ) : (
                <span className="text-yellow-400 text-xs font-mono font-bold">Wave {currentWave}/30</span>
              )}
            </h3>
          </div>

          {/* Speed Toggle Controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCombatSpeed(1)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                combatSpeed === 1
                  ? 'bg-cyan-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setCombatSpeed(2)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 ${
                combatSpeed === 2
                  ? 'bg-amber-500 text-white shadow animate-pulse'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap size={10} />
              <span>2x Turbo</span>
            </button>
          </div>
        </div>

        {/* Wave Bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              currentWave === 30
                ? 'bg-gradient-to-r from-red-500 to-amber-500 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${(currentWave / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* 2. Live DPS Meter */}
      <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
            <Activity size={14} className="text-cyan-400" />
            <span>Party Combat DPS Meter</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Total: <strong className="text-yellow-400">{Math.round(totalDps).toLocaleString()} DPS</strong>
          </span>
        </div>

        <div className="space-y-2">
          {heroList.map((h) => {
            const hero = heroes[h.key];
            const dps = hero?.liveDps || 30;
            const percent = Math.min(100, Math.round((dps / (totalDps || 1)) * 100));

            return (
              <div key={h.key} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1">
                    <span>{h.icon}</span>
                    <span className="font-semibold">{h.label}</span>
                  </span>
                  <span className="font-mono text-slate-300">
                    <strong className={h.textCol}>{Math.round(dps)}</strong> ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className={`h-full bg-gradient-to-r ${h.color} transition-all duration-300`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Quick Battle Action Shortcuts */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={openWorldMapModal}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold text-[11px] transition active:scale-95 shadow"
        >
          <Map size={13} className="text-cyan-400" />
          <span>World Map</span>
        </button>

        <button
          onClick={openBattleLogModal}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold text-[11px] transition active:scale-95 shadow"
        >
          <ScrollText size={13} className="text-amber-400" />
          <span>Battle Logs</span>
        </button>
      </div>
    </div>
  );
}
