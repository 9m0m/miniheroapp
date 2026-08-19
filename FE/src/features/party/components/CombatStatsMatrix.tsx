import React from 'react';
import { Stats } from '../../../types/stats.types';
import { Sword, Sparkles, Shield, Heart, Crosshair, TrendingUp } from 'lucide-react';

interface CombatStatsMatrixProps {
  stats: Stats;
}

export const CombatStatsMatrix: React.FC<CombatStatsMatrixProps> = ({ stats }) => {
  return (
    <div className="bg-game-card/90 border border-game-border rounded-2xl p-3 shadow-md flex flex-col gap-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-game-border/60">
        <span className="text-xs font-bold text-slate-200">Combat Attributes</span>
        <span className="text-xs text-slate-400">Evaluated Live</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between bg-game-dark/80 p-2 rounded-xl border border-game-border/60">
          <span className="text-slate-400 flex items-center gap-1">
            <Sword size={12} className="text-rose-400" /> Phys ATK:
          </span>
          <span className="text-rose-400 font-bold">{stats.physAtk.toFixed(0)}</span>
        </div>

        <div className="flex justify-between bg-game-dark/80 p-2 rounded-xl border border-game-border/60">
          <span className="text-slate-400 flex items-center gap-1">
            <Sparkles size={12} className="text-purple-400" /> Magic ATK:
          </span>
          <span className="text-purple-400 font-bold">{stats.magicAtk.toFixed(0)}</span>
        </div>

        <div className="flex justify-between bg-game-dark/80 p-2 rounded-xl border border-game-border/60">
          <span className="text-slate-400 flex items-center gap-1">
            <Shield size={12} className="text-blue-400" /> Armor:
          </span>
          <span className="text-blue-400 font-bold">{stats.armor.toFixed(0)}</span>
        </div>

        <div className="flex justify-between bg-game-dark/80 p-2 rounded-xl border border-game-border/60">
          <span className="text-slate-400 flex items-center gap-1">
            <Heart size={12} className="text-emerald-400" /> Max HP:
          </span>
          <span className="text-emerald-400 font-bold">{stats.maxHp.toFixed(0)}</span>
        </div>

        <div className="flex justify-between bg-game-dark/80 p-2 rounded-xl border border-game-border/60">
          <span className="text-slate-400 flex items-center gap-1">
            <Crosshair size={12} className="text-yellow-400" /> Crit Rate:
          </span>
          <span className="text-yellow-400 font-bold">{stats.critRate.toFixed(1)}%</span>
        </div>

        <div className="flex justify-between bg-game-dark/80 p-2 rounded-xl border border-game-border/60">
          <span className="text-slate-400 flex items-center gap-1">
            <TrendingUp size={12} className="text-amber-400" /> Crit DMG:
          </span>
          <span className="text-amber-400 font-bold">{stats.critDmg.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};
