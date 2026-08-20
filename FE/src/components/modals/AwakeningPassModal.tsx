'use client';

import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ModalShell } from '../ui/ModalShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle, Lock, Crown } from 'lucide-react';

const PASS_DAYS = [
  { day: 1, free: '1,000 Gold + 1 Stone', golden: '5,000 Gold + 5 Stones + Royal Claymore (Rare)' },
  { day: 2, free: '2,000 Gold + 20 Gems', golden: '10,000 Gold + 100 Gems + 5 Stones' },
  { day: 3, free: '3,000 Gold + 3 Stones', golden: '15,000 Gold + 15 Stones + Emerald Ring (Rare)' },
  { day: 4, free: '4,000 Gold + 40 Gems', golden: '20,000 Gold + 200 Gems + 10 Stones' },
  { day: 5, free: '5,000 Gold + 5 Stones', golden: '25,000 Gold + 25 Stones + Blessing Scroll' },
  { day: 6, free: '6,000 Gold + 60 Gems', golden: '30,000 Gold + 300 Gems + 15 Stones' },
  { day: 7, free: '10,000 Gold + 100 Gems', golden: '50,000 Gold + 500 Gems + Excalibur (Legendary)' },
];

export const AwakeningPassModal: React.FC = () => {
  const isGoldenPassActive = useGameStore((state) => state.isGoldenPassActive);
  const loginDayIndex = useGameStore((state) => state.loginDayIndex);
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const triggerWldPayment = useGameStore((state) => state.triggerWldPayment);
  const claimDailyPass = useGameStore((state) => state.claimDailyPass);

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
    <ModalShell
      isOpen={activeModal === 'AWAKENING_PASS'}
      onClose={closeModal}
      icon={<Crown size={18} className="text-purple-400" />}
      title="Hero Awakening Pass"
      description="7-Day streak check-in rewards"
    >
      <div className="space-y-3 select-none">
        {/* 7 Days List */}
        <div className="space-y-1.5 max-h-[44vh] overflow-y-auto pr-0.5">
          {PASS_DAYS.map((item, idx) => {
            const isToday = idx === loginDayIndex;
            const isPast = idx < loginDayIndex;

            return (
              <div
                key={item.day}
                className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border bg-[#0e131d] ${
                  isToday
                    ? 'border-purple-500/60 ring-1 ring-purple-500/40'
                    : isPast
                    ? 'border-[#1e293b] opacity-50'
                    : 'border-[#1e293b]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-[#080b12] border border-[#1e293b] flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                    <span className="text-[8px] text-slate-400">DAY</span>
                    <span className="text-amber-400 font-mono font-black text-xs">{item.day}</span>
                  </div>

                  <div className="min-w-0 text-xs">
                    <div className="text-slate-300 font-medium truncate text-[11px]">
                      Free: <span className="text-slate-400">{item.free}</span>
                    </div>
                    <div className="text-amber-300 font-bold flex items-center gap-1 mt-0.5 truncate text-[11px]">
                      <Crown size={11} className="text-amber-400 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.golden}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isPast ? (
                    <CheckCircle size={18} className="text-emerald-400" aria-hidden="true" />
                  ) : isToday ? (
                    <Button size="sm" variant="accent" onClick={() => claimDailyPass(idx + 1)} className="font-black text-xs">
                      Claim
                    </Button>
                  ) : (
                    <Lock size={15} className="text-slate-600" aria-hidden="true" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Golden Track CTA */}
        {!isGoldenPassActive ? (
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleUnlockGolden}
            className="font-black uppercase tracking-wider min-h-[44px]"
          >
            <Crown size={15} className="mr-1.5 text-slate-950" aria-hidden="true" />
            <span>Unlock Golden Track — 1.0 WLD</span>
          </Button>
        ) : (
          <div className="p-2.5 bg-amber-950/40 rounded-lg text-center text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 border border-amber-500/40">
            <Crown size={14} aria-hidden="true" />
            <span>Golden Track Active (7-Day VIP Privileges)</span>
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export default AwakeningPassModal;
