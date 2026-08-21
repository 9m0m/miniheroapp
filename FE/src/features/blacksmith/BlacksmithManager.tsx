'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Anvil, Hammer, Sparkles, Shield, AlertCircle, CheckCircle2, ChevronRight, Zap, Coins } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ItemInstance } from '@/types/item.types';
import { ItemRarity, RARITY_COLORS } from '@/types/enums';

interface CraftRecipe {
  id: string;
  name: string;
  slot: string;
  targetTemplateId: string;
  requiredMaterialId: string;
  requiredMaterialName: string;
  description: string;
  statsPreview: string;
  goldCost: number;
  stonesCost: number;
  classTag: string;
}

const CRAFT_RECIPES: CraftRecipe[] = [
  // ─── Rings (Universal) ──────────────────────────────────────────────────
  {
    id: 'craft_ruby_ring',
    name: 'Molten Ruby Ring',
    slot: 'RING',
    targetTemplateId: 'acc_ruby_ring',
    requiredMaterialId: 'mat_ring_frame',
    requiredMaterialName: 'Ring Frame',
    description: 'Empowers physical and magic damage. Universal for all heroes.',
    statsPreview: '+15 Phys ATK • +15 Magic ATK',
    goldCost: 300,
    stonesCost: 2,
    classTag: 'All Classes',
  },
  {
    id: 'craft_falcon_ring',
    name: 'Falcon Eye Ring',
    slot: 'RING',
    targetTemplateId: 'acc_ruby_ring',
    requiredMaterialId: 'mat_ring_frame',
    requiredMaterialName: 'Ring Frame',
    description: 'Precision alloy band tuning critical strike accuracy.',
    statsPreview: '+6% Crit Rate • +15% Crit DMG',
    goldCost: 500,
    stonesCost: 3,
    classTag: 'All Classes',
  },
  // ─── Talismans (Universal) ──────────────────────────────────────────────
  {
    id: 'craft_heart_talisman',
    name: 'Dragonheart Talisman',
    slot: 'TALISMAN',
    targetTemplateId: 'acc_heart_amulet',
    requiredMaterialId: 'mat_talisman_frame',
    requiredMaterialName: 'Talisman Frame',
    description: 'Ancient etched relic restoring vitality. Universal for all heroes.',
    statsPreview: '+120 Max HP • +5 Armor',
    goldCost: 400,
    stonesCost: 2,
    classTag: 'All Classes',
  },
  {
    id: 'craft_aegis_talisman',
    name: 'Aegis Guardian Talisman',
    slot: 'TALISMAN',
    targetTemplateId: 'acc_dragon_talisman',
    requiredMaterialId: 'mat_talisman_frame',
    requiredMaterialName: 'Talisman Frame',
    description: 'Imbued with warding runes that absorb incoming trauma.',
    statsPreview: '+25 ATK • +8% DmgReduction',
    goldCost: 800,
    stonesCost: 4,
    classTag: 'All Classes',
  },
  // ─── Weapons (Class-Restricted) ─────────────────────────────────────────
  {
    id: 'craft_iron_sword',
    name: 'Novice Vanguard Sword',
    slot: 'MAIN_HAND',
    targetTemplateId: 'wpn_iron_sword',
    requiredMaterialId: 'mat_iron_ingot',
    requiredMaterialName: 'Refined Iron Ingot',
    description: 'Tempered steel blade for frontline Knights and Warriors.',
    statsPreview: '+20 Phys ATK • +2% Crit Rate',
    goldCost: 200,
    stonesCost: 1,
    classTag: 'Knight / Warrior',
  },
  {
    id: 'craft_hunting_bow',
    name: 'Hunting Composite Bow',
    slot: 'MAIN_HAND',
    targetTemplateId: 'wpn_hunting_bow',
    requiredMaterialId: 'mat_leather_strip',
    requiredMaterialName: 'Tanned Leather',
    description: 'Flexible composite bow designed for Marksman Rangers.',
    statsPreview: '+22 Phys ATK • +4% Attack Speed',
    goldCost: 200,
    stonesCost: 1,
    classTag: 'Ranger / Marksman',
  },
  {
    id: 'craft_iron_shield',
    name: 'Iron Vanguard Shield',
    slot: 'OFF_HAND',
    targetTemplateId: 'shd_iron_shield',
    requiredMaterialId: 'mat_iron_ingot',
    requiredMaterialName: 'Refined Iron Ingot',
    description: 'Heavy plate shield providing robust armor deflection.',
    statsPreview: '+18 Armor • +50 Max HP',
    goldCost: 250,
    stonesCost: 1,
    classTag: 'Knight / Tank',
  },
];

