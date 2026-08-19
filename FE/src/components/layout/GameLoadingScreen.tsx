'use client';

import React from 'react';
import { Sparkles, Swords } from 'lucide-react';

interface GameLoadingScreenProps {
  message?: string;
}

export const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({
  message = 'Connecting to Sky Sanctuary…',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading game"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090E] text-slate-100 p-6 select-none"
    >
      {/* Background Ambient Glow */}
      <div
        aria-hidden="true"
        className="absolute w-72 h-72 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none animate-pulse"
      />

      <div className="relative flex flex-col items-center text-center max-w-xs w-full z-10">
        {/* Animated Brand Emblem */}
        <div className="relative mb-5">
          <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-indigo-900/60 via-slate-900 to-amber-950/40 border border-amber-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)]">
            <Sparkles className="w-9 h-9 text-amber-400" aria-hidden="true" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-slate-900 border border-indigo-500/50 flex items-center justify-center text-indigo-300 shadow">
            <Swords className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </div>

        {/* Title */}
        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-1">
          World Hero
        </span>
        <h1 className="text-xl font-black text-slate-100 tracking-tight mb-5">
          Sky Sanctuary
        </h1>

        {/* Animated Loading Bar */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800 mb-3 shadow-inner relative">
          <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-amber-500 via-indigo-500 to-cyan-400 rounded-full animate-shimmer" />
        </div>

        {/* Dynamic Status Text */}
        <span className="text-[11px] font-mono text-slate-400">
          {message}
        </span>
      </div>
    </div>
  );
};
