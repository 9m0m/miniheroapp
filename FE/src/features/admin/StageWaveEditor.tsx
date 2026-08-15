'use client';

import React, { useState, useEffect } from 'react';
import {
  Swords,
  Layers,
  Save,
  RefreshCw,
  Sliders,
  Sparkles,
  Percent,
  Coins,
  Crown,
  ChevronRight,
  Plus,
  Minus,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { MonsterTemplate, StageDetailConfig, StageWaveConfig } from '@/types/game.types';

const WORLDS = [
  { index: 1, name: 'World 1: Emerald Forest', icon: '🌲', theme: 'border-emerald-500/40 text-emerald-400' },
  { index: 2, name: 'World 2: Frozen Citadel', icon: '❄️', theme: 'border-cyan-500/40 text-cyan-400' },
  { index: 3, name: 'World 3: Volcanic Caldera', icon: '🔥', theme: 'border-orange-500/40 text-orange-400' },
  { index: 4, name: 'World 4: Void Abyss', icon: '🪐', theme: 'border-purple-500/40 text-purple-400' },
];

export default function StageWaveEditor() {
  const [selectedWorld, setSelectedWorld] = useState<number>(1);
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [selectedWave, setSelectedWave] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [monsters, setMonsters] = useState<MonsterTemplate[]>([]);
  const [stageConfig, setStageConfig] = useState<StageDetailConfig | null>(null);

  // Custom batch scale input state
  const [customHpScale, setCustomHpScale] = useState<number>(15);
  const [customAtkScale, setCustomAtkScale] = useState<number>(10);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load Monsters list once
  useEffect(() => {
    adminApi.getAllMonsters().then(setMonsters).catch(console.error);
  }, []);

  // Fetch stage config whenever selectedWorld / selectedStage changes
  const fetchStageConfig = async (world: number, stage: number) => {
    setLoading(true);
    try {
      const data = await adminApi.getStageDetailConfig(world, stage);
      setStageConfig(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load stage configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStageConfig(selectedWorld, selectedStage);
  }, [selectedWorld, selectedStage]);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = async () => {
    if (!stageConfig) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateStageDetailConfig(selectedWorld, selectedStage, stageConfig);
      setStageConfig(updated);
      showToast(`Saved World ${selectedWorld} - Stage ${selectedStage} configuration to Database!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save stage configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateCurrentWaveField = <K extends keyof StageWaveConfig>(field: K, value: StageWaveConfig[K]) => {
    if (!stageConfig) return;
    const newWaves = stageConfig.waves.map((w) => {
      if (w.waveNumber === selectedWave) {
        return { ...w, [field]: value };
      }
      return w;
    });
    setStageConfig({ ...stageConfig, waves: newWaves });
  };

  const batchScaleMultipliers = (hpPct: number, atkPct: number) => {
    if (!stageConfig) return;
    const newWaves = stageConfig.waves.map((w) => {
      if (hpPct === 0 && atkPct === 0) {
        return { ...w, hpMultiplier: 1.0, atkMultiplier: 1.0, armorMultiplier: 1.0 };
      }
      return {
        ...w,
        hpMultiplier: Math.max(0.1, Math.round(w.hpMultiplier * (1 + hpPct / 100) * 100) / 100),
        atkMultiplier: Math.max(0.1, Math.round(w.atkMultiplier * (1 + atkPct / 100) * 100) / 100),
      };
    });
    setStageConfig({ ...stageConfig, waves: newWaves });
    if (hpPct === 0 && atkPct === 0) {
      showToast('Reset all 30 Waves multipliers to 1.00x', 'success');
    } else {
      showToast(`Batch scaled 30 Waves: ${hpPct >= 0 ? '+' : ''}${hpPct}% HP & ${atkPct >= 0 ? '+' : ''}${atkPct}% ATK`, 'success');
    }
  };

  const activeWaveConfig = stageConfig?.waves.find((w) => w.waveNumber === selectedWave) || stageConfig?.waves[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-lg border transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 shadow-emerald-950/50'
              : 'bg-red-950/90 border-red-500/50 text-red-300 shadow-red-950/50'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header & World / Stage Selectors */}
      <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-black tracking-wide text-white">STAGE & WAVE MONSTER EDITOR</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure monster count per wave (3-15 mobs/wave), precision decimal multipliers, and exact drop percentages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStageConfig(selectedWorld, selectedStage)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-all"
            title="Reload from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-98"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>SAVE STAGE CONFIG</span>
          </button>
        </div>
      </div>

      {/* World & Stage Selector Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* World Tabs */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {WORLDS.map((w) => {
            const isActive = selectedWorld === w.index;
            return (
              <button
                key={w.index}
                onClick={() => {
                  setSelectedWorld(w.index);
                  setSelectedStage(1);
                  setSelectedWave(1);
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500/80 text-white shadow-lg shadow-blue-950/50'
                    : 'bg-[#0F141E]/60 border-slate-800 hover:bg-[#151C2A] text-slate-400'
                }`}
              >
                <span className="text-xl">{w.icon}</span>
                <div>
                  <div className="text-[11px] font-bold tracking-wide leading-tight">World {w.index}</div>
                  <div className="text-[10px] text-slate-400 truncate">{w.name.split(': ')[1]}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stage Dropdown */}
        <div className="bg-[#0F141E]/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-300">Stage:</span>
          <select
            value={selectedStage}
            onChange={(e) => {
              setSelectedStage(Number(e.target.value));
              setSelectedWave(1);
            }}
            className="flex-1 bg-[#161C28] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((stg) => (
              <option key={stg} value={stg}>
                Stage {stg} {stg === 10 ? '👑 (World Boss)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left Column: Drop Table Matrix & Batch Tool (1 col) */}
        <div className="flex flex-col gap-4">
          {/* Drop Table Tuning */}
          <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Drop Table (Stage {selectedWorld}-{selectedStage})
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Precision: 0.01%</span>
            </div>

            {stageConfig?.dropTable && (
              <div className="space-y-4 pt-1">
                {/* 1. Normal Wave Chest Chance */}
                <div className="bg-[#141A26] p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Normal Wave Chest Rate</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="100.0"
                        value={parseFloat((stageConfig.dropTable.chestDropChance * 100).toFixed(2))}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, chestDropChance: Math.max(0.0001, val / 100) },
                          });
                        }}
                        className="w-16 bg-[#1A2232] border border-blue-500/50 rounded-lg px-2 py-0.5 text-xs text-blue-300 font-mono font-bold text-right focus:outline-none focus:border-blue-400"
                      />
                      <span className="text-xs font-bold text-blue-400">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0.001"
                    max="0.25"
                    step="0.001"
                    value={stageConfig.dropTable.chestDropChance}
                    onChange={(e) =>
                      setStageConfig({
                        ...stageConfig,
                        dropTable: { ...stageConfig.dropTable, chestDropChance: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />

                  {/* Quick Select Rate Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[0.1, 0.5, 1.0, 2.5, 5.0, 10.0].map((rate) => (
                      <button
                        key={rate}
                        onClick={() =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, chestDropChance: rate / 100 },
                          })
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono border transition-all ${
                          Math.abs(stageConfig.dropTable.chestDropChance * 100 - rate) < 0.05
                            ? 'bg-blue-600 text-white border-blue-400 font-bold'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Boss Wave Chest Chance */}
                <div className="bg-[#141A26] p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Boss Wave Chest Rate (W31)</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100.0"
                        value={parseFloat((stageConfig.dropTable.bossChestDropChance * 100).toFixed(1))}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, bossChestDropChance: Math.max(0.01, val / 100) },
                          });
                        }}
                        className="w-16 bg-[#1A2232] border border-purple-500/50 rounded-lg px-2 py-0.5 text-xs text-purple-300 font-mono font-bold text-right focus:outline-none focus:border-purple-400"
                      />
                      <span className="text-xs font-bold text-purple-400">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0.05"
                    max="1.00"
                    step="0.01"
                    value={stageConfig.dropTable.bossChestDropChance}
                    onChange={(e) =>
                      setStageConfig({
                        ...stageConfig,
                        dropTable: { ...stageConfig.dropTable, bossChestDropChance: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />

                  {/* Quick Select Rate Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[10, 25, 50, 75, 100].map((rate) => (
                      <button
                        key={rate}
                        onClick={() =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, bossChestDropChance: rate / 100 },
                          })
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono border transition-all ${
                          Math.abs(stageConfig.dropTable.bossChestDropChance * 100 - rate) < 1
                            ? 'bg-purple-600 text-white border-purple-400 font-bold'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Enhance Stone Drop Chance */}
                <div className="bg-[#141A26] p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Enhance Stone Drop Rate</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100.0"
                        value={parseFloat((stageConfig.dropTable.stoneDropChance * 100).toFixed(1))}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, stoneDropChance: Math.max(0.01, val / 100) },
                          });
                        }}
                        className="w-16 bg-[#1A2232] border border-emerald-500/50 rounded-lg px-2 py-0.5 text-xs text-emerald-300 font-mono font-bold text-right focus:outline-none focus:border-emerald-400"
                      />
                      <span className="text-xs font-bold text-emerald-400">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0.05"
                    max="1.00"
                    step="0.01"
                    value={stageConfig.dropTable.stoneDropChance}
                    onChange={(e) =>
                      setStageConfig({
                        ...stageConfig,
                        dropTable: { ...stageConfig.dropTable, stoneDropChance: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />

                  {/* Quick Select Rate Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[5, 10, 20, 35, 50, 100].map((rate) => (
                      <button
                        key={rate}
                        onClick={() =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, stoneDropChance: rate / 100 },
                          })
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono border transition-all ${
                          Math.abs(stageConfig.dropTable.stoneDropChance * 100 - rate) < 1
                            ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Gold Reward Multiplier */}
                <div className="bg-[#141A26] p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Gold Reward Multiplier</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.05"
                        min="0.10"
                        max="20.00"
                        value={stageConfig.dropTable.goldMultiplier}
                        onChange={(e) =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: {
                              ...stageConfig.dropTable,
                              goldMultiplier: parseFloat(e.target.value) || 1.0,
                            },
                          })
                        }
                        className="w-16 bg-[#1A2232] border border-amber-500/50 rounded-lg px-2 py-0.5 text-xs text-amber-400 font-mono font-bold text-right focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-xs font-bold text-amber-400">x</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0.50"
                    max="10.00"
                    step="0.05"
                    value={stageConfig.dropTable.goldMultiplier}
                    onChange={(e) =>
                      setStageConfig({
                        ...stageConfig,
                        dropTable: { ...stageConfig.dropTable, goldMultiplier: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />

                  {/* Quick Select Multiplier Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[1.0, 1.25, 1.5, 2.0, 3.0, 5.0].map((mult) => (
                      <button
                        key={mult}
                        onClick={() =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, goldMultiplier: mult },
                          })
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono border transition-all ${
                          Math.abs(stageConfig.dropTable.goldMultiplier - mult) < 0.01
                            ? 'bg-amber-600 text-black border-amber-400 font-bold'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {mult.toFixed(2)}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Chest Rarity Distribution Matrix */}
                <div className="bg-[#141A26] p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5">
                  <div className="text-[11px] font-bold text-slate-200 flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span>📦 Normal Chest Rarity %</span>
                    <span className="text-[10px] text-slate-400 font-mono">Sum: 100%</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">COM</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={parseFloat(((stageConfig.dropTable.normalCommonWeight ?? 0.60) * 100).toFixed(1))}
                        onChange={(e) =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, normalCommonWeight: (parseFloat(e.target.value) || 0) / 100 },
                          })
                        }
                        className="w-full bg-[#1A2232] border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-300 font-mono text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-emerald-400 font-bold block">UNC</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={parseFloat(((stageConfig.dropTable.normalUncommonWeight ?? 0.28) * 100).toFixed(1))}
                        onChange={(e) =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, normalUncommonWeight: (parseFloat(e.target.value) || 0) / 100 },
                          })
                        }
                        className="w-full bg-[#1A2232] border border-slate-700 rounded px-1 py-0.5 text-[10px] text-emerald-300 font-mono text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-blue-400 font-bold block">RARE</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={parseFloat(((stageConfig.dropTable.normalRareWeight ?? 0.10) * 100).toFixed(1))}
                        onChange={(e) =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, normalRareWeight: (parseFloat(e.target.value) || 0) / 100 },
                          })
                        }
                        className="w-full bg-[#1A2232] border border-slate-700 rounded px-1 py-0.5 text-[10px] text-blue-300 font-mono text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-purple-400 font-bold block">EPIC</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={parseFloat(((stageConfig.dropTable.normalEpicWeight ?? 0.02) * 100).toFixed(1))}
                        onChange={(e) =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, normalEpicWeight: (parseFloat(e.target.value) || 0) / 100 },
                          })
                        }
                        className="w-full bg-[#1A2232] border border-slate-700 rounded px-1 py-0.5 text-[10px] text-purple-300 font-mono text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-amber-400 font-bold block">LEG</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={parseFloat(((stageConfig.dropTable.normalLegendaryWeight ?? 0.0) * 100).toFixed(1))}
                        onChange={(e) =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, normalLegendaryWeight: (parseFloat(e.target.value) || 0) / 100 },
                          })
                        }
                        className="w-full bg-[#1A2232] border border-slate-700 rounded px-1 py-0.5 text-[10px] text-amber-300 font-mono text-center"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-red-300 flex items-center justify-between border-b border-slate-800 pt-2 pb-1.5">
                    <span>👑 Boss Wave 31 Chest Rarity %</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div>
                      <span className="text-[9px] text-emerald-400 font-bold block">UNC</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={parseFloat(((stageConfig.dropTable.bossUncommonWeight ?? 0.20) * 100).toFixed(1))}
                        onChange={(e) =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, bossUncommonWeight: (parseFloat(e.target.value) || 0) / 100 },
                          })
                        }
                        className="w-full bg-[#1A2232] border border-slate-700 rounded px-1 py-0.5 text-[10px] text-emerald-300 font-mono text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-blue-400 font-bold block">RARE</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={parseFloat(((stageConfig.dropTable.bossRareWeight ?? 0.45) * 100).toFixed(1))}
                        onChange={(e) =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, bossRareWeight: (parseFloat(e.target.value) || 0) / 100 },
                          })
                        }
                        className="w-full bg-[#1A2232] border border-slate-700 rounded px-1 py-0.5 text-[10px] text-blue-300 font-mono text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-purple-400 font-bold block">EPIC</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={parseFloat(((stageConfig.dropTable.bossEpicWeight ?? 0.30) * 100).toFixed(1))}
                        onChange={(e) =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, bossEpicWeight: (parseFloat(e.target.value) || 0) / 100 },
                          })
                        }
                        className="w-full bg-[#1A2232] border border-slate-700 rounded px-1 py-0.5 text-[10px] text-purple-300 font-mono text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-amber-400 font-bold block">LEG</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={parseFloat(((stageConfig.dropTable.bossLegendaryWeight ?? 0.05) * 100).toFixed(1))}
                        onChange={(e) =>
                          setStageConfig({
                            ...stageConfig,
                            dropTable: { ...stageConfig.dropTable, bossLegendaryWeight: (parseFloat(e.target.value) || 0) / 100 },
                          })
                        }
                        className="w-full bg-[#1A2232] border border-slate-700 rounded px-1 py-0.5 text-[10px] text-amber-300 font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Batch Scaling */}
          <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Batch Scale 31 Waves
              </h3>
            </div>

            {/* Custom Percent Inputs */}
            <div className="bg-[#141A26] p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
              <div className="text-[11px] font-semibold text-slate-300">Custom Multiplier Scaling (%):</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-emerald-400 block mb-1">HP Delta (+/- %)</label>
                  <input
                    type="number"
                    step="1"
                    value={customHpScale}
                    onChange={(e) => setCustomHpScale(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#1A2232] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-300 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-red-400 block mb-1">ATK Delta (+/- %)</label>
                  <input
                    type="number"
                    step="1"
                    value={customAtkScale}
                    onChange={(e) => setCustomAtkScale(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#1A2232] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-red-300 font-mono text-center"
                  />
                </div>
              </div>
              <button
                onClick={() => batchScaleMultipliers(customHpScale, customAtkScale)}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all mt-1"
              >
                Apply Custom Scale ({customHpScale >= 0 ? '+' : ''}{customHpScale}% HP / {customAtkScale >= 0 ? '+' : ''}{customAtkScale}% ATK)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => batchScaleMultipliers(10, 5)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 text-center transition-all"
              >
                +10% HP / +5% ATK
              </button>
              <button
                onClick={() => batchScaleMultipliers(25, 15)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-purple-300 text-center transition-all"
              >
                +25% HP / +15% ATK
              </button>
              <button
                onClick={() => batchScaleMultipliers(-10, -5)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-400 text-center transition-all"
              >
                -10% HP / -5% ATK
              </button>
              <button
                onClick={() => batchScaleMultipliers(0, 0)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-blue-400 text-center transition-all"
              >
                Reset Multipliers (1.00x)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 31 Waves Selector & Wave Inspector (2 cols) */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Waves 1-31 Grid Selector */}
          <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  31 Waves Roster (30 Waves + 👑 Stage Boss)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Selected: <strong className="text-blue-400">{selectedWave === 31 ? '👑 Wave 31 (Stage Boss)' : `Wave ${selectedWave}`}</strong>
              </span>
            </div>

            {/* Wave Pills */}
            <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((wNum) => {
                const waveData = stageConfig?.waves.find((w) => w.waveNumber === wNum);
                const isSelected = selectedWave === wNum;
                const isBoss = wNum === 31;

                return (
                  <button
                    key={wNum}
                    onClick={() => setSelectedWave(wNum)}
                    className={`py-2 px-1 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                        : isBoss
                        ? 'bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/40 font-bold'
                        : 'bg-[#151C2A] border-slate-800/80 text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    <span className="text-[10px] font-bold">{isBoss ? '👑' : `W${wNum}`}</span>
                    <span className="text-xs">{isBoss ? 'BOSS' : waveData?.monsterIcon || '👾'}</span>
                    <span className="text-[9px] opacity-75 font-mono">{waveData?.monsterCount || (isBoss ? 1 : 4)}x</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Wave Inspector & Tuner */}
          {activeWaveConfig && (
            <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedWave === 31 ? '👑' : activeWaveConfig.monsterIcon || '👾'}</span>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{selectedWave === 31 ? 'Wave 31 (Stage Boss) Configuration' : `Wave ${selectedWave} Configuration`}</span>
                      {selectedWave === 31 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-bold uppercase">
                          STAGE BOSS
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Monster Archetype:{' '}
                      <span className="text-blue-300 font-medium">
                        {activeWaveConfig.monsterName || activeWaveConfig.monsterId}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Monster Count:</span>
                  <div className="text-base font-black text-amber-400 font-mono">
                    {activeWaveConfig.monsterCount} {selectedWave === 31 ? 'Boss' : 'Mobs'} / Wave
                  </div>
                </div>
              </div>

              {/* Form Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Monster Archetype Select */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Monster Archetype
                  </label>
                  <select
                    value={activeWaveConfig.monsterId}
                    onChange={(e) => {
                      const found = monsters.find((m) => m.id === e.target.value);
                      updateCurrentWaveField('monsterId', e.target.value);
                      if (found) {
                        updateCurrentWaveField('monsterName', found.name);
                        updateCurrentWaveField('monsterIcon', found.iconKey);
                      }
                    }}
                    className="w-full bg-[#161C28] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-blue-500"
                  >
                    {monsters.map((mob) => (
                      <option key={mob.id} value={mob.id}>
                        {mob.iconKey} {mob.name} ({mob.category}) — {mob.baseHp} Base HP / {mob.baseAtk} Base ATK
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Monster Count (3 - 15 Mobs) */}
                <div className="bg-[#141A26] p-3.5 rounded-xl border border-slate-800 sm:col-span-2 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">
                      Monster Count (3 - 15 mobs/wave)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="3"
                        max="15"
                        value={activeWaveConfig.monsterCount}
                        onChange={(e) =>
                          updateCurrentWaveField('monsterCount', Math.min(15, Math.max(3, parseInt(e.target.value) || 3)))
                        }
                        className="w-14 bg-[#1A2232] border border-amber-500/50 rounded-lg px-2 py-0.5 text-xs text-amber-400 font-mono font-bold text-center focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-xs font-bold text-amber-400">mobs</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="1"
                    value={activeWaveConfig.monsterCount}
                    onChange={(e) => updateCurrentWaveField('monsterCount', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />

                  {/* Quick Select Mob Count Pills */}
                  <div className="flex items-center gap-2">
                    {[3, 4, 5, 6, 8, 10, 12, 15].map((count) => (
                      <button
                        key={count}
                        onClick={() => updateCurrentWaveField('monsterCount', count)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg font-mono border transition-all ${
                          activeWaveConfig.monsterCount === count
                            ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {count}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. HP Multiplier */}
                <div className="bg-[#141A26] p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-300">HP Multiplier</span>
                      <span className="text-[10px] text-emerald-400 font-mono ml-2">
                        ({activeWaveConfig.hpMultiplier >= 1 ? '+' : ''}{((activeWaveConfig.hpMultiplier - 1) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.1"
                        max="20.0"
                        step="0.01"
                        value={activeWaveConfig.hpMultiplier}
                        onChange={(e) => updateCurrentWaveField('hpMultiplier', parseFloat(e.target.value) || 1.0)}
                        className="w-18 bg-[#1A2232] border border-emerald-500/50 rounded-lg px-2 py-0.5 text-xs text-emerald-400 font-mono font-bold text-right focus:outline-none focus:border-emerald-400"
                      />
                      <span className="text-xs font-bold text-emerald-400">x</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0.2"
                    max="10.0"
                    step="0.05"
                    value={activeWaveConfig.hpMultiplier}
                    onChange={(e) => updateCurrentWaveField('hpMultiplier', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />

                  {/* Stepper Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() =>
                        updateCurrentWaveField('hpMultiplier', Math.max(0.1, Math.round((activeWaveConfig.hpMultiplier - 0.1) * 100) / 100))
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono"
                    >
                      -0.1x
                    </button>
                    <button
                      onClick={() =>
                        updateCurrentWaveField('hpMultiplier', Math.round((activeWaveConfig.hpMultiplier + 0.1) * 100) / 100)
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-emerald-300 font-mono"
                    >
                      +0.1x
                    </button>
                    <button
                      onClick={() =>
                        updateCurrentWaveField('hpMultiplier', Math.round((activeWaveConfig.hpMultiplier + 0.25) * 100) / 100)
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-emerald-300 font-mono"
                    >
                      +0.25x
                    </button>
                    <button
                      onClick={() => updateCurrentWaveField('hpMultiplier', 1.0)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 font-mono ml-auto"
                    >
                      1.00x Reset
                    </button>
                  </div>
                </div>

                {/* 4. ATK Multiplier */}
                <div className="bg-[#141A26] p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-300">ATK Multiplier</span>
                      <span className="text-[10px] text-red-400 font-mono ml-2">
                        ({activeWaveConfig.atkMultiplier >= 1 ? '+' : ''}{((activeWaveConfig.atkMultiplier - 1) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.1"
                        max="20.0"
                        step="0.01"
                        value={activeWaveConfig.atkMultiplier}
                        onChange={(e) => updateCurrentWaveField('atkMultiplier', parseFloat(e.target.value) || 1.0)}
                        className="w-18 bg-[#1A2232] border border-red-500/50 rounded-lg px-2 py-0.5 text-xs text-red-400 font-mono font-bold text-right focus:outline-none focus:border-red-400"
                      />
                      <span className="text-xs font-bold text-red-400">x</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0.2"
                    max="10.0"
                    step="0.05"
                    value={activeWaveConfig.atkMultiplier}
                    onChange={(e) => updateCurrentWaveField('atkMultiplier', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />

                  {/* Stepper Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() =>
                        updateCurrentWaveField('atkMultiplier', Math.max(0.1, Math.round((activeWaveConfig.atkMultiplier - 0.1) * 100) / 100))
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono"
                    >
                      -0.1x
                    </button>
                    <button
                      onClick={() =>
                        updateCurrentWaveField('atkMultiplier', Math.round((activeWaveConfig.atkMultiplier + 0.1) * 100) / 100)
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-red-300 font-mono"
                    >
                      +0.1x
                    </button>
                    <button
                      onClick={() =>
                        updateCurrentWaveField('atkMultiplier', Math.round((activeWaveConfig.atkMultiplier + 0.25) * 100) / 100)
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-red-300 font-mono"
                    >
                      +0.25x
                    </button>
                    <button
                      onClick={() => updateCurrentWaveField('atkMultiplier', 1.0)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 font-mono ml-auto"
                    >
                      1.00x Reset
                    </button>
                  </div>
                </div>

                {/* 5. Armor Multiplier */}
                <div className="bg-[#141A26] p-3.5 rounded-xl border border-slate-800 sm:col-span-2 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-300">Armor Multiplier</span>
                      <span className="text-[10px] text-cyan-400 font-mono ml-2">
                        ({activeWaveConfig.armorMultiplier >= 1 ? '+' : ''}{((activeWaveConfig.armorMultiplier - 1) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.1"
                        max="20.0"
                        step="0.01"
                        value={activeWaveConfig.armorMultiplier}
                        onChange={(e) => updateCurrentWaveField('armorMultiplier', parseFloat(e.target.value) || 1.0)}
                        className="w-18 bg-[#1A2232] border border-cyan-500/50 rounded-lg px-2 py-0.5 text-xs text-cyan-400 font-mono font-bold text-right focus:outline-none focus:border-cyan-400"
                      />
                      <span className="text-xs font-bold text-cyan-400">x</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0.2"
                    max="10.0"
                    step="0.05"
                    value={activeWaveConfig.armorMultiplier}
                    onChange={(e) => updateCurrentWaveField('armorMultiplier', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />

                  {/* Stepper Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() =>
                        updateCurrentWaveField('armorMultiplier', Math.max(0.1, Math.round((activeWaveConfig.armorMultiplier - 0.1) * 100) / 100))
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono"
                    >
                      -0.1x
                    </button>
                    <button
                      onClick={() =>
                        updateCurrentWaveField('armorMultiplier', Math.round((activeWaveConfig.armorMultiplier + 0.1) * 100) / 100)
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 font-mono"
                    >
                      +0.1x
                    </button>
                    <button
                      onClick={() => updateCurrentWaveField('armorMultiplier', 1.0)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 font-mono ml-auto"
                    >
                      1.00x Reset
                    </button>
                  </div>
                </div>

                {/* Boss Wave 31 Enrage Skill */}
                {selectedWave === 31 && (
                  <div className="sm:col-span-2 bg-red-950/20 border border-red-500/40 p-3.5 rounded-xl flex flex-col gap-2">
                    <label className="block text-xs font-semibold text-red-300">
                      👑 Boss Enrage Skill (Triggered at &lt;30% HP)
                    </label>
                    <input
                      type="text"
                      value={activeWaveConfig.bossEnrageSkill || ''}
                      onChange={(e) => updateCurrentWaveField('bossEnrageSkill', e.target.value)}
                      placeholder="e.g. Berserk Rage (+50% ATK), Hellfire Blast"
                      className="w-full bg-[#161C28] border border-red-500/50 rounded-xl px-3 py-2 text-xs text-red-200 focus:outline-none focus:border-red-400"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
