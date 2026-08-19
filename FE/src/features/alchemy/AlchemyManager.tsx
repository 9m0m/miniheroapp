'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { FlaskConical, Sparkles, Scroll } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const ALCHEMY_RECIPES = [
  {
    id: 'SCROLL_OF_MIGHT',
    name: 'Scroll of Might',
    description: 'Imbues weapons with +10% Total Damage boost.',
    buff: '+10% Total Damage',
    goldCost: 500,
    gemsCost: 20,
  },
  {
    id: 'SCROLL_OF_AEGIS',
    name: 'Scroll of Aegis',
    description: 'Imbues armor or shields with +5% Damage Reduction.',
    buff: '+5% Damage Reduction',
    goldCost: 500,
    gemsCost: 20,
  },
  {
    id: 'SCROLL_OF_FORTUNE',
    name: 'Scroll of Fortune',
    description: 'Imbues accessories with +20% Gold and +10% Gear Chest drop rate.',
    buff: '+20% Gold • +10% Chest Drop',
    goldCost: 500,
    gemsCost: 20,
  },
];

export default function AlchemyManager() {
  const gold = useGameStore((state) => state.gold);
  const gems = useGameStore((state) => state.gems);
  const inventory = useGameStore((state) => state.inventory);
  const brewBlessing = useGameStore((state) => state.brewBlessing);
  const blessItemWithScroll = useGameStore((state) => state.blessItemWithScroll);
  const addFloatingText = useGameStore((state) => state.addFloatingText);

  const [selectedRecipe, setSelectedRecipe] = useState(ALCHEMY_RECIPES[0]);
  const [isBrewing, setIsBrewing] = useState(false);
  const [targetItemId, setTargetItemId] = useState<string | null>(null);

  const canAfford = gold >= selectedRecipe.goldCost && gems >= selectedRecipe.gemsCost;

  const handleBrewAndApply = async () => {
    if (!canAfford || isBrewing || !targetItemId) return;

    setIsBrewing(true);
    await new Promise((r) => setTimeout(r, 600));

    const success = brewBlessing(selectedRecipe.id);
    if (success) {
      const item = inventory.find((i) => i.id === targetItemId);
      if (item) {
        blessItemWithScroll(item, selectedRecipe.id);
      }
      addFloatingText(`Applied ${selectedRecipe.name}!`, 180, 80, '#10b981', true);
    }
    setIsBrewing(false);
  };

  return (
    <div className="flex flex-col gap-3 p-3 text-xs overflow-y-auto flex-1 pb-16 max-w-lg mx-auto select-none">
      {/* 1. Alchemy Cauldron Vessel */}
      <Card variant="base" padding="md" className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <FlaskConical size={24} aria-hidden="true" />
        </div>

        <div className="text-center">
          <h3 className="font-bold text-sm text-slate-100">Alchemy Laboratory</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Brew Blessing Scrolls to permanently enchant your gear with powerful passives.
          </p>
        </div>

        {/* Recipe Selection */}
        <div className="w-full grid grid-cols-3 gap-2 mt-1">
          {ALCHEMY_RECIPES.map((recipe) => {
            const isSelected = selectedRecipe.id === recipe.id;
            return (
              <button
                type="button"
                key={recipe.id}
                aria-pressed={isSelected}
                onClick={() => setSelectedRecipe(recipe)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center min-h-[72px] focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400 shadow-sm'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Scroll size={16} className={isSelected ? 'text-emerald-300' : 'text-slate-400'} />
                <span className="font-bold text-xs text-slate-200 truncate w-full">
                  {recipe.name}
                </span>
                <span className="text-xs text-emerald-400 font-medium">{recipe.buff}</span>
              </button>
            );
          })}
        </div>

        {/* Target Item Selection */}
        <div className="w-full space-y-1.5 pt-2 border-t border-slate-800">
          <label className="block text-xs text-slate-300 font-semibold">
            Select Gear to Enchant:
          </label>
          {inventory.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2 text-center">No items in backpack.</p>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
              {inventory.map((item) => {
                const isSelected = targetItemId === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    aria-pressed={isSelected}
                    onClick={() => setTargetItemId(item.id)}
                    className={`p-2 rounded-lg border text-left transition focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-200 truncate">{item.templateId}</div>
                    <div className="text-xs font-mono text-slate-400">+{item.enhanceLevel}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="w-full pt-1">
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleBrewAndApply}
            disabled={!canAfford || isBrewing || !targetItemId}
            isLoading={isBrewing}
          >
            <Sparkles size={15} className="mr-1.5" />
            <span>
              Brew & Enchant ({selectedRecipe.goldCost} Gold, {selectedRecipe.gemsCost} Gems)
            </span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
