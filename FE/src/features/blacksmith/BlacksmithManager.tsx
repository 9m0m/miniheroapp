'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Anvil, Sparkles, Gem, Shield, Hammer } from 'lucide-react';
import { GemType } from '@/types/game.types';

const ACCESSORY_RECIPES = [
  {
    id: 'acc_ruby_ring',
    name: 'Molten Ruby Ring',
    description: 'Empowers all physical and magic damage.',
    icon: '💍',
    stats: '+15 Phys ATK • +15 Magic ATK',
    rarity: 'UNCOMMON',
    goldCost: 1000,
    stonesCost: 5,
  },
  {
    id: 'acc_emerald_ring',
    name: 'Emerald Falcon Ring',
    description: 'Significantly increases Critical Strike Rate and Critical Damage.',
    icon: '💍',
    stats: '+8% Crit Rate • +20% Crit DMG',
    rarity: 'RARE',
    goldCost: 1000,
    stonesCost: 5,
  },
  {
    id: 'acc_heart_amulet',
    name: 'Dragonheart Amulet',
    description: 'Bestows immense vitality, health regeneration, and lifesteal.',
    icon: '📿',
    stats: '+120 HP • +10 HP/s • +3% Lifesteal',
    rarity: 'RARE',
    goldCost: 1000,
    stonesCost: 5,
  },
  {
    id: 'acc_dragon_talisman',
    name: 'Aegis Dragon Talisman',
    description: 'Supreme relic reducing damage taken and accelerating cooldowns.',
    icon: '🧿',
    stats: '+25 ATK • +5% DmgReduction • +5% CDR',
    rarity: 'EPIC',
    goldCost: 1000,
    stonesCost: 5,
  },
];

export default function BlacksmithManager() {
  const { gold, enhanceStones, inventory, templates, craftAccessory, inlayGemToItem, addFloatingText } = useGameStore();
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
      addFloatingText(`⚒️ FORGED ${selectedRecipe.name.toUpperCase()}!`, 180, 80, '#f59e0b', true);
    }
  };

  const handleInlayGem = async () => {
    if (!targetSocketItemId || isForging) return;

    setIsForging(true);
    await new Promise((r) => setTimeout(r, 500));

    await inlayGemToItem(targetSocketItemId, selectedGemToInlay);
    setIsForging(false);
    addFloatingText(`💎 GEM INLAY SUCCESSFUL!`, 180, 80, '#06b6d4', true);
  };

  return (
    <div className="flex flex-col gap-3 p-3 text-xs overflow-y-auto flex-1 pb-16">
      {/* 1. Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 bg-game-dark p-1 rounded-xl border border-game-border">
        <button
          onClick={() => setActiveTab('CRAFT')}
          className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'CRAFT'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Anvil className="w-4 h-4" />
          <span>Accessory Crafting</span>
        </button>

        <button
          onClick={() => setActiveTab('SOCKET')}
          className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
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
        <div className="bg-game-card p-4 rounded-xl border border-game-border flex flex-col items-center justify-center gap-3 relative shadow-inner">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-yellow-500 flex items-center justify-center text-3xl shadow-lg border border-amber-400/50 ${isForging ? 'animate-spin' : 'animate-pulse'}`}>
            ⚒️
          </div>

          <div className="text-center">
            <h3 className="font-bold text-sm text-slate-100">Blacksmith Forge Workshop</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Craft universal accessories shared across all 4 hero classes.
            </p>
          </div>

          {/* Recipes List */}
          <div className="w-full space-y-2 mt-1">
            {ACCESSORY_RECIPES.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                  selectedRecipe.id === recipe.id
                    ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{recipe.icon}</span>
                  <div>
                    <div className="font-bold text-xs text-slate-100">{recipe.name}</div>
                    <div className="text-[10px] text-emerald-400 font-medium">{recipe.stats}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    {recipe.rarity}
                  </span>
                  <div className="text-[10px] text-amber-400 mt-1">
                    {recipe.goldCost}🪙 • {recipe.stonesCost}🪨
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleCraftAccessory}
            disabled={!canAffordCraft || isForging}
            className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-98 mt-1 ${
              canAffordCraft && !isForging
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 shadow-amber-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles size={15} />
            <span>{isForging ? 'Forging Accessory...' : `FORGE ${selectedRecipe.name.toUpperCase()}`}</span>
          </button>
        </div>
      )}

      {/* 3. Socketing & Inlaying Gem Mode */}
      {activeTab === 'SOCKET' && (
        <div className="bg-game-card p-4 rounded-xl border border-game-border flex flex-col items-center justify-center gap-3 relative shadow-inner">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center text-3xl shadow-lg border border-cyan-400/50 animate-pulse">
            💎
          </div>

          <div className="text-center">
            <h3 className="font-bold text-sm text-slate-100">Gem Inlay Socketing</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Inlay synthesized gems into available sockets on Rare, Epic, and Legendary gear.
            </p>
          </div>

          {/* Select Gem to Inlay */}
          <div className="w-full">
            <label className="block text-[11px] text-slate-300 font-semibold mb-1.5">
              1. Select Gem to Inlay:
            </label>
            <div className="flex gap-2 justify-center">
              {[
                { id: 'RUBY_T2', name: '🔴 Ruby T2 (+30 ATK)' },
                { id: 'EMERALD_T2', name: '🟢 Emerald T2 (+4% Crit)' },
                { id: 'SAPPHIRE_T2', name: '🔵 Sapphire T2 (+0.1 ASPD)' },
                { id: 'DIAMOND_T2', name: '💎 Diamond T2 (+4% DR)' },
              ].map((gem) => (
                <button
                  key={gem.id}
                  onClick={() => setSelectedGemToInlay(gem.id)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition ${
                    selectedGemToInlay === gem.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {gem.name}
                </button>
              ))}
            </div>
          </div>

          {/* Select Item to Inlay */}
          <div className="w-full">
            <label className="block text-[11px] text-slate-300 font-semibold mb-1.5">
              2. Select Gear from Bag:
            </label>
            {inventory.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic py-2 text-center">Inventory is empty.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {inventory.map((item) => {
                  const tmpl = templates[item.templateId];
                  const isTarget = targetSocketItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setTargetSocketItemId(item.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                        isTarget
                          ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl">{tmpl?.icon || '📦'}</span>
                      <span className="text-[9px] font-bold text-slate-200 truncate w-full text-center">
                        {tmpl?.name || 'Equipment'}
                      </span>
                      <span className="text-[8px] text-amber-400 font-semibold">+{item.enhanceLevel}</span>
                      <span className="text-[7px] text-slate-400">
                        {item.sockets?.length || 0} Sockets
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inlay Button */}
          <button
            onClick={handleInlayGem}
            disabled={!targetSocketItemId || isForging}
            className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-98 mt-1 ${
              targetSocketItemId && !isForging
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 shadow-cyan-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Gem size={15} />
            <span>{isForging ? 'Inlaying Gem...' : 'INLAY GEM INTO GEAR'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
