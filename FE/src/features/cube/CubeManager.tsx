'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { ItemRarity, ItemType, RARITY_COLORS } from '@/types/enums';
import { ItemInstance } from '@/types/item.types';
import { Box, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { computeItemStats } from '@/engine/statEvaluator';
import { ModalShell } from '@/components/ui/ModalShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function CubeManager() {
  const inventory = useGameStore((state) => state.inventory);
  const templates = useGameStore((state) => state.templates);
  const transmuteCube9 = useGameStore((state) => state.transmuteCube9);
  const addFloatingText = useGameStore((state) => state.addFloatingText);

  const [selectedCategory, setSelectedCategory] = useState<ItemType>('EQUIPMENT');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    item: ItemInstance;
    isJackpot: boolean;
    isFallback: boolean;
  } | null>(null);

  // Filter items matching selected category
  const categoryItems = inventory.filter((item) => {
    const tpl = templates[item.templateId];
    if (!tpl || tpl.itemType === 'CHEST' || tpl.itemType === 'KEY') return false;

    if (selectedCategory === 'EQUIPMENT') return tpl.itemType === 'EQUIPMENT';
    if (selectedCategory === 'ACCESSORY') return tpl.itemType === 'ACCESSORY';
    if (selectedCategory === 'MATERIAL') return tpl.itemType === 'MATERIAL';
    if (selectedCategory === 'GEM') return tpl.itemType === 'GEM';
    return true;
  });

  const handleToggleItem = (item: ItemInstance) => {
    if (selectedItemIds.includes(item.id)) {
      setSelectedItemIds(selectedItemIds.filter((id) => id !== item.id));
      return;
    }

    if (selectedItemIds.length >= 9) return;

    // Check rarity match
    if (selectedItemIds.length > 0) {
      const firstItem = inventory.find((i) => i.id === selectedItemIds[0]);
      if (firstItem && firstItem.rarity !== item.rarity) {
        addFloatingText?.('All 9 items must share the exact same Rarity!', 180, 80, '#ef4444', true);
        return;
      }
    }

    setSelectedItemIds([...selectedItemIds, item.id]);
  };

  const handleAutoFill9 = () => {
    if (categoryItems.length < 9) {
      addFloatingText?.(`Need at least 9 ${selectedCategory} items in Backpack!`, 180, 80, '#ef4444', true);
      return;
    }

    // Group items by rarity
    const rarityGroups: Record<string, ItemInstance[]> = {};
    categoryItems.forEach((item) => {
      if (!rarityGroups[item.rarity]) rarityGroups[item.rarity] = [];
      rarityGroups[item.rarity].push(item);
    });

    // Pick first group with >= 9 items, prioritizing lowest rarity
    const rarities: ItemRarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
    let chosenGroup: ItemInstance[] | null = null;

    for (const r of rarities) {
      if (rarityGroups[r] && rarityGroups[r].length >= 9) {
        chosenGroup = rarityGroups[r].slice(0, 9);
        break;
      }
    }

    if (chosenGroup) {
      setSelectedItemIds(chosenGroup.map((i) => i.id));
      addFloatingText?.(`Auto-filled 9 ${chosenGroup[0].rarity} items!`, 180, 80, '#38BDF8');
    } else {
      addFloatingText?.('Need 9 items of the same Rarity in Backpack!', 180, 80, '#ef4444', true);
    }
  };

  const handleExecuteTransmute = async () => {
    if (selectedItemIds.length !== 9 || isTransmuting) return;

    const itemsToTransmute = selectedItemIds
      .map((id) => inventory.find((i) => i.id === id))
      .filter(Boolean) as ItemInstance[];

    if (itemsToTransmute.length !== 9) return;

    setIsTransmuting(true);
    await new Promise((r) => setTimeout(r, 600));

    const result = transmuteCube9(itemsToTransmute, selectedCategory);
    setIsTransmuting(false);

    if (result.resultItem) {
      setLastResult({
        item: result.resultItem,
        isJackpot: result.isJackpot,
        isFallback: result.isFallback,
      });
      setSelectedItemIds([]);
    }
  };

  const firstSelected = inventory.find((i) => i.id === selectedItemIds[0]);
  const currentRarity = firstSelected?.rarity;

  const resultTemplate = lastResult ? templates[lastResult.item.templateId] : null;
  const resultStats = lastResult && resultTemplate ? computeItemStats(resultTemplate, lastResult.item) : null;
  const resultColor = lastResult ? RARITY_COLORS[lastResult.item.rarity] || '#94A3B8' : '#94A3B8';

  return (
    <div className="flex flex-col gap-3 p-3 text-xs overflow-y-auto flex-1 pb-28 max-w-lg mx-auto select-none">
      {/* 1. Category Mode Selector */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 shadow-inner">
        {(['EQUIPMENT', 'ACCESSORY', 'MATERIAL', 'GEM'] as ItemType[]).map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              type="button"
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedItemIds([]);
              }}
              className={`py-2 px-1 rounded-lg font-bold text-center transition-all ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 2. Cube 3x3 Grid Slot Matrix */}
      <Card variant="base" padding="md" className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Box size={16} className="text-cyan-400" />
            <span className="font-bold text-slate-100">Cube Slots (3x3)</span>
          </div>
          <Badge variant={selectedItemIds.length === 9 ? 'success' : 'neutral'} size="sm">
            {selectedItemIds.length}/9 Filled
          </Badge>
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
          {Array.from({ length: 9 }).map((_, idx) => {
            const itemId = selectedItemIds[idx];
            const item = itemId ? inventory.find((i) => i.id === itemId) : null;
            const tpl = item ? templates[item.templateId] : null;
            const color = item ? RARITY_COLORS[item.rarity] || '#94A3B8' : '#334155';

            return (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  if (item) setSelectedItemIds(selectedItemIds.filter((id) => id !== item.id));
                }}
                style={{ borderColor: item ? color : undefined }}
                className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                  item
                    ? 'bg-slate-900 border-2 shadow-md active:scale-95'
                    : 'bg-slate-900/40 border-dashed border-slate-800 text-slate-700'
                }`}
              >
                {item && tpl ? (
                  <>
                    <span style={{ color }} className="font-bold text-xs">
                      {tpl.name.substring(0, 4)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      iLvl {item.itemLevel}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-mono text-slate-600 font-bold">{idx + 1}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2 w-full pt-1">
          <Button variant="secondary" size="md" onClick={handleAutoFill9}>
            Auto-Fill 9
          </Button>

          <Button
            variant="accent"
            size="md"
            onClick={handleExecuteTransmute}
            disabled={selectedItemIds.length !== 9 || isTransmuting}
            isLoading={isTransmuting}
          >
            <Zap size={14} className="mr-1" />
            Transmute
          </Button>
        </div>
      </Card>

      {/* 3. Candidate Items from Backpack */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-bold text-xs text-slate-200">Backpack Candidates ({categoryItems.length})</span>
          {currentRarity && (
            <span className="text-xs font-mono">
              Matching Rarity: <strong className="text-amber-400">{currentRarity}</strong>
            </span>
          )}
        </div>

        {categoryItems.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            No {selectedCategory} items in Backpack.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {categoryItems.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              const tpl = templates[item.templateId];
              const color = RARITY_COLORS[item.rarity] || '#94A3B8';
              const disabled =
                !isSelected && selectedItemIds.length > 0 && currentRarity !== item.rarity;

              return (
                <button
                  type="button"
                  key={item.id}
                  disabled={disabled}
                  onClick={() => handleToggleItem(item)}
                  style={{ borderColor: isSelected ? '#F59E0B' : color }}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-between relative transition-all min-h-[64px] ${
                    isSelected
                      ? 'bg-amber-500/10 border-2 shadow-md'
                      : disabled
                      ? 'opacity-30 bg-slate-950 border-slate-800'
                      : 'bg-slate-900 border-slate-700/60 hover:bg-slate-800 active:scale-95'
                  }`}
                >
                  <span className="font-bold text-xs text-slate-200 truncate w-full text-center">
                    {tpl?.name || item.templateId}
                  </span>
                  <span className="text-xs font-semibold font-mono" style={{ color }}>
                    {item.rarity}
                  </span>

                  {isSelected && (
                    <div className="absolute top-1 right-1 text-amber-400">
                      <CheckCircle2 size={12} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Transmutation Result Modal Pop-up (Accessible ModalShell) */}
      {lastResult && resultTemplate && (
        <ModalShell
          isOpen={!!lastResult}
          onClose={() => setLastResult(null)}
          icon={<Sparkles size={18} className="text-yellow-400" />}
          title={
            lastResult.isJackpot
              ? 'CRITICAL JACKPOT! (+2 TIERS)'
              : lastResult.isFallback
              ? 'TIER PRESERVED'
              : 'SYNTHESIS SUCCESS!'
          }
          description="Transmutation complete"
        >
          <div className="space-y-3 text-center">
            {/* Item Card */}
            <div
              style={{ borderColor: resultColor }}
              className="w-full bg-slate-950 p-4 rounded-2xl border-2 flex flex-col items-center gap-2"
            >
              <div
                style={{ color: resultColor, borderColor: resultColor }}
                className="w-14 h-14 rounded-2xl bg-slate-900 border flex items-center justify-center font-bold text-xl"
              >
                {resultTemplate.name.charAt(0)}
              </div>

              <div>
                <h4 style={{ color: resultColor }} className="font-bold text-sm">
                  {resultTemplate.name}
                </h4>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                  <span style={{ color: resultColor }} className="font-bold">
                    {lastResult.item.rarity}
                  </span>
                  <span>•</span>
                  <span>iLvl {lastResult.item.itemLevel}</span>
                  <span>•</span>
                  <span>{resultTemplate.slot}</span>
                </div>
              </div>

              {/* Stats Summary */}
              {resultStats && (
                <div className="grid grid-cols-2 gap-1 w-full text-xs font-mono bg-slate-900 p-2 rounded-xl border border-slate-800 mt-1">
                  {resultStats.physAtk > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Phys ATK:</span>
                      <span className="font-bold tabular-nums">+{resultStats.physAtk}</span>
                    </div>
                  )}
                  {resultStats.magicAtk > 0 && (
                    <div className="flex justify-between text-purple-400">
                      <span>Magic ATK:</span>
                      <span className="font-bold tabular-nums">+{resultStats.magicAtk}</span>
                    </div>
                  )}
                  {resultStats.armor > 0 && (
                    <div className="flex justify-between text-blue-400">
                      <span>Armor:</span>
                      <span className="font-bold tabular-nums">+{resultStats.armor}</span>
                    </div>
                  )}
                  {resultStats.maxHp > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Max HP:</span>
                      <span className="font-bold tabular-nums">+{resultStats.maxHp}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button variant="accent" fullWidth size="lg" onClick={() => setLastResult(null)}>
              Claim to Backpack
            </Button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
