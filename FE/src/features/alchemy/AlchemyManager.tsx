'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Trash2, Sparkles, AlertTriangle, CheckSquare, Square, RefreshCw, Coins } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ItemInstance } from '@/types/item.types';
import { ItemRarity, RARITY_COLORS } from '@/types/enums';

const RARITY_DISMANTLE_RATES: Record<ItemRarity, { gold: number; stones: number; ingots: number }> = {
  COMMON: { gold: 50, stones: 0, ingots: 1 },
  UNCOMMON: { gold: 150, stones: 0, ingots: 2 },
  RARE: { gold: 500, stones: 1, ingots: 4 },
  EPIC: { gold: 2000, stones: 3, ingots: 8 },
  LEGENDARY: { gold: 10000, stones: 10, ingots: 20 },
  MYTHIC: { gold: 25000, stones: 25, ingots: 50 },
  ANCIENT: { gold: 50000, stones: 50, ingots: 100 },
};

export default function AlchemyManager() {
  const inventory = useGameStore((state) => state.inventory);
  const templates = useGameStore((state) => state.templates);
  const gold = useGameStore((state) => state.gold);
  const enhanceStones = useGameStore((state) => state.enhanceStones);
  const addFloatingText = useGameStore((state) => state.addFloatingText);

  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [isDismantling, setIsDismantling] = useState(false);

  // Filter only dismantleable gear (exclude chests and basic materials)
  const dismantleableItems = inventory.filter(
    (it: ItemInstance) => !it.templateId.startsWith('chest_') && !it.templateId.startsWith('mat_')
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selectedItemIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItemIds(next);
  };

  const selectAllCommonUncommon = () => {
    const next = new Set<string>();
    dismantleableItems.forEach((it: ItemInstance) => {
      if (it.rarity === 'COMMON' || it.rarity === 'UNCOMMON') {
        next.add(it.id);
      }
    });
    setSelectedItemIds(next);
  };

  const clearSelection = () => {
    setSelectedItemIds(new Set());
  };

  // Calculate yield
  let totalGoldYield = 0;
  let totalStonesYield = 0;
  let totalIngotsYield = 0;

  selectedItemIds.forEach((id) => {
    const item = dismantleableItems.find((it: ItemInstance) => it.id === id);
    if (item) {
      const rate = RARITY_DISMANTLE_RATES[item.rarity] || RARITY_DISMANTLE_RATES.COMMON;
      const enhanceMultiplier = 1 + (item.enhanceLevel || 0) * 0.5;
      totalGoldYield += Math.round(rate.gold * enhanceMultiplier);
      totalStonesYield += rate.stones;
      totalIngotsYield += rate.ingots;
    }
  });

  const handleDismantle = async () => {
    if (selectedItemIds.size === 0 || isDismantling) return;

    setIsDismantling(true);
    await new Promise((r) => setTimeout(r, 600));

    // Remove dismantled items from inventory
    const remainingInventory = inventory.filter((it: ItemInstance) => !selectedItemIds.has(it.id));

    // If ingots were yielded, add them as material item
    if (totalIngotsYield > 0) {
      remainingInventory.push({
        id: `mat_ingot_${Date.now()}`,
        templateId: 'mat_iron_ingot',
        itemLevel: 1,
        rarity: 'COMMON',
        enhanceLevel: 0,
        sockets: [],
      });
    }

    useGameStore.setState({
      gold: gold + totalGoldYield,
      enhanceStones: enhanceStones + totalStonesYield,
      inventory: remainingInventory,
    });

    addFloatingText?.(`Recycled ${selectedItemIds.size} items for +${totalGoldYield.toLocaleString()} Gold!`, 180, 80, '#f59e0b', true);
    setSelectedItemIds(new Set());
    setIsDismantling(false);
  };

  return (
    <div className="flex flex-col gap-2.5 p-3 text-xs overflow-y-auto flex-1 pb-16 max-w-lg mx-auto select-none bg-[#06080e]">
      {/* Header Info */}
      <div className="p-3 bg-[#0e131d] border border-[#1e293b] rounded-lg flex items-center justify-between shadow-sm">
        <div>
          <h4 className="font-black text-sm text-slate-100 flex items-center gap-1.5">
            <Trash2 size={16} className="text-rose-400" />
            <span>Salvage & Dismantle Station</span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Scrap unwanted equipment to reclaim Gold, Ingots, and Enhancement Stones.
          </p>
        </div>
      </div>

      {/* Quick Select Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={selectAllCommonUncommon}
          className="flex-1 py-2 px-2.5 bg-[#0e131d] border border-[#1e293b] hover:border-slate-700 rounded-md text-[11px] font-bold text-slate-300 transition-colors cursor-pointer"
        >
          Select All Common / Uncommon
        </button>
        {selectedItemIds.size > 0 && (
          <button
            type="button"
            onClick={clearSelection}
            className="py-2 px-2.5 bg-[#0e131d] border border-[#1e293b] text-slate-400 hover:text-slate-200 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
          >
            Clear ({selectedItemIds.size})
          </button>
        )}
      </div>

      {/* Item Selection Grid */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
          Inventory Gear ({dismantleableItems.length})
        </span>

        {dismantleableItems.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs bg-[#0e131d] rounded-lg border border-[#1e293b]">
            No equipment available for dismantling.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto p-1 bg-[#080b12] rounded-lg border border-[#1e293b]">
            {dismantleableItems.map((it: ItemInstance) => {
              const tpl = templates[it.templateId];
              const isSelected = selectedItemIds.has(it.id);
              const rColor = RARITY_COLORS[it.rarity] || '#94A3B8';

              return (
                <button
                  type="button"
                  key={it.id}
                  onClick={() => toggleSelect(it.id)}
                  className={`p-2 rounded-md border text-left flex items-start justify-between gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-500/80 bg-rose-950/30 ring-1 ring-rose-500/40'
                      : 'border-[#1e293b] bg-[#101623] hover:bg-[#161e30]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs truncate block" style={{ color: rColor }}>
                      {tpl?.name || it.templateId}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                      <span>{it.rarity}</span>
                      {it.enhanceLevel > 0 && (
                        <span className="font-black text-amber-400">+{it.enhanceLevel}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-0.5 shrink-0 text-slate-400">
                    {isSelected ? (
                      <CheckSquare size={14} className="text-rose-400" />
                    ) : (
                      <Square size={14} className="text-slate-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Dismantle Summary Card */}
      <div className="flex flex-col gap-2.5 p-3.5 bg-[#0e131d] border border-[#1e293b] rounded-lg shadow-sm">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">Total Selected:</span>
          <span className="font-mono font-black text-rose-400 text-sm">{selectedItemIds.size} Items</span>
        </div>

        <div className="p-2.5 bg-[#080b12] border border-[#1e293b] rounded-md flex flex-col gap-1 text-xs font-mono">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Estimated Yield:</span>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Gold:</span>
            <span className="font-bold text-amber-400">+{totalGoldYield.toLocaleString()} Gold</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Enhancement Stones:</span>
            <span className="font-bold text-cyan-400">+{totalStonesYield} Stones</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Refined Ingots:</span>
            <span className="font-bold text-slate-200">+{totalIngotsYield} Ingots</span>
          </div>
        </div>

        <Button
          variant="danger"
          size="md"
          disabled={selectedItemIds.size === 0 || isDismantling}
          onClick={handleDismantle}
          className="w-full min-h-[44px] font-black uppercase tracking-wider"
        >
          {isDismantling ? 'Recycling Scrap…' : selectedItemIds.size > 0 ? `Dismantle ${selectedItemIds.size} Items` : 'Select Items to Dismantle'}
        </Button>
      </div>
    </div>
  );
}
