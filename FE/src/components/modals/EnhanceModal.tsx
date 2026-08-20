'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ModalShell } from '../ui/ModalShell';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Hammer,
  Coins,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { RARITY_COLORS } from '@/types/enums';

export const EnhanceModal: React.FC = () => {
  const enhancingItem = useGameStore((state) => state.enhancingItem);
  const templates = useGameStore((state) => state.templates);
  const gold = useGameStore((state) => state.gold);
  const enhanceStones = useGameStore((state) => state.enhanceStones);
  const closeEnhanceModal = useGameStore((state) => state.closeEnhanceModal);
  const enhanceItem = useGameStore((state) => state.enhanceItem);
  const addFloatingText = useGameStore((state) => state.addFloatingText);

  const [useInsurance, setUseInsurance] = useState(false);
  const [isHammering, setIsHammering] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; text: string } | null>(null);

  if (!enhancingItem) return null;

  const template = templates[enhancingItem.templateId];
  if (!template) return null;

  const currentLvl = enhancingItem.enhanceLevel;
  const isMax = currentLvl >= 15;
  const ENHANCE_GOLD_COSTS = [
    100, 200, 300, 500, 800, 1200, 1700, 2300, 3000, 4000, 5500, 7500, 10000, 14000, 20000
  ];
  const ENHANCE_STONE_COSTS = [
    1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 18, 25
  ];

  const goldCost = currentLvl < 15 ? ENHANCE_GOLD_COSTS[currentLvl] : 0;
  const stonesCost = currentLvl < 15 ? ENHANCE_STONE_COSTS[currentLvl] : 0;
  const canAfford = gold >= goldCost && enhanceStones >= stonesCost;

  const handleEnhance = async () => {
    if (isMax || !canAfford || isHammering) return;

    setIsHammering(true);
    setLastResult(null);

    const result = await enhanceItem(enhancingItem);
    setIsHammering(false);

    if (result.success) {
      setLastResult({ success: true, text: `Enhance Successful (+${result.newLevel})!` });
      addFloatingText(`ENHANCE +${result.newLevel}!`, 180, 80, '#10b981', true);
    } else {
      setLastResult({ success: false, text: `Enhance Failed. Current Level: +${result.newLevel}` });
      addFloatingText(`FAILED!`, 180, 80, '#ef4444', true);
    }
  };

  const color = RARITY_COLORS[enhancingItem.rarity] || '#94A3B8';

  return (
    <ModalShell
      isOpen={!!enhancingItem}
      onClose={closeEnhanceModal}
      icon={<Hammer size={18} className="text-amber-400" />}
      title="Forge & Reinforce"
      description="Deterministic Equipment Stat Scaling"
    >
      <div className="space-y-3 select-none">
        {/* Item Preview Card */}
        <div className="flex items-center gap-3 p-3 bg-[#0e131d] border border-[#1e293b] rounded-lg shadow-sm">
          <div
            style={{ borderColor: color, color }}
            className="w-12 h-12 rounded-lg border-2 bg-[#080b12] flex items-center justify-center font-black text-xl shrink-0 shadow-inner"
          >
            {template.icon || template.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs truncate text-slate-100">{template.name}</span>
              <span className="text-amber-400 font-mono font-black text-xs">+{currentLvl}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px]">
              <span style={{ color }} className="font-bold uppercase">
                {enhancingItem.rarity}
              </span>
              <span>•</span>
              <span className="text-slate-400">iLvl {enhancingItem.itemLevel}</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-mono font-bold">
              +1.5% Base stats per level (Max +15)
            </div>
          </div>
        </div>

        {/* Success Rate & Costs */}
        {!isMax ? (
          <div className="space-y-1.5 p-3 bg-[#080b12] border border-[#1e293b] rounded-lg text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Success Chance:</span>
              <span className="font-bold text-emerald-400">
                100% (Guaranteed)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Gold Required:</span>
              <span className={`font-bold flex items-center gap-1 ${gold >= goldCost ? 'text-amber-400' : 'text-rose-400'}`}>
                <Coins size={12} aria-hidden="true" />
                <span>{goldCost.toLocaleString()} / {gold.toLocaleString()}</span>
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Enhance Stones:</span>
              <span className={`font-bold flex items-center gap-1 ${enhanceStones >= stonesCost ? 'text-cyan-400' : 'text-rose-400'}`}>
                <Hammer size={12} aria-hidden="true" />
                <span>{stonesCost} / {enhanceStones}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-950/40 rounded-lg text-center text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 border border-amber-500/40">
            <Crown size={14} aria-hidden="true" />
            <span>Equipment is at Maximum Enhancement (+15)</span>
          </div>
        )}

        {/* Result Message */}
        {lastResult && (
          <div
            className={`p-2.5 rounded-lg text-xs text-center font-bold flex items-center justify-center gap-1.5 border ${
              lastResult.success
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
            }`}
          >
            {lastResult.success ? (
              <CheckCircle2 size={14} aria-hidden="true" />
            ) : (
              <XCircle size={14} aria-hidden="true" />
            )}
            <span>{lastResult.text}</span>
          </div>
        )}

        {/* Action Button */}
        {!isMax ? (
          <Button
            variant="accent"
            fullWidth
            onClick={handleEnhance}
            disabled={!canAfford || isHammering}
            isLoading={isHammering}
            className="font-black uppercase tracking-wider min-h-[44px]"
          >
            <Hammer size={14} className="mr-1" aria-hidden="true" />
            <span>{isHammering ? 'Forging Metal...' : `Reinforce to +${currentLvl + 1}`}</span>
          </Button>
        ) : (
          <Button variant="secondary" fullWidth onClick={closeEnhanceModal} className="min-h-[44px]">
            Close
          </Button>
        )}
      </div>
    </ModalShell>
  );
};

export default EnhanceModal;
