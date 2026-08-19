'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Anvil, Sparkles, Gem, Shield, Hammer } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const ACCESSORY_RECIPES = [
  {
    id: 'acc_ruby_ring',
    name: 'Molten Ruby Ring',
    description: 'Empowers all physical and magic damage.',
    stats: '+15 Phys ATK • +15 Magic ATK',
    rarity: 'UNCOMMON',
    goldCost: 1000,
    stonesCost: 5,
  },
  {
    id: 'acc_emerald_ring',
    name: 'Emerald Falcon Ring',
    description: 'Significantly increases Critical Strike Rate and Critical Damage.',
    stats: '+8% Crit Rate • +20% Crit DMG',
    rarity: 'RARE',
    goldCost: 1000,
    stonesCost: 5,
  },
  {
    id: 'acc_heart_amulet',
    name: 'Dragonheart Amulet',
    description: 'Bestows immense vitality, health regeneration, and lifesteal.',
    stats: '+120 HP • +10 HP/s • +3% Lifesteal',
    rarity: 'RARE',
    goldCost: 1000,
    stonesCost: 5,
  },
  {
    id: 'acc_dragon_talisman',
    name: 'Aegis Dragon Talisman',
    description: 'Supreme relic reducing damage taken and accelerating cooldowns.',
    stats: '+25 ATK • +5% DmgReduction • +5% CDR',
    rarity: 'EPIC',
    goldCost: 1000,
    stonesCost: 5,
  },
];

export default function BlacksmithManager() {
  const gold = useGameStore((state) => state.gold);
  const enhanceStones = useGameStore((state) => state.enhanceStones);
  const inventory = useGameStore((state) => state.inventory);
  const templates = useGameStore((state) => state.templates);
  const craftAccessory = useGameStore((state) => state.craftAccessory);
  const inlayGemToItem = useGameStore((state) => state.inlayGemToItem);
  const addFloatingText = useGameStore((state) => state.addFloatingText);

  const [activeTab, setActiveTab] = useState<'CRAFT' | 'SOCKET'>('CRAFT');
  const [selectedRecipe, setSelectedRecipe] = useState(ACCESSORY_RECIPES[0]);
  const [isForging, setIsForging] = useState(false);

  // Socketing State
  const [targetSocketItemId, setTargetSocketItemId] = useState<string | null>(null);
  const [selectedGemToInlay, setSelectedGemToInlay] = useState<string>('RUBY_T2');

  const canAffordCraft = gold >= selectedRecipe.goldCost && enhanceStones >= selectedRecipe.stonesCost;

  const handleCraftAccessory = async () => {
    if (!canAffordCraft || isForging) return;

    setIsForging(true);
    await new Promise((r) => setTimeout(r, 600));

    const success = await craftAccessory(selectedRecipe.id);
    setIsForging(false);

    if (success) {
      addFloatingText(`Forged ${selectedRecipe.name}!`, 180, 80, '#f59e0b', true);
    }
  };

  const handleInlayGem = async () => {
    if (!targetSocketItemId || isForging) return;

    setIsForging(true);
    await new Promise((r) => setTimeout(r, 500));

    const item = inventory.find((i) => i.id === targetSocketItemId);
    if (item) {
      inlayGemToItem(item, selectedGemToInlay);
    }
    setIsForging(false);
  };

  return (
    <div className="flex flex-col gap-3 p-3 text-xs overflow-y-auto flex-1 pb-16 max-w-lg mx-auto select-none">
      {/* 1. Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('CRAFT')}
          className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400 ${
            activeTab === 'CRAFT'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Anvil className="w-4 h-4" />
          <span>Accessory Crafting</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SOCKET')}
          className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            activeTab === 'SOCKET'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gem className="w-4 h-4" />
          <span>Gem Socketing</span>
        </button>
      </div>

      {/* 2. Crafting Accessory Mode */}
      {activeTab === 'CRAFT' && (
        <Card variant="base" padding="md" className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Hammer size={24} aria-hidden="true" />
          </div>

          <div className="text-center">
            <h3 className="font-bold text-sm text-slate-100">Blacksmith Forge</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Craft universal accessories shared across all 4 hero classes.
            </p>
          </div>

          {/* Recipes List with Semantic Buttons */}
          <div className="w-full space-y-2 mt-1">
            {ACCESSORY_RECIPES.map((recipe) => {
              const isSelected = selectedRecipe.id === recipe.id;
              return (
                <button
                  type="button"
                  key={recipe.id}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between gap-3 text-left transition focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400 shadow-sm'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Shield size={18} className="text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-100 truncate">{recipe.name}</div>
                      <div className="text-xs text-emerald-400 font-medium">{recipe.stats}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <Badge variant="accent" size="sm">
                      {recipe.rarity}
                    </Badge>
                    <div className="text-xs text-amber-400 mt-1 font-mono tabular-nums">
                      {recipe.goldCost} Gold • {recipe.stonesCost} Stones
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleCraftAccessory}
            disabled={!canAffordCraft || isForging}
            isLoading={isForging}
          >
            <Sparkles size={15} className="mr-1.5" />
            <span>Forge {selectedRecipe.name}</span>
          </Button>
        </Card>
      )}

      {/* 3. Socketing & Inlaying Gem Mode */}
      {activeTab === 'SOCKET' && (
        <Card variant="base" padding="md" className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Gem size={24} aria-hidden="true" />
          </div>

          <div className="text-center">
            <h3 className="font-bold text-sm text-slate-100">Gem Inlay Socketing</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inlay synthesized gems into available sockets on Rare, Epic, and Legendary gear.
            </p>
          </div>

          {/* Select Gem to Inlay */}
          <div className="w-full">
            <label className="block text-xs text-slate-300 font-semibold mb-1.5">
              1. Select Gem to Inlay:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'RUBY_T2', name: 'Ruby T2 (+30 ATK)' },
                { id: 'EMERALD_T2', name: 'Emerald T2 (+4% Crit)' },
                { id: 'SAPPHIRE_T2', name: 'Sapphire T2 (+0.1 ASPD)' },
                { id: 'DIAMOND_T2', name: 'Diamond T2 (+4% DR)' },
              ].map((gem) => (
                <button
                  type="button"
                  key={gem.id}
                  aria-pressed={selectedGemToInlay === gem.id}
                  onClick={() => setSelectedGemToInlay(gem.id)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-bold border transition focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    selectedGemToInlay === gem.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {gem.name}
                </button>
              ))}
            </div>
          </div>

          {/* Select Item to Inlay with Semantic Buttons */}
          <div className="w-full">
            <label className="block text-xs text-slate-300 font-semibold mb-1.5">
              2. Select Gear from Bag:
            </label>
            {inventory.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center">Inventory is empty.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-0.5">
                {inventory.map((item) => {
                  const tmpl = templates[item.templateId];
                  const isTarget = targetSocketItemId === item.id;

                  return (
                    <button
                      type="button"
                      key={item.id}
                      aria-pressed={isTarget}
                      onClick={() => setTargetSocketItemId(item.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                        isTarget
                          ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Shield size={16} className="text-cyan-400" />
                      <span className="text-xs font-bold text-slate-200 truncate w-full text-center">
                        {tmpl?.name || 'Equipment'}
                      </span>
                      <span className="text-xs text-amber-400 font-semibold">+{item.enhanceLevel}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inlay Button */}
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onClick={handleInlayGem}
            disabled={!targetSocketItemId || isForging}
            isLoading={isForging}
          >
            <Gem size={15} className="mr-1.5" />
            <span>Inlay Gem into Gear</span>
          </Button>
        </Card>
      )}
    </div>
  );
}
