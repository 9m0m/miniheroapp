import React from 'react';
import { Stats } from '../../../types/stats.types';
import { Sword, Sparkles, Shield, Heart, Crosshair, TrendingUp } from 'lucide-react';

interface CombatStatsMatrixProps {
  stats: Stats;
}

export const CombatStatsMatrix: React.FC<CombatStatsMatrixProps> = ({ stats }) => {
  return (
    <div className="bg-[#0e131d] border border-[#1e293b] rounded-lg p-3 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-[#1e293b]">
        <span className="text-xs font-bold text-slate-200">Combat Attributes Matrix</span>
        <span className="text-[10px] text-slate-400 font-mono">Live Gear Evaluator</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
        <div className="flex justify-between items-center bg-[#080b12] p-2 rounded border border-[#1e293b]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sword size={12} className="text-rose-400" /> Phys ATK:
          </span>
          <span className="text-rose-400 font-black tabular-nums">{stats.physAtk.toFixed(0)}</span>
        </div>

        <div className="flex justify-between items-center bg-[#080b12] p-2 rounded border border-[#1e293b]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sparkles size={12} className="text-purple-400" /> Magic ATK:
          </span>
          <span className="text-purple-400 font-black tabular-nums">{stats.magicAtk.toFixed(0)}</span>
        </div>

        <div className="flex justify-between items-center bg-[#080b12] p-2 rounded border border-[#1e293b]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Shield size={12} className="text-blue-400" /> Armor:
          </span>
          <span className="text-blue-400 font-black tabular-nums">{stats.armor.toFixed(0)}</span>
        </div>

        <div className="flex justify-between items-center bg-[#080b12] p-2 rounded border border-[#1e293b]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Heart size={12} className="text-emerald-400" /> Max HP:
          </span>
          <span className="text-emerald-400 font-black tabular-nums">{stats.maxHp.toFixed(0)}</span>
        </div>

        <div className="flex justify-between items-center bg-[#080b12] p-2 rounded border border-[#1e293b]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Crosshair size={12} className="text-yellow-400" /> Crit Rate:
          </span>
          <span className="text-yellow-400 font-black tabular-nums">{stats.critRate.toFixed(1)}%</span>
        </div>

        <div className="flex justify-between items-center bg-[#080b12] p-2 rounded border border-[#1e293b]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-amber-400" /> Crit DMG:
          </span>
          <span className="text-amber-400 font-black tabular-nums">{stats.critDmg.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default CombatStatsMatrix;
