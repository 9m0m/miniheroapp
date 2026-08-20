'use client';

import React from 'react';
import { TowerAttemptResponseDto } from '@/types/tower.types';
import { RotateCcw, ArrowRight, Home, Sparkles } from 'lucide-react';

interface TowerResultsSheetProps {
  result: TowerAttemptResponseDto;
  onNextFloor: () => void;
  onRetry: () => void;
  onLobby: () => void;
}

export const TowerResultsSheet: React.FC<TowerResultsSheetProps> = ({
  result,
  onNextFloor,
  onRetry,
  onLobby,
}) => {
  const isVictory = result.winner === 'PLAYER';

  return (
    <div className="flex flex-col h-full bg-[#06080e] text-slate-100 p-4 select-none justify-between overflow-y-auto">
      {/* Top Victory / Defeat Header */}
      <div className="flex flex-col items-center text-center mt-4">
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-2.5 shadow-xl ${
            isVictory
              ? 'bg-amber-500/20 text-amber-400 border border-amber-400/50 shadow-amber-500/10'
              : 'bg-red-500/20 text-red-400 border border-red-400/50 shadow-red-500/10'
          }`}
        >
          {isVictory ? '🏆' : '💀'}
        </div>

        <h1
          className={`text-xl font-black tracking-tight mb-0.5 uppercase ${
            isVictory ? 'text-amber-400' : 'text-red-400'
          }`}
        >
          {isVictory ? 'Tactical Victory!' : 'Defeat'}
        </h1>
        <p className="text-xs text-slate-400">
          {isVictory
            ? `Floor ${result.floorNumber} Cleared Successfully`
            : `Fell at Floor ${result.floorNumber}. Adjust your squad and try again.`}
        </p>
      </div>

      {/* Combat Metrics Summary */}
      <div className="my-4 p-3.5 rounded-lg bg-[#0e131d] border border-[#1e293b] flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#1e293b]">
          <span className="text-slate-400">Rounds Taken:</span>
          <span className="font-bold font-mono text-slate-200">{result.roundsUsed} / 10</span>
        </div>

        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#1e293b]">
          <span className="text-slate-400">Remaining Squad HP:</span>
          <span className="font-bold font-mono text-emerald-400">
            {Math.round(result.remainingHpPercent)}%
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Calculated Score:</span>
          <span className="font-black font-mono text-amber-400 text-sm">
            {result.score.toLocaleString()}
          </span>
        </div>

        {/* First Clear Rewards */}
        {result.isFirstClear && result.rewardsGranted && (
          <div className="mt-1 pt-2.5 border-t border-amber-500/30 bg-amber-500/10 p-2.5 rounded-md">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>First Clear Reward Claimed!</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono text-slate-300">
              {result.rewardsGranted.gold > 0 && <div className="px-2 py-0.5 bg-[#080b12] rounded border border-amber-500/30 text-amber-300">💰 +{result.rewardsGranted.gold} Gold</div>}
              {result.rewardsGranted.essence > 0 && <div className="px-2 py-0.5 bg-[#080b12] rounded border border-cyan-500/30 text-cyan-300">🧪 +{result.rewardsGranted.essence} Essence</div>}
              {result.rewardsGranted.stones > 0 && <div className="px-2 py-0.5 bg-[#080b12] rounded border border-purple-500/30 text-purple-300">💎 +{result.rewardsGranted.stones} Stones</div>}
              {result.rewardsGranted.shards > 0 && <div className="px-2 py-0.5 bg-[#080b12] rounded border border-amber-500/30 text-amber-300">⭐ +{result.rewardsGranted.shards} Shards</div>}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {isVictory && result.floorNumber < 30 && (
          <button
            onClick={onNextFloor}
            className="w-full py-3 rounded-md btn-game-amber font-black text-xs text-slate-950 flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer uppercase tracking-wider"
          >
            <span>Next Floor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onRetry}
          className="w-full py-2.5 rounded-md btn-game-dark font-bold text-xs text-slate-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Floor</span>
        </button>

        <button
          onClick={onLobby}
          className="w-full py-2.5 rounded-md bg-transparent hover:bg-[#0e131d] text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer border border-[#1e293b]"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Back to Tower Lobby</span>
        </button>
      </div>
    </div>
  );
};

export default TowerResultsSheet;