const ENHANCE_GOLD_COSTS = [
  100, 200, 300, 500, 800, 1200, 1700, 2300, 3000, 4000, 5500, 7500, 10000, 14000, 20000
];
const ENHANCE_STONE_COSTS = [
  1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 18, 25
];

export default function BlacksmithManager() {
  const gold = useGameStore((state) => state.gold);
  const enhanceStones = useGameStore((state) => state.enhanceStones);
  const inventory = useGameStore((state) => state.inventory);
  const templates = useGameStore((state) => state.templates);
  const enhanceItem = useGameStore((state) => state.enhanceItem);
  const addFloatingText = useGameStore((state) => state.addFloatingText);

  const [activeTab, setActiveTab] = useState<'CRAFT' | 'ENHANCE'>('CRAFT');
  const [selectedRecipe, setSelectedRecipe] = useState<CraftRecipe>(CRAFT_RECIPES[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Enhance tab selection
  const [selectedEnhanceItemId, setSelectedEnhanceItemId] = useState<string | null>(null);

  // Material check for craft
  const matchingMaterialItem = inventory.find(
    (item: ItemInstance) => item.templateId === selectedRecipe.requiredMaterialId
  );
  const hasRequiredMaterial = Boolean(matchingMaterialItem);
  const canAffordCraft =
    gold >= selectedRecipe.goldCost &&
    enhanceStones >= selectedRecipe.stonesCost &&
    hasRequiredMaterial;

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

  // ─── Enhance Handler ────────────────────────────────────────────────────────
  const handleEnhance = async () => {
    if (!targetEnhanceItem || isMaxEnhance || !canAffordEnhance || isProcessing) return;

    setIsProcessing(true);
    await enhanceItem(targetEnhanceItem);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col gap-2.5 p-3 text-xs overflow-y-auto flex-1 pb-16 max-w-lg mx-auto select-none bg-[#06080e]">
      {/* 1. Sub-Tab Switcher */}
      <div className="grid grid-cols-2 gap-1.5 bg-[#0a0e17] p-1 rounded-lg border border-[#1e293b] shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('CRAFT')}
          className={`py-2 px-3 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px] ${
            activeTab === 'CRAFT'
              ? 'btn-game-amber shadow-sm font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Anvil size={14} aria-hidden="true" />
          <span>Forge Crafting</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ENHANCE')}
          className={`py-2 px-3 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px] ${
            activeTab === 'ENHANCE'
              ? 'btn-game-amber shadow-sm font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hammer size={14} aria-hidden="true" />
          <span>Equipment Enhance (+15)</span>
        </button>
      </div>

      {/* 2. Resources Summary Ribbon */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0e131d] border border-[#1e293b] rounded-lg text-[11px]">
        <div className="flex items-center gap-1.5">
          <Coins size={13} className="text-amber-400" />
          <span className="text-slate-400">Gold:</span>
          <span className="font-bold text-amber-300 font-mono tabular-nums">{gold.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-purple-400" />
          <span className="text-slate-400">Enhance Stones:</span>
          <span className="font-bold text-cyan-300 font-mono tabular-nums">{enhanceStones}</span>
        </div>
      </div>

      {/* ─── TAB A: FORGE CRAFTING ─────────────────────────────────────────── */}
      {activeTab === 'CRAFT' && (
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
      )}

      {/* ─── TAB B: EQUIPMENT ENHANCE (+15) ────────────────────────────────── */}
      {activeTab === 'ENHANCE' && (
        <div className="flex flex-col gap-2.5">
          {equippableItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs bg-[#0e131d] rounded-lg border border-[#1e293b]">
              No equippable gear found in inventory. Craft or acquire weapons and armor to enhance!
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
