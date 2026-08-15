'use client';

import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export const PiggyBankModal: React.FC = () => {
  const { piggyBankGems, closeModal, triggerWldPayment } = useGameStore();

  const progressPercent = Math.min(100, Math.round((piggyBankGems / 1000) * 100));
  const isFull = piggyBankGems >= 1000;

  const handleOpenPiggy = () => {
    triggerWldPayment({
      featureKey: 'PIGGY_BANK',
      title: 'Smash Gem Piggy Bank',
      priceWld: 0.5,
      description: `Unlock all ${piggyBankGems.toLocaleString()} Gems accumulated during your wave battles.`,
      benefitText: `Instantly transfers ${piggyBankGems.toLocaleString()} Gems into your wallet.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border border-amber-500/30 p-6 shadow-2xl text-white shadow-amber-500/10">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/40 mb-3 shadow-lg shadow-amber-500/20">
            <span className="text-5xl animate-bounce">🐷</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            GEM PIGGY BANK
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Every defeated monster banks precious Gems into your personal vault!
          </p>
        </div>

        {/* Gem Accumulator Vault Display */}
        <div className="my-5 rounded-xl bg-slate-950/80 border border-amber-500/20 p-4 text-center">
          <div className="text-3xl font-extrabold text-amber-400 flex items-center justify-center gap-1.5">
            <span>💎</span>
            <span>{piggyBankGems.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-normal self-end mb-1">/ 1,000 Gems</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-3 mt-3 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
            <span>Vault Progress: {progressPercent}%</span>
            <span>{isFull ? '🔥 VAULT FULL!' : 'Accumulating...'}</span>
          </div>
        </div>

        {/* Value Pitch */}
        <div className="space-y-2 mb-5 text-xs text-slate-300 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400 flex-shrink-0" />
            <span>Estimated Real Value: <strong>~$10.00 USD</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-yellow-400 flex-shrink-0" />
            <span>Exclusive discount for verified World ID human users</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
            <span>100% Guaranteed instant Gem credit</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenPiggy}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2"
        >
          <span>🔨 SMASH VAULT NOW — 0.5 WLD</span>
        </button>

        <p className="text-[10px] text-center text-slate-500 mt-2.5">
          One-tap instant checkout via MiniKit Pay on World App
        </p>
      </div>
    </div>
  );
};
