'use client';

import React from 'react';

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
        className="absolute w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none animate-pulse"
      />

      <div className="relative flex flex-col items-center text-center max-w-xs w-full z-10">
        {/* Sleek Minimalist Ring Loader */}
        <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-indigo-500 animate-spin"
            style={{ animationDuration: '1s' }}
          />
          <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700/60 flex items-center justify-center shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
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
