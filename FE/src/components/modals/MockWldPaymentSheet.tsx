'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { BottomSheet } from '../ui/BottomSheet';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ShieldCheck, CheckCircle2, Sparkles, CreditCard } from 'lucide-react';

export const MockWldPaymentSheet: React.FC = () => {
  const mockPaymentConfig = useGameStore((state) => state.mockPaymentConfig);
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const executeMockWldPay = useGameStore((state) => state.executeMockWldPay);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!mockPaymentConfig) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    // Simulate biometric check / World Chain transaction
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsProcessing(false);
    setIsSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    await executeMockWldPay();
  };

  return (
    <BottomSheet
      isOpen={activeModal === 'MOCK_WLD_PAY'}
      onClose={closeModal}
      icon={<CreditCard size={18} className="text-cyan-400" />}
      title="World App MiniKit Pay"
      description="Sandbox Network • Zero Gas Protocol"
    >
      <div className="space-y-3 select-none">
        {/* Order Details */}
        <div className="space-y-2 p-3.5 bg-[#0e131d] border border-[#1e293b] rounded-lg shadow-sm">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Transaction Details:</div>
          <div className="text-sm font-black text-white">{mockPaymentConfig.title}</div>
          <div className="text-xs text-slate-300">{mockPaymentConfig.description}</div>

          <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Due:</span>
            <div className="text-lg font-black text-amber-400 flex items-center gap-1 font-mono tabular-nums">
              <span>{mockPaymentConfig.priceWld.toFixed(1)}</span>
              <span className="text-xs font-bold text-slate-300">WLD</span>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 p-2.5 bg-[#080b12] border border-[#1e293b] rounded-lg text-xs text-slate-300 font-medium">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" aria-hidden="true" />
          <span>World ID Verified Human (Sandbox)</span>
        </div>

        {/* Action Button */}
        {isSuccess ? (
          <div className="w-full py-3 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 uppercase tracking-wider shadow-md">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>Payment Authorized!</span>
          </div>
        ) : (
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleConfirm}
            disabled={isProcessing}
            isLoading={isProcessing}
            className="font-black uppercase tracking-wider min-h-[44px]"
          >
            <Sparkles size={15} className="mr-1.5" aria-hidden="true" />
            <span>Confirm 1-Touch Payment</span>
          </Button>
        )}

        <p className="text-[10px] text-center text-slate-500 font-mono">
          Sandbox simulation adhering to World Network MiniKit specifications
        </p>
      </div>
    </BottomSheet>
  );
};

export default MockWldPaymentSheet;
