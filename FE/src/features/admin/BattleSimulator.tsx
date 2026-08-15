'use client';

import React, { useState } from 'react';
import {
  Activity,
  Play,
  RotateCcw,
  Zap,
  Shield,
  Heart,
  Crosshair,
  TrendingUp,
  Award,
  AlertTriangle,
  Clock,
  Swords,
  Flame,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { BattleSimulationRequest, BattleSimulationResult } from '@/types/game.types';

export default function BattleSimulator() {
  const [params, setParams] = useState<BattleSimulationRequest>({
    worldIndex: 1,
    stageIndex: 1,
    waveNumber: 5,
    heroTotalAtk: 120,
    heroTotalHp: 850,
    heroTotalArmor: 160,
    heroAtkSpeed: 1.2,
    heroCritRate: 15.0,
    heroCritDmg: 180.0,
    simulationRounds: 100,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<BattleSimulationResult | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await adminApi.simulateBattle(params);
      setResult(res);
    } catch (err: any) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPreset = (presetType: 'EARLY' | 'MID' | 'ENDGAME') => {
    if (presetType === 'EARLY') {
      setParams({
        worldIndex: 1,
        stageIndex: 1,
        waveNumber: 5,
        heroTotalAtk: 80,
        heroTotalHp: 600,
        heroTotalArmor: 100,
        heroAtkSpeed: 1.0,
        heroCritRate: 10.0,
        heroCritDmg: 150.0,
        simulationRounds: 100,
      });
    } else if (presetType === 'MID') {
      setParams({
        worldIndex: 2,
        stageIndex: 5,
        waveNumber: 15,
        heroTotalAtk: 350,
        heroTotalHp: 2200,
        heroTotalArmor: 380,
        heroAtkSpeed: 1.35,
        heroCritRate: 25.0,
        heroCritDmg: 220.0,
        simulationRounds: 100,
      });
    } else if (presetType === 'ENDGAME') {
      setParams({
        worldIndex: 4,
        stageIndex: 10,
        waveNumber: 30,
        heroTotalAtk: 1200,
        heroTotalHp: 8500,
        heroTotalArmor: 950,
        heroAtkSpeed: 1.6,
        heroCritRate: 45.0,
        heroCritDmg: 300.0,
        simulationRounds: 100,
      });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black tracking-wide text-white">LIVE BATTLE MATH SIMULATOR</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate 100 Monte Carlo battle rounds between heroes and monsters to analyze game balance.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Presets:</span>
          <button
            onClick={() => handleLoadPreset('EARLY')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-300 transition-all"
          >
            Starter (W1)
          </button>
          <button
            onClick={() => handleLoadPreset('MID')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-cyan-300 transition-all"
          >
            Midgame (W2)
          </button>
          <button
            onClick={() => handleLoadPreset('ENDGAME')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-purple-300 transition-all"
          >
            Endgame (W4 Boss)
          </button>
        </div>
      </div>

      {/* Simulator Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Parameter Form (1 col) */}
        <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-blue-400" />
            <span>Combat Simulation Setup</span>
          </h3>

          {/* Stage Target Selector */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">World (1-4)</label>
              <input
                type="number"
                min="1"
                max="4"
                value={params.worldIndex}
                onChange={(e) => setParams({ ...params, worldIndex: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Stage (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={params.stageIndex}
                onChange={(e) => setParams({ ...params, stageIndex: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Wave (1-30)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={params.waveNumber}
                onChange={(e) => setParams({ ...params, waveNumber: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Hero Stats */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h4 className="text-[11px] font-bold text-slate-300">Party Combined Attributes:</h4>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Total ATK</label>
                <input
                  type="number"
                  value={params.heroTotalAtk}
                  onChange={(e) => setParams({ ...params, heroTotalAtk: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Total Max HP</label>
                <input
                  type="number"
                  value={params.heroTotalHp}
                  onChange={(e) => setParams({ ...params, heroTotalHp: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Total Armor</label>
                <input
                  type="number"
                  value={params.heroTotalArmor}
                  onChange={(e) => setParams({ ...params, heroTotalArmor: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Attack Speed (Hits/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={params.heroAtkSpeed}
                  onChange={(e) => setParams({ ...params, heroAtkSpeed: parseFloat(e.target.value) || 1.0 })}
                  className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Crit Rate (%)</label>
                <input
                  type="number"
                  value={params.heroCritRate}
                  onChange={(e) => setParams({ ...params, heroCritRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Crit DMG (%)</label>
                <input
                  type="number"
                  value={params.heroCritDmg}
                  onChange={(e) => setParams({ ...params, heroCritDmg: parseFloat(e.target.value) || 150 })}
                  className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Simulation Rounds */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Simulation Rounds</label>
            <select
              value={params.simulationRounds}
              onChange={(e) => setParams({ ...params, simulationRounds: parseInt(e.target.value) })}
              className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
            >
              <option value="50">50 Rounds</option>
              <option value="100">100 Rounds (Recommended)</option>
              <option value="200">200 Rounds (High Precision)</option>
            </select>
          </div>

          {/* Run Button */}
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>RUN COMBAT SIMULATION</span>
          </button>
        </div>

        {/* Right Column: Simulation Analytics & Metrics (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {result ? (
            <div className="flex flex-col gap-4">
              {/* Top Result KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Win Rate */}
                <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Win Rate</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    {result.winRatePercent}%
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{result.wins}W / {result.losses}L</span>
                </div>

                {/* Avg TTK */}
                <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time to Kill (TTK)</span>
                  <div className="text-2xl font-black text-blue-400 font-mono mt-1">
                    {result.avgTimeToKillSec}s
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Average duration</span>
                </div>

                {/* Avg Hero DPS */}
                <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hero Live DPS</span>
                  <div className="text-2xl font-black text-purple-400 font-mono mt-1">
                    {result.avgHeroDps.toFixed(0)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Damage / second</span>
                </div>

                {/* Monster Pool */}
                <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Mob HP</span>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {result.monsterTotalHp.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{result.monsterCount}x {result.monsterName}</span>
                </div>
              </div>

              {/* Balance Assessment Box */}
              <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    Balance Assessment (AI Engine)
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs font-semibold text-slate-100 font-mono">
                  {result.balanceAssessment}
                </div>
              </div>

              {/* Combat Log Highlights */}
              <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Combat Log Highlights (Sample Rounds)</span>
                </h4>
                <div className="space-y-2">
                  {result.battleLogHighlights?.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#161C28] border border-slate-700/60 font-mono text-[11px] text-slate-300"
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-12 shadow-lg flex flex-col items-center justify-center text-center text-slate-400 min-h-[350px]">
              <Activity className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-200">No Simulation Data</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Configure the party and stage parameters on the left and click <strong>&quot;Run Combat Simulation&quot;</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
