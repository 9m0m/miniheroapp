'use client';

import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, CheckCircle, Lock, Crown, Sparkles } from 'lucide-react';

const PASS_DAYS = [
  { day: 1, free: '1,000 🪙 + 1 🪨', golden: '5,000 🪙 + 5 🪨 + 🗡️ Royal Claymore (Rare)' },
  { day: 2, free: '2,000 🪙 + 20 💎', golden: '10,000 🪙 + 100 💎 + 5 🪨' },
  { day: 3, free: '3,000 🪙 + 3 🪨', golden: '15,000 🪙 + 15 🪨 + 💍 Emerald Ring (Rare)' },
  { day: 4, free: '4,000 🪙 + 40 💎', golden: '20,000 🪙 + 200 💎 + 10 🪨' },
  { day: 5, free: '5,000 🪙 + 5 🪨', golden: '25,000 🪙 + 25 🪨 + 📜 Blessing Scroll' },
  { day: 6, free: '6,000 🪙 + 60 💎', golden: '30,000 🪙 + 300 💎 + 15 🪨' },
  { day: 7, free: '10,000 🪙 + 100 💎', golden: '50,000 🪙 + 500 💎 + ✨ EXCALIBUR (Legendary)' },
];

export const AwakeningPassModal: React.FC = () => {
  const { isGoldenPassActive, loginDayIndex, closeModal, triggerWldPayment, claimDailyPass } = useGameStore();

  const handleUnlockGolden = () => {
    triggerWldPayment({
      featureKey: 'GOLDEN_PASS',
      title: 'Activate 7-Day Golden Pass',
      priceWld: 1.0,
      description: 'Unlock 5x rewards daily, Royal Claymore, and the legendary Holy Blade Excalibur.',
      benefitText: 'Instantly activates full Golden Track privileges for 7 consecutive days.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border border-purple-500/30 p-5 shadow-2xl text-white max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
            <Crown size={14} className="text-amber-400" />
            <span>7-DAY LOGIN STREAK</span>
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-300 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            7-DAY HERO AWAKENING PASS
          </h2>
          <p className="text-[11px] text-slate-400">
            Check-in daily to claim massive resources and legendary gear
          </p>
        </div>

        {/* 7 Days List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {PASS_DAYS.map((item, idx) => {
            const isToday = idx === loginDayIndex;
            const isPast = idx < loginDayIndex;

            return (
              <div
                key={item.day}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                  isToday
                    ? 'bg-purple-900/40 border-purple-400/60 shadow-lg shadow-purple-500/10 ring-1 ring-purple-400'
                    : isPast
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center font-bold text-xs">
                    <span className="text-[9px] text-slate-400">DAY</span>
                    <span className="text-amber-400">{item.day}</span>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      Free: <span className="font-normal text-slate-300">{item.free}</span>
                    </div>
                    <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                      <Crown size={11} className="text-amber-400" />
                      <span>{item.golden}</span>
                    </div>
                  </div>
                </div>

                {isPast ? (
                  <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                ) : isToday ? (
                  <button
                    onClick={claimDailyPass}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition"
                  >
                    Claim
                  </button>
                ) : (
                  <Lock size={15} className="text-slate-600 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: Golden Pass Promo & Action */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Sparkles size={13} />
              <span>Unlock 5x Golden Track</span>
            </div>
            <div className="text-[10px] text-slate-400">Guaranteed Legendary Excalibur on Day 7</div>
          </div>

          {!isGoldenPassActive ? (
            <button
              onClick={handleUnlockGolden}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
            >
              Unlock 1.0 WLD
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
              Golden Active ✨
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
