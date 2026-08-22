import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { ChevronRight } from 'lucide-react';
import { ItemInstance } from '@/types/item.types';
import { RARITY_COLORS } from '@/types/enums';
import { ENHANCE_GOLD_COSTS, ENHANCE_STONE_COSTS } from '../blacksmithConstants';

export const BlacksmithEnhanceTab: React.FC = () => {
  const gold = useGameStore((state) => state.gold);
  const enhanceStones = useGameStore((state) => state.enhanceStones);
  const inventory = useGameStore((state) => state.inventory);
  const templates = useGameStore((state) => state.templates);
  const enhanceItem = useGameStore((state) => state.enhanceItem);

  const [selectedEnhanceItemId, setSelectedEnhanceItemId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Selected item for enhance
  const equippableItems = inventory.filter(
    (it: ItemInstance) => !it.templateId.startsWith('mat_') && !it.templateId.startsWith('chest_')
  );
  const targetEnhanceItem = equippableItems.find((it: ItemInstance) => it.id === selectedEnhanceItemId) || equippableItems[0];
  const currentEnhanceLvl = targetEnhanceItem?.enhanceLevel || 0;
  const isMaxEnhance = currentEnhanceLvl >= 15;
  const enhanceGoldCost = currentEnhanceLvl < 15 ? ENHANCE_GOLD_COSTS[currentEnhanceLvl] : 0;
  const enhanceStoneCost = currentEnhanceLvl < 15 ? ENHANCE_STONE_COSTS[currentEnhanceLvl] : 0;
  const canAffordEnhance = gold >= enhanceGoldCost && enhanceStones >= enhanceStoneCost;

  // ─── Enhance Handler ────────────────────────────────────────────────────────
  const handleEnhance = async () => {
    if (!targetEnhanceItem || isMaxEnhance || !canAffordEnhance || isProcessing) return;

    setIsProcessing(true);
    await enhanceItem(targetEnhanceItem);
    setIsProcessing(false);
  };

  if (equippableItems.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-xs bg-[#0e131d] rounded-lg border border-[#1e293b]">
        No equippable gear found in inventory. Craft or acquire weapons and armor to enhance!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Item Picker Grid */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
          Select Gear to Upgrade
        </span>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 bg-[#080b12] rounded-lg border border-[#1e293b]">
          {equippableItems.map((it: ItemInstance) => {
            const tpl = templates[it.templateId];
            const isSelected = targetEnhanceItem?.id === it.id;
            const rColor = RARITY_COLORS[it.rarity] || '#94A3B8';

            return (
              <button
                type="button"
                key={it.id}
                onClick={() => setSelectedEnhanceItemId(it.id)}
                className={`p-2 rounded-md border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/40'
                    : 'border-[#1e293b] bg-[#101623] hover:bg-[#161e30]'
                }`}
              >
                <span className="font-bold text-xs truncate" style={{ color: rColor }}>
                  {tpl?.name || it.templateId}
                </span>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">{tpl?.slot || 'GEAR'}</span>
                  <span className="font-black text-amber-400">+{it.enhanceLevel || 0}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhance Console Card */}
      {targetEnhanceItem && (
        <div className="flex flex-col gap-2.5 p-3.5 bg-[#0e131d] border border-amber-500/40 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-black text-sm text-slate-100">
                {templates[targetEnhanceItem.templateId]?.name || targetEnhanceItem.templateId}
              </h4>
              <span className="text-[10px] font-bold uppercase font-mono" style={{ color: RARITY_COLORS[targetEnhanceItem.rarity] }}>
                {targetEnhanceItem.rarity} · {templates[targetEnhanceItem.templateId]?.slot}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#080b12] border border-amber-500/40 rounded font-mono text-sm font-black text-amber-400">
              <span>+{currentEnhanceLvl}</span>
              {!isMaxEnhance && (
                <>
                  <ChevronRight size={14} className="text-slate-600" />
                  <span className="text-emerald-400">+{currentEnhanceLvl + 1}</span>
                </>
              )}
            </div>
          </div>

          {/* Level Scaling Preview */}
          <div className="p-2 bg-[#080b12] border border-[#1e293b] rounded text-xs flex justify-between items-center font-mono">
            <span className="text-slate-400 font-sans">Enhancement Bonus:</span>
            <span className="font-bold text-emerald-400">
              +{currentEnhanceLvl * 5}% → +{(currentEnhanceLvl + 1) * 5}% Base Stats
            </span>
          </div>

          {/* Cost Box */}
          {!isMaxEnhance ? (
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <div className={`p-2 rounded border ${gold >= enhanceGoldCost ? 'bg-[#101623] border-[#1e293b] text-slate-200' : 'bg-rose-950/30 border-rose-900 text-rose-300'}`}>
                <span className="text-[10px] text-slate-400 font-sans block">Required Gold:</span>
                <span className="font-bold">{enhanceGoldCost.toLocaleString()} Gold</span>
              </div>
              <div className={`p-2 rounded border ${enhanceStones >= enhanceStoneCost ? 'bg-[#101623] border-[#1e293b] text-slate-200' : 'bg-rose-950/30 border-rose-900 text-rose-300'}`}>
                <span className="text-[10px] text-slate-400 font-sans block">Enhance Stones:</span>
                <span className="font-bold">{enhanceStoneCost} Stones</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded text-center text-amber-300 font-black text-xs">
              Maximum Enhancement Level (+15) Reached!
            </div>
          )}

          {/* Upgrade Button */}
          {!isMaxEnhance && (
            <Button
              variant="accent"
              size="md"
              disabled={!canAffordEnhance || isProcessing}
              onClick={handleEnhance}
              className="w-full min-h-[44px] font-black uppercase tracking-wider"
            >
              {isProcessing ? 'Hammering Metal…' : canAffordEnhance ? `Reinforce (+${currentEnhanceLvl + 1})` : 'Insufficient Resources'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
