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

  // Cost calculations: Locked backend cost table (+1.5%/lvl, max +15, 100% success)
  const goldCost = currentLvl < 15 ? ENHANCE_GOLD_COSTS[currentLvl] : 0;
  const stonesCost = currentLvl < 15 ? ENHANCE_STONE_COSTS[currentLvl] : 0;
  const successChance = 100;

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

  const rarityVariant = `rarity-${enhancingItem.rarity.toLowerCase()}` as any;

  return (
    <ModalShell
      isOpen={!!enhancingItem}
      onClose={closeEnhanceModal}
      icon={<Hammer size={18} className="text-amber-400" />}
      title="Forge & Enhance"
      description="Deterministic Equipment Power Reinforcement"
    >
      <div className="space-y-3">
        {/* Item Preview Card */}
        <Card variant="base" padding="md" className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center text-2xl shrink-0">
            {template.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs truncate text-slate-100">{template.name}</span>
              <span className="text-amber-400 font-extrabold text-xs">+{currentLvl}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={rarityVariant} size="sm">
                {enhancingItem.rarity}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">iLvl {enhancingItem.itemLevel}</span>
            </div>
            <div className="text-xs text-emerald-400 mt-1 font-semibold">
              +1.5% Base stats scaling per enhance level (Max +15)
            </div>
          </div>
        </Card>

        {/* Success Rate & Costs */}
        {!isMax ? (
          <Card variant="raised" padding="md" className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Success Rate:</span>
              <span className="font-bold font-mono text-emerald-400">
                100% (Guaranteed)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Gold Required:</span>
              <span className={`font-mono font-semibold flex items-center gap-1 ${gold >= goldCost ? 'text-yellow-400' : 'text-rose-400'}`}>
                <Coins size={12} aria-hidden="true" />
                <span>{goldCost.toLocaleString()} / {gold.toLocaleString()}</span>
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Enhance Stones:</span>
              <span className={`font-mono font-semibold flex items-center gap-1 ${enhanceStones >= stonesCost ? 'text-purple-400' : 'text-rose-400'}`}>
                <Hammer size={12} aria-hidden="true" />
                <span>{stonesCost} / {enhanceStones}</span>
              </span>
            </div>
          </Card>
        ) : (
          <Card variant="raised" padding="md" className="text-center text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 border-amber-500/30">
            <Crown size={14} aria-hidden="true" />
            <span>Equipment is at Maximum Enhance Level (+15)</span>
          </Card>
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
          >
            <Hammer size={14} className="mr-1" aria-hidden="true" />
            <span>{isHammering ? 'Forging...' : `Enhance to +${currentLvl + 1}`}</span>
          </Button>
        ) : (
          <Button variant="secondary" fullWidth onClick={closeEnhanceModal}>
            Close
          </Button>
        )}
      </div>
    </ModalShell>
  );
};
