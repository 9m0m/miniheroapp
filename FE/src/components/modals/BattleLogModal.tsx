'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, ScrollText, CheckCircle2, XCircle, Clock, Zap, Lightbulb } from 'lucide-react';

export const BattleLogModal: React.FC = () => {
  const {
    battleLogs,
    worldIndex,
    stageIndex,
    currentWave,
    activeModal,
    closeModal,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'LOGS' | 'LIVE'>('LOGS');

  if (activeModal !== 'BATTLE_LOGS') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 border border-cyan-500/30 p-5 shadow-2xl text-white">
        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold mb-1 border border-cyan-500/30">
            <ScrollText size={13} />
            <span>EXPEDITION BATTLE LOGS</span>
          </div>
          <h3 className="text-base font-bold text-slate-100">Stage Clear & Defeat Analytics</h3>
          <p className="text-[10px] text-slate-400">
            Track real-time clear speeds, boss wave defeats, and tactical tips.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-1.5 mb-3 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'LOGS'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ScrollText size={13} />
            <span>History ({battleLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('LIVE')}
            className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'LIVE'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap size={13} />
            <span>Live Session ({worldIndex}-{stageIndex})</span>
          </button>
        </div>

        {/* TAB 1: BATTLE HISTORY LOGS */}
        {activeTab === 'LOGS' && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-4">
            {battleLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">
                No logs recorded yet. Party is currently fighting in the arena!
              </p>
            ) : (
              battleLogs.map((log) => {
                const isVictory = log.result === 'VICTORY';
                const timeMinutes = Math.floor(log.clearTimeSeconds / 60);
                const timeSecs = log.clearTimeSeconds % 60;
                const formattedTime = timeMinutes > 0 ? `${timeMinutes}m ${timeSecs}s` : `${timeSecs}s`;

                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border transition ${
                      isVictory
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    {/* Top Row: Result Badge & Stage */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {isVictory ? (
                          <CheckCircle2 size={15} className="text-emerald-400" />
                        ) : (
                          <XCircle size={15} className="text-red-400" />
                        )}
                        <span className={`font-bold text-xs ${isVictory ? 'text-emerald-300' : 'text-red-300'}`}>
                          {isVictory ? 'STAGE CLEAR' : 'DEFEAT'}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                          Stage {log.world}-{log.stage}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Clock size={11} />
                        <span>{formattedTime}</span>
                      </div>
                    </div>

                    {/* Victory Rewards or Defeat Wave Analysis */}
                    {isVictory ? (
                      <div className="text-[10px] text-slate-300 space-y-0.5 mt-1 bg-slate-950/60 p-2 rounded-lg border border-emerald-500/20">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rewards:</span>
                          <span className="text-yellow-400 font-semibold">
                            +{log.goldEarned} 🪙 • +{log.stonesEarned} 🪨
                          </span>
                        </div>
                        {log.droppedItemName && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Chest Drop:</span>
                            <span className="text-cyan-300 font-bold">🎁 {log.droppedItemName}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-300 space-y-1 mt-1 bg-slate-950/60 p-2 rounded-lg border border-red-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Fell at:</span>
                          <span className="text-red-400 font-bold font-mono">
                            Wave {log.defeatedAtWave || 1}/30
                          </span>
                        </div>
                        {log.causeOfDeath && (
                          <div className="text-[10px] text-orange-300">
                            Cause: {log.causeOfDeath}
                          </div>
                        )}
                        {log.tacticalTip && (
                          <div className="flex items-start gap-1 text-[10px] text-yellow-300/90 pt-1 border-t border-slate-800">
                            <Lightbulb size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span>{log.tacticalTip}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: LIVE SESSION TELEMETRY */}
        {activeTab === 'LIVE' && (
          <div className="space-y-3 mb-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Region:</span>
              <span className="font-bold text-cyan-300">World {worldIndex} - Stage {stageIndex}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Wave Progress:</span>
              <span className="font-bold text-yellow-400 font-mono">
                {currentWave === 30 ? '🔥 STAGE BOSS' : `Wave ${currentWave}/30`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Average Clear Speed:</span>
              <span className="font-mono text-emerald-400 font-semibold">~2.8 sec / Wave</span>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-[10px] text-slate-400 mb-1">Tactical Optimization Tip:</div>
              <p className="text-[10px] text-slate-300 leading-relaxed bg-slate-900 p-2 rounded-lg border border-slate-800">
                💡 Enhance Arthur & Merlin weapons to at least <strong>+5</strong> and inlay <strong>Ruby Gems (+ATK)</strong> to clear 30 waves in under 60 seconds!
              </p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={closeModal}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
        >
          Close Logs
        </button>
      </div>
    </div>
  );
};
