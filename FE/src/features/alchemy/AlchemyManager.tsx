'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { FlaskConical, Sparkles, Check, Flame, Shield, Coins } from 'lucide-react';

const ALCHEMY_RECIPES = [
  {
    id: 'SCROLL_OF_MIGHT',
    name: 'Scroll of Might',
    description: 'Imbues weapons with +10% Total Damage boost.',
    icon: '📜',
    buff: '+10% Total Damage',
    goldCost: 500,
    gemsCost: 20,
    color: 'from-orange-500/20 to-red-500/10 border-orange-500/30 text-orange-300',
  },
  {
    id: 'SCROLL_OF_AEGIS',
    name: 'Scroll of Aegis',
    description: 'Imbues armor or shields with +5% Damage Reduction.',
    icon: '📜',
    buff: '+5% Damage Reduction',
    goldCost: 500,
    gemsCost: 20,
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-300',
  },
  {
    id: 'SCROLL_OF_FORTUNE',
    name: 'Scroll of Fortune',
    description: 'Imbues accessories with +20% Gold and +10% Gear Chest drop rate.',
    icon: '📜',
    buff: '+20% Gold • +10% Chest Drop',
    goldCost: 500,
    gemsCost: 20,
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-300',
  },
];

export default function AlchemyManager() {
  const { gold, gems, inventory, templates, brewBlessing, blessItemWithScroll, addFloatingText } = useGameStore();
  const [selectedRecipe, setSelectedRecipe] = useState(ALCHEMY_RECIPES[0]);
  const [isBrewing, setIsBrewing] = useState(false);
  const [targetItemId, setTargetItemId] = useState<string | null>(null);

  const canAfford = gold >= selectedRecipe.goldCost && gems >= selectedRecipe.gemsCost;

  const handleBrewAndApply = async () => {
    if (!canAfford || isBrewing || !targetItemId) return;

    setIsBrewing(true);
    await new Promise((r) => setTimeout(r, 600));

    const success = await brewBlessing(selectedRecipe.id);
    if (success) {
      await blessItemWithScroll(targetItemId, selectedRecipe.id);
      addFloatingText(`✨ APPLIED ${selectedRecipe.name.toUpperCase()}!`, 180, 80, '#10b981', true);
    }
    setIsBrewing(false);
  };

  return (
    <div className="flex flex-col gap-3 p-3 text-xs overflow-y-auto flex-1 pb-16">
      {/* 1. Alchemy Cauldron Vessel */}
      <div className="bg-game-card p-4 rounded-xl border border-game-border flex flex-col items-center justify-center gap-3 relative shadow-inner">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-3xl shadow-lg border border-emerald-400/50 ${isBrewing ? 'animate-bounce' : 'animate-pulse'}`}>
          🧪
        </div>

        <div className="text-center">
          <h3 className="font-bold text-sm text-slate-100">Ancient Alchemy Laboratory</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Brew Blessing Scrolls to permanently enchant your gear with powerful passives.
          </p>
        </div>

        {/* Recipe Selection */}
        <div className="w-full grid grid-cols-3 gap-2 mt-1">
          {ALCHEMY_RECIPES.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition text-center ${
                selectedRecipe.id === recipe.id
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-400'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-xl">{recipe.icon}</span>
              <span className="font-bold text-[10px] text-slate-200 truncate w-full">
                {recipe.name}
              </span>
              <span className="text-[9px] text-emerald-400 font-semibold">{recipe.buff}</span>
            </div>
          ))}
        </div>

        {/* Cost & Recipe Info */}
        <div className="w-full bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-[11px] space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Blessing Effect:</span>
            <span className="font-bold text-emerald-400">{selectedRecipe.buff}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Brewing Cost:</span>
            <span className="font-semibold text-yellow-400">
              {selectedRecipe.goldCost} 🪙 + {selectedRecipe.gemsCost} 💎
            </span>
          </div>
        </div>

        {/* Target Item Selection from Bag */}
        <div className="w-full">
          <label className="block text-[11px] text-slate-300 font-semibold mb-1.5">
            Select Gear Piece from Bag to Enchant:
          </label>

          {inventory.length === 0 ? (
            <p className="text-[10px] text-slate-500 italic py-2 text-center">Inventory bag is empty.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {inventory.map((item) => {
                const tmpl = templates[item.templateId];
                const isTarget = targetItemId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setTargetItemId(item.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                      isTarget
                        ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">{tmpl?.icon || '📦'}</span>
                    <span className="text-[9px] font-bold text-slate-200 truncate w-full text-center">
                      {tmpl?.name || 'Equipment'}
                    </span>
                    <span className="text-[8px] text-amber-400 font-semibold">+{item.enhanceLevel}</span>
                    {item.blessingId && (
                      <span className="text-[7px] text-cyan-300 bg-cyan-500/20 px-1 rounded truncate">
                        Blessed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleBrewAndApply}
          disabled={!canAfford || isBrewing || !targetItemId}
          className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-98 ${
            canAfford && targetItemId && !isBrewing
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:brightness-110 shadow-emerald-500/25'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Sparkles size={15} />
          <span>{isBrewing ? 'Brewing Potion...' : 'BREW & ENCHANT GEAR'}</span>
        </button>
      </div>
    </div>
  );
}
