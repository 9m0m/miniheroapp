'use client';

import React from 'react';
import { TowerAttemptResponseDto } from '@/types/tower.types';
import { RotateCcw, ArrowRight, Home, Sparkles } from 'lucide-react';

interface TowerResultsSheetProps {
  result: TowerAttemptResponseDto;
  onNextFloor: () => void;
  onRetry: () => void;
  onWatchReplay?: () => void;
  onLobby: () => void;
}

export const TowerResultsSheet: React.FC<TowerResultsSheetProps> = ({
  result,
  onNextFloor,
  onRetry,
  onWatchReplay,
  onLobby,
}) => {
  const isVictory = result.winner === 'PLAYER';

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-5 select-none justify-between overflow-y-auto">
      {/* Top Victory / Defeat Header */}
      <div className="flex flex-col items-center text-center mt-6">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-xl ${
            isVictory
              ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40 shadow-amber-500/10'
              : 'bg-red-500/20 text-red-400 border border-red-400/40 shadow-red-500/10'
          }`}
        >
          {isVictory ? '🏆' : '💀'}
        </div>

        <h1
          className={`text-2xl font-black tracking-tight mb-1 ${
            isVictory ? 'text-amber-400' : 'text-red-400'
          }`}
        >
          {isVictory ? 'VICTORY!' : 'DEFEAT'}
        </h1>
        <p className="text-xs text-slate-400">
          {isVictory
            ? `Floor ${result.floorNumber} Cleared Successfully`
            : `Fell at Floor ${result.floorNumber}. Adjust your team and try again.`}
        </p>
      </div>

      {/* Combat Metrics Summary */}
      <div className="my-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
          <span className="text-slate-400">Rounds Taken:</span>
          <span className="font-bold font-mono text-slate-200">{result.roundsUsed} / 30</span>
        </div>

        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
          <span className="text-slate-400">Remaining Team HP:</span>
          <span className="font-bold font-mono text-emerald-400">
            {Math.round(result.remainingHpPercent)}%
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Calculated Score:</span>
          <span className="font-bold font-mono text-amber-400 text-sm">
            {result.score.toLocaleString()}
          </span>
        </div>

        {/* First Clear Rewards */}
        {result.isFirstClear && result.rewardsGranted && (
          <div className="mt-2 pt-3 border-t border-amber-500/30 bg-amber-500/10 p-2.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>First Clear Reward Claimed!</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              {result.rewardsGranted.gold > 0 && <div>💰 +{result.rewardsGranted.gold} Gold</div>}
              {result.rewardsGranted.essence > 0 && <div>🧪 +{result.rewardsGranted.essence} Essence</div>}
              {result.rewardsGranted.stones > 0 && <div>💎 +{result.rewardsGranted.stones} Stones</div>}
              {result.rewardsGranted.shards > 0 && <div>⭐ +{result.rewardsGranted.shards} Shards</div>}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5">
        {isVictory && result.floorNumber < 30 && (
          <button
            onClick={onNextFloor}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
          >
            <span>Next Floor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Floor</span>
        </button>

        {onWatchReplay && (
          <button
            onClick={onWatchReplay}
            className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-purple-300 flex items-center justify-center gap-2 transition-colors"
          >
            <span>▶️ Watch Replay Again</span>
          </button>
        )}

        <button
          onClick={onLobby}
          className="w-full py-3 rounded-xl font-bold text-xs bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Back to Tower Lobby</span>
        </button>
      </div>
    </div>
  );
};
