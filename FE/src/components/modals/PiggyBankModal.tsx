'use client';

import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ModalShell } from '../ui/ModalShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PiggyBank, Gem, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export const PiggyBankModal: React.FC = () => {
  const piggyBankGems = useGameStore((state) => state.piggyBankGems);
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const triggerWldPayment = useGameStore((state) => state.triggerWldPayment);

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
    <ModalShell
      isOpen={activeModal === 'PIGGY_BANK'}
      onClose={closeModal}
      icon={<PiggyBank size={18} className="text-amber-400" />}
      title="Gem Piggy Bank"
      description="Battle Gem Vault"
    >
      <div className="space-y-3 select-none">
        {/* Gem Accumulator Vault Display */}
        <div className="p-3.5 bg-[#0e131d] border border-[#1e293b] rounded-lg text-center space-y-2 shadow-sm">
          <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1.5 font-mono tabular-nums">
            <Gem size={20} className="text-cyan-400" aria-hidden="true" />
            <span>{piggyBankGems.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-sans font-normal self-end mb-0.5">/ 1,000 Gems</span>
          </div>

          {/* Progress bar */}
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Piggy bank capacity"
            className="w-full bg-[#080b12] rounded-full h-2 overflow-hidden border border-[#1e293b]"
          >
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Capacity: {progressPercent}%</span>
            <span className="text-amber-400 font-bold">{isFull ? 'Vault Full' : 'Accumulating from battles'}</span>
          </div>
        </div>

        {/* Benefits Card */}
        <div className="space-y-1.5 p-3 bg-[#080b12] border border-[#1e293b] rounded-lg text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400 shrink-0" aria-hidden="true" />
            <span>Estimated In-Game Value: <strong className="text-slate-100">~$10.00 USD</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-yellow-400 shrink-0" aria-hidden="true" />
            <span>Exclusive discount for verified World ID users</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Instant Gem credit directly into your balance</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="accent"
          size="lg"
          fullWidth
          onClick={handleOpenPiggy}
          className="font-black uppercase tracking-wider min-h-[44px]"
        >
          <span>Claim Vault — 0.5 WLD</span>
        </Button>

        <p className="text-[10px] text-center text-slate-500 font-mono">
          Instant checkout via MiniKit Pay on World App
        </p>
      </div>
    </ModalShell>
  );
};

export default PiggyBankModal;
