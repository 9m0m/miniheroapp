'use client';

import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, TrendingUp, CheckCircle, Lock, Gift } from 'lucide-react';

const MILESTONES = [
  { stage: 10, title: 'World 1: Emerald Forest', reward: '💎 250 Gems + 🪨 10 Stones' },
  { stage: 20, title: 'World 2: Frozen Citadel', reward: '💎 250 Gems + 🪨 10 Stones' },
  { stage: 30, title: 'World 3: Volcanic Caldera', reward: '💎 250 Gems + 🪨 10 Stones' },
  { stage: 40, title: 'World 4: Void Abyss', reward: '💎 500 Gems + 🪨 20 Stones' },
];

export const GrowthFundModal: React.FC = () => {
  const {
    growthFundUnlocked,
    claimedGrowthFundStages,
    maxClearedStage,
    closeModal,
    triggerWldPayment,
    claimGrowthFund,
  } = useGameStore();

  const handleUnlockFund = () => {
    triggerWldPayment({
      featureKey: 'GROWTH_FUND',
      title: 'Activate Growth Fund Contract',
      priceWld: 2.0,
      description: 'Invest 2.0 WLD to receive 500% ROI across 40 Stages (1,250 Gems + 50 Enhance Stones).',
      benefitText: 'Unlocks dividend claims at Stage 10, 20, 30, and 40 milestones.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 border border-blue-500/30 p-5 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-1">
            <TrendingUp size={14} className="text-blue-400" />
            <span>EXPEDITION GROWTH FUND</span>
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-300 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
            STAGE GROWTH FUND (500% ROI)
          </h2>
          <p className="text-[11px] text-slate-400">
            Conquer World Boss stages to withdraw massive Gem dividends
          </p>
        </div>

        {/* Milestones List */}
        <div className="space-y-2.5 my-3">
          {MILESTONES.map((m) => {
            const isCleared = maxClearedStage >= m.stage;
            const isClaimed = claimedGrowthFundStages.includes(m.stage);
            const canClaim = growthFundUnlocked && isCleared && !isClaimed;

            return (
              <div
                key={m.stage}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                  isClaimed
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : canClaim
                    ? 'bg-blue-950/40 border-blue-400 shadow-md ring-1 ring-blue-400 animate-pulse'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{m.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-mono text-cyan-400">
                      Stage {m.stage}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-300 font-semibold mt-0.5">{m.reward}</div>
                </div>

                {isClaimed ? (
                  <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                ) : canClaim ? (
                  <button
                    onClick={() => claimGrowthFund(m.stage)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition flex items-center gap-1 shadow-md shadow-cyan-500/20"
                  >
                    <Gift size={13} />
                    <span>Claim</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Lock size={13} />
                    <span>{isCleared ? 'Requires Fund' : 'Locked'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Unlock Action */}
        {!growthFundUnlocked ? (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={handleUnlockFund}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-blue-500/25 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              <span>UNLOCK ALL MILESTONES — 2.0 WLD</span>
            </button>
          </div>
        ) : (
          <div className="mt-3 text-center text-xs text-emerald-400 font-semibold bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
            ✨ Growth Fund Contract Activated
          </div>
        )}
      </div>
    </div>
  );
};
