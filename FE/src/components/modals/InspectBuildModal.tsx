'use client';

import React from 'react';
import { BuildInspectResponse } from '@/types/trial.types';
import { X, Lock, Shield, Sparkles, Swords, Heart, Zap, Crosshair } from 'lucide-react';
import { HeroClass } from '@/types/game.types';

interface InspectBuildModalProps {
  data: BuildInspectResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InspectBuildModal: React.FC<InspectBuildModalProps> = ({ data, isOpen, onClose }) => {
  if (!isOpen || !data) return null;

  let parsedSnapshot: any = null;
  if (data.heroesSnapshotJson) {
    try {
      parsedSnapshot = JSON.parse(data.heroesSnapshotJson);
    } catch (e) {
      console.error('Failed to parse heroes snapshot:', e);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[390px] bg-[#0F141E] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-[#182030] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>{data.username}&apos;s Squad Build</span>
                {data.isBuildPublic ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    PUBLIC SHOWCASE
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    SECRET TACTICAL
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400">{data.message}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {!data.isBuildPublic && !parsedSnapshot ? (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-white">Private Tactical Build</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                This Champion has set their squad build to private to protect their secret meta setup.
              </p>
            </div>
          ) : parsedSnapshot ? (
            <div className="space-y-4">
              {/* Deployed Heroes 3-Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['WARRIOR', 'RANGER', 'MAGE', 'PRIEST'].map((heroClass) => {
                  const hero = parsedSnapshot.heroes ? parsedSnapshot.heroes[heroClass] : null;
                  if (!hero) return null;

                  return (
                    <div
                      key={heroClass}
                      className="bg-[#141A26] border border-slate-800 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-md"
                    >
                      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                        <span className="text-xl">
                          {heroClass === 'WARRIOR' ? '🛡️' : heroClass === 'RANGER' ? '🏹' : heroClass === 'MAGE' ? '🔮' : '✨'}
                        </span>
                        <div>
                          <div className="text-xs font-black text-white">{heroClass}</div>
                          <div className="text-[10px] text-amber-400 font-mono">Lv.{hero.level || 1}</div>
                        </div>
                      </div>

                      {/* Stat Highlights */}
                      <div className="space-y-1 text-[10px] font-mono text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phys/Mag ATK:</span>
                          <span className="text-yellow-400 font-bold">
                            {Math.round((hero.computedStats?.physAtk || 0) + (hero.computedStats?.magicAtk || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Armor / HP:</span>
                          <span className="text-emerald-400">
                            {Math.round(hero.computedStats?.armor || 0)} / {Math.round(hero.computedStats?.maxHp || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Crit Rate:</span>
                          <span className="text-cyan-300">{(hero.computedStats?.critRate || 5).toFixed(1)}%</span>
                        </div>
                      </div>

                      {/* Equipment Slots Mini Preview */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 uppercase font-bold">Equipped:</span>
                        <span className="text-[10px] text-purple-300 font-mono">
                          {hero.equipment ? Object.keys(hero.equipment).length : 0}/6 Slots
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Squad Theoretical Combat Rating */}
              <div className="bg-[#121824] border border-purple-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">Live Squad Combat Metric</span>
                </div>
                <span className="text-xs font-mono font-black text-purple-300">
                  {parsedSnapshot.totalDps ? `${Math.round(parsedSnapshot.totalDps).toLocaleString()} Live DPS` : 'Verified Legitimate'}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No detailed build snapshot recorded for this season yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
