'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, ShieldCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export const MockWldPaymentSheet: React.FC = () => {
  const { mockPaymentConfig, closeModal, executeMockWldPay } = useGameStore();
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

    await executeMockWldPay(mockPaymentConfig.featureKey, mockPaymentConfig.priceWld);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm sm:rounded-2xl rounded-t-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-white animate-slide-up">
        {/* Handle Bar on Mobile */}
        <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Close Button */}
        <button
          onClick={closeModal}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X size={16} />
        </button>

        {/* MiniKit Pay Branding */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-950 font-black text-sm">
            W
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">World App MiniKit Pay</div>
            <div className="text-[10px] text-emerald-400 font-medium">Sandbox Dev Network • Zero Gas</div>
          </div>
        </div>

        {/* Order Details */}
        <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 mb-4">
          <div className="text-xs text-slate-400">Transaction:</div>
          <div className="text-sm font-bold text-white mt-0.5">{mockPaymentConfig.title}</div>
          <div className="text-xs text-slate-300 mt-1">{mockPaymentConfig.description}</div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Due:</span>
            <div className="text-xl font-extrabold text-amber-400 flex items-center gap-1">
              <span>{mockPaymentConfig.priceWld.toFixed(1)}</span>
              <span className="text-sm font-bold text-slate-300">WLD</span>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-800/40 rounded-lg p-2.5 mb-5 border border-slate-800">
          <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
          <span>World ID Verification: <strong>nullifier_demo_01</strong> (Verified Human)</span>
        </div>

        {/* Action Button */}
        {isSuccess ? (
          <div className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 animate-pulse">
            <CheckCircle2 size={18} />
            <span>PAYMENT SUCCESSFUL!</span>
          </div>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm shadow-lg hover:bg-slate-100 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin text-slate-950" />
                <span>Signing Transaction...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-amber-500" />
                <span>CONFIRM 1-TOUCH PAYMENT</span>
              </>
            )}
          </button>
        )}

        <p className="text-[10px] text-center text-slate-500 mt-3">
          Sandbox Simulation adhering to World Network MiniKit specifications
        </p>
      </div>
    </div>
  );
};
