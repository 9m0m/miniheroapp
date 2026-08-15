'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, Hammer, Shield, Sparkles, AlertTriangle, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { ItemRarity } from '../../types/game.types';

export const EnhanceModal: React.FC = () => {
  const {
    enhancingItem,
    templates,
    gold,
    enhanceStones,
    closeEnhanceModal,
    enhanceItem,
    addFloatingText,
  } = useGameStore();

  const [useInsurance, setUseInsurance] = useState(false);
  const [isHammering, setIsHammering] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; text: string } | null>(null);

  if (!enhancingItem) return null;

  const template = templates[enhancingItem.templateId];
  if (!template) return null;

  const currentLvl = enhancingItem.enhanceLevel;
  const isMax = currentLvl >= 15;

  // Cost & Success calculations
  let goldCost = 200 * (currentLvl + 1);
  let stonesCost = 1;
  let successChance = 100;

  if (currentLvl >= 5 && currentLvl < 10) {
    goldCost = 500 * (currentLvl + 1);
    stonesCost = 2;
    successChance = Math.max(50, 85 - (currentLvl - 5) * 7);
  } else if (currentLvl >= 10) {
    goldCost = 1000 * (currentLvl + 1);
    stonesCost = 3;
    successChance = Math.max(20, 40 - (currentLvl - 10) * 5);
  }

  const canAfford = gold >= goldCost && enhanceStones >= stonesCost;
  const hasDowngradeRisk = currentLvl >= 10;

  const handleEnhance = async () => {
    if (isMax || !canAfford || isHammering) return;

    setIsHammering(true);
    setLastResult(null);

    // Hammer animation duration
    await new Promise((r) => setTimeout(r, 600));

    const success = await enhanceItem(useInsurance);
    setIsHammering(false);

    if (success) {
      setLastResult({ success: true, text: `🎉 ENHANCE SUCCESS (+${currentLvl + 1})!` });
      addFloatingText(`✨ ENHANCE +${currentLvl + 1}!`, 180, 80, '#10b981', true);
    } else {
      if (hasDowngradeRisk && !useInsurance) {
        setLastResult({ success: false, text: `💥 FAILED! Degraded to +${Math.max(10, currentLvl - 1)}` });
        addFloatingText(`💥 DEGRADED -1!`, 180, 80, '#ef4444', true);
      } else {
        setLastResult({ success: false, text: `🛡️ FAILED! Maintained level +${currentLvl}` });
        addFloatingText(`🛡️ FAILED (Protected)`, 180, 80, '#f59e0b', false);
      }
    }
  };

  const getRarityBadgeColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'COMMON': return 'text-slate-400 border-slate-700 bg-slate-800';
      case 'UNCOMMON': return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'RARE': return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
      case 'EPIC': return 'text-purple-400 border-purple-500/40 bg-purple-500/10';
      case 'LEGENDARY': return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 border border-amber-500/30 p-5 shadow-2xl text-white">
        {/* Close */}
        <button
          onClick={closeEnhanceModal}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-1 border border-amber-500/30">
            <Hammer size={13} />
            <span>FORGE & ENHANCE</span>
          </div>
          <h3 className="text-base font-bold text-slate-100">Equipment Power Reinforcement</h3>
        </div>

        {/* Item Preview Card */}
        <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 flex items-center gap-3.5 mb-3.5">
          <div className={`w-14 h-14 rounded-xl border flex items-center justify-center text-3xl flex-shrink-0 ${getRarityBadgeColor(enhancingItem.rarity)} ${isHammering ? 'animate-bounce' : ''}`}>
            {template.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs truncate text-slate-100">{template.name}</span>
              <span className="text-amber-400 font-extrabold text-xs">+{currentLvl}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Rarity: <span className="font-semibold text-slate-300">{enhancingItem.rarity}</span> • iLvl {enhancingItem.itemLevel}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              +10% Base stats scaling per enhance level
            </div>
          </div>
        </div>

        {/* Success Rate & Costs */}
        {!isMax ? (
          <div className="space-y-2 mb-4 bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Success Rate:</span>
              <span className={`font-bold ${successChance >= 70 ? 'text-emerald-400' : successChance >= 40 ? 'text-yellow-400' : 'text-orange-400'}`}>
                {successChance}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Gold Cost:</span>
              <span className={`font-semibold ${gold >= goldCost ? 'text-yellow-400' : 'text-red-400'}`}>
                {goldCost.toLocaleString()} / {gold.toLocaleString()} 🪙
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Enhance Stones:</span>
              <span className={`font-semibold ${enhanceStones >= stonesCost ? 'text-purple-400' : 'text-red-400'}`}>
                {stonesCost} / {enhanceStones} 🪨
              </span>
            </div>

            {/* Downgrade Risk & Lucky Forge Insurance */}
            {hasDowngradeRisk && (
              <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-orange-400">
                  <AlertTriangle size={13} className="flex-shrink-0" />
                  <span>Level +11~+15: Failure will <strong>downgrade 1 level!</strong></span>
                </div>

                <label className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 cursor-pointer hover:bg-amber-500/15 transition">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300">
                    <ShieldCheck size={14} className="text-amber-400" />
                    <span>Lucky Forge Insurance Charm</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useInsurance}
                    onChange={(e) => setUseInsurance(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-amber-400 font-bold text-xs bg-amber-500/10 rounded-xl border border-amber-500/30 mb-4">
            👑 Equipment is at Maximum Enhance Level (+15)!
          </div>
        )}

        {/* Result Message */}
        {lastResult && (
          <div className={`p-2.5 rounded-xl text-xs text-center font-bold mb-3 border animate-fade-in ${
            lastResult.success ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-red-500/15 text-red-300 border-red-500/30'
          }`}>
            {lastResult.text}
          </div>
        )}

        {/* Action Button */}
        {!isMax && (
          <button
            onClick={handleEnhance}
            disabled={!canAfford || isHammering}
            className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-98 ${
              canAfford
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Hammer size={16} className={isHammering ? 'animate-spin' : ''} />
            <span>{isHammering ? 'Forging in progress...' : `ENHANCE TO +${currentLvl + 1}`}</span>
          </button>
        )}
      </div>
    </div>
  );
};
