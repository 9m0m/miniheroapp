import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ItemInstance } from '@/types/item.types';
import { ItemRarity, RARITY_COLORS } from '@/types/enums';
import { CRAFT_RECIPES, CraftRecipe } from '../blacksmithConstants';

export const BlacksmithCraftTab: React.FC = () => {
  const gold = useGameStore((state) => state.gold);
  const enhanceStones = useGameStore((state) => state.enhanceStones);
  const inventory = useGameStore((state) => state.inventory);
  const addFloatingText = useGameStore((state) => state.addFloatingText);

  const [selectedRecipe, setSelectedRecipe] = useState<CraftRecipe>(CRAFT_RECIPES[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Material check for craft
  const matchingMaterialItem = inventory.find(
    (item: ItemInstance) => item.templateId === selectedRecipe.requiredMaterialId
  );
  const hasRequiredMaterial = Boolean(matchingMaterialItem);
  const canAffordCraft =
    gold >= selectedRecipe.goldCost &&
    enhanceStones >= selectedRecipe.stonesCost &&
    hasRequiredMaterial;

  // ─── Craft Handler ──────────────────────────────────────────────────────────
  const handleCraft = async () => {
    if (!canAffordCraft || isProcessing) return;

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 600));

    let craftedRarity: ItemRarity = 'UNCOMMON';
    if (selectedRecipe.id !== 'craft_ruby_ring') {
      const roll = Math.random() * 100;
      if (roll < 2) craftedRarity = 'LEGENDARY';
      else if (roll < 12) craftedRarity = 'EPIC';
      else if (roll < 40) craftedRarity = 'RARE';
    }

    const newItem: ItemInstance = {
      id: `crafted_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      templateId: selectedRecipe.targetTemplateId,
      itemLevel: 1,
      rarity: craftedRarity,
      enhanceLevel: 0,
      sockets: [],
    };

    const updatedInventory = inventory.filter((it: ItemInstance) => it.id !== matchingMaterialItem?.id);
    updatedInventory.push(newItem);

    useGameStore.setState({
      gold: Math.max(0, gold - selectedRecipe.goldCost),
      enhanceStones: Math.max(0, enhanceStones - selectedRecipe.stonesCost),
      inventory: updatedInventory,
    });

    setIsProcessing(false);
    addFloatingText?.(`Forged [${craftedRarity}] ${selectedRecipe.name}!`, 180, 80, RARITY_COLORS[craftedRarity] || '#f59e0b', true);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Recipe Picker List */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
          Select Blueprint
        </span>
        <div className="grid grid-cols-1 gap-1.5">
          {CRAFT_RECIPES.map((recipe) => {
            const isSelected = selectedRecipe.id === recipe.id;
            const hasMat = inventory.some((it: ItemInstance) => it.templateId === recipe.requiredMaterialId);

            return (
              <button
                type="button"
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className={`p-2.5 rounded-lg border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400/80 bg-gradient-to-r from-amber-950/40 via-[#101623] to-[#0a0e17] ring-1 ring-amber-400/30'
                    : 'border-[#1e293b] bg-[#0e131d] hover:bg-[#131926]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-xs">{recipe.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-amber-300 font-mono border border-slate-800">
                      {recipe.classTag}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{recipe.statsPreview}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${hasMat ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border-rose-500/40'}`}>
                    {hasMat ? 'Ready' : 'Missing Material'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Blueprint Detail Card */}
      <div className="flex flex-col gap-2.5 p-3.5 bg-[#0e131d] border border-amber-500/40 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-amber-300">{selectedRecipe.name}</h4>
            <Badge variant="accent" size="xs">{selectedRecipe.slot}</Badge>
          </div>
          <div className="text-[11px] font-mono font-bold text-emerald-400 mt-1">{selectedRecipe.statsPreview}</div>
        </div>

        {/* Quality Chance Table */}
        <div className="p-2 bg-[#080b12] border border-[#1e293b] rounded text-[10px]">
          <span className="font-bold text-slate-300 block mb-1">Crafting Quality Odds:</span>
          <div className="grid grid-cols-4 gap-1 text-center font-mono">
            <span className="text-emerald-400 bg-emerald-950/40 p-1 rounded border border-emerald-900/50">Uncommon 60%</span>
            <span className="text-blue-400 bg-blue-950/40 p-1 rounded border border-blue-900/50">Rare 28%</span>
            <span className="text-purple-400 bg-purple-950/40 p-1 rounded border border-purple-900/50">Epic 10%</span>
            <span className="text-amber-400 bg-amber-950/40 p-1 rounded font-bold border border-amber-900/50">Legendary 2%</span>
          </div>
        </div>

        {/* Required Materials */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Components:</span>
          <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
            <div className={`p-2 rounded border flex flex-col justify-between ${hasRequiredMaterial ? 'bg-[#101623] border-[#1e293b] text-slate-200' : 'bg-rose-950/30 border-rose-900 text-rose-300'}`}>
              <span className="text-[10px] text-slate-400 font-sans">Frame / Material:</span>
              <span className="font-bold truncate mt-0.5">{selectedRecipe.requiredMaterialName}</span>
            </div>
            <div className="p-2 rounded border bg-[#101623] border-[#1e293b] text-slate-200 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-sans">Cost:</span>
              <span className="font-bold text-amber-300 mt-0.5">{selectedRecipe.goldCost} Gold • {selectedRecipe.stonesCost} Stones</span>
            </div>
          </div>
        </div>

        {/* Craft Button */}
        <Button
          variant="accent"
          size="md"
          disabled={!canAffordCraft || isProcessing}
          onClick={handleCraft}
          className="w-full mt-1 min-h-[44px] font-black uppercase tracking-wider"
        >
          {isProcessing ? 'Forging in Fire…' : canAffordCraft ? `Forge ${selectedRecipe.name}` : 'Insufficient Materials or Gold'}
        </Button>
      </div>
    </div>
  );
};
