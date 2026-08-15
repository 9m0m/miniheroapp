'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Box, Sparkles, Gem, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ItemRarity, GemType } from '@/types/game.types';

export default function CubeManager() {
  const { inventory, templates, gold, smartFusion, gemFusion, addFloatingText } = useGameStore();
  const [activeCubeMode, setActiveCubeMode] = useState<'FUSION' | 'GEMS'>('FUSION');

  // Smart Fusion Selection State (exactly 3 item IDs)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isFusing, setIsFusing] = useState(false);

  // Gem Fusion State
  const [selectedGemType, setSelectedGemType] = useState<GemType>('RUBY');
  const [selectedTier, setSelectedTier] = useState<number>(1);

  // Handle Item Click in Bag
  const handleToggleItem = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      setSelectedItemIds(selectedItemIds.filter((id) => id !== itemId));
    } else {
      if (selectedItemIds.length >= 3) return;

      const item = inventory.find((i) => i.id === itemId);
      if (!item) return;

      // Ensure same rarity
      if (selectedItemIds.length > 0) {
        const firstItem = inventory.find((i) => i.id === selectedItemIds[0]);
        if (firstItem && firstItem.rarity !== item.rarity) {
          addFloatingText('⚠️ Must select 3 items of the same rarity!', 180, 80, '#ef4444', false);
          return;
        }
      }

      setSelectedItemIds([...selectedItemIds, itemId]);
    }
  };

  const handleExecuteSmartFusion = async () => {
    if (selectedItemIds.length !== 3 || isFusing) return;

    setIsFusing(true);
    await new Promise((r) => setTimeout(r, 600));

    const result = await smartFusion(selectedItemIds);
    setIsFusing(false);

    if (result) {
      setSelectedItemIds([]);
      addFloatingText('🎲 FUSED HIGHER RARITY ITEM!', 180, 80, '#f59e0b', true);
    }
  };

  const handleExecuteGemFusion = async () => {
    if (isFusing) return;
    setIsFusing(true);
    await new Promise((r) => setTimeout(r, 500));

    const result = await gemFusion(selectedGemType, selectedTier);
    setIsFusing(false);

    if (result) {
      addFloatingText(`💎 FUSED ${result}!`, 180, 80, '#06b6d4', true);
    }
  };

  const firstSelectedItem = inventory.find((i) => i.id === selectedItemIds[0]);
  const nextRarity = firstSelectedItem
    ? firstSelectedItem.rarity === 'COMMON'
      ? 'UNCOMMON'
      : firstSelectedItem.rarity === 'UNCOMMON'
      ? 'RARE'
      : firstSelectedItem.rarity === 'RARE'
      ? 'EPIC'
      : 'LEGENDARY'
    : null;

  return (
    <div className="flex flex-col gap-3 p-3 text-xs overflow-y-auto flex-1 pb-16">
      {/* 1. Mode Selector (2 Clean Modes) */}
      <div className="grid grid-cols-2 gap-2 bg-game-dark p-1 rounded-xl border border-game-border">
        <button
          onClick={() => {
            setActiveCubeMode('FUSION');
            setSelectedItemIds([]);
          }}
          className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeCubeMode === 'FUSION'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Smart Fusion</span>
        </button>

        <button
          onClick={() => setActiveCubeMode('GEMS')}
          className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeCubeMode === 'GEMS'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gem className="w-4 h-4" />
          <span>Gem Fusion</span>
        </button>
      </div>

      {/* 2. The Cube Core Vessel */}
      <div className="bg-game-card p-4 rounded-xl border border-game-border flex flex-col items-center justify-center gap-3 relative shadow-inner">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-3xl shadow-lg border border-cyan-400/50 ${isFusing ? 'animate-spin' : 'animate-pulse'}`}>
          🎲
        </div>

        <div className="text-center">
          <h3 className="font-bold text-sm text-slate-100">
            {activeCubeMode === 'FUSION' ? 'Smart Gear Fusion (3 of Same Rarity)' : 'Gem Synthesis (3 of Same Tier)'}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {activeCubeMode === 'FUSION'
              ? '3 Same-rarity gear ➔ 100% chance to forge a guaranteed higher-tier piece for your classes.'
              : '3 Gems of Tier N ➔ 1 Gem of Tier N+1 (Max Tier 5).'}
          </p>
        </div>

        {/* FUSION MODE SLOTS */}
        {activeCubeMode === 'FUSION' && (
          <div className="w-full flex flex-col items-center gap-3 mt-1">
            <div className="flex items-center gap-2.5">
              {[0, 1, 2].map((idx) => {
                const itemId = selectedItemIds[idx];
                const item = inventory.find((i) => i.id === itemId);
                const template = item ? templates[item.templateId] : null;

                return (
                  <div
                    key={idx}
                    onClick={() => itemId && handleToggleItem(itemId)}
                    className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition ${
                      item
                        ? 'border-amber-400 bg-amber-500/10 text-xl'
                        : 'border-dashed border-slate-700 bg-slate-900/60 text-slate-600 text-lg hover:border-slate-500'
                    }`}
                  >
                    {item ? (
                      <>
                        <span>{template?.icon || '📦'}</span>
                        <span className="text-[9px] font-bold text-amber-300">+{item.enhanceLevel}</span>
                      </>
                    ) : (
                      <span>+</span>
                    )}
                  </div>
                );
              })}

              <ArrowRight size={16} className="text-slate-500 mx-1" />

              {/* Output Preview */}
              <div className="w-14 h-14 rounded-xl border border-yellow-500/50 bg-gradient-to-tr from-yellow-500/20 to-amber-500/10 flex flex-col items-center justify-center text-xl shadow-md">
                {nextRarity ? (
                  <>
                    <span>🎁</span>
                    <span className="text-[8px] font-bold text-yellow-300 truncate">{nextRarity}</span>
                  </>
                ) : (
                  <span className="text-slate-600 text-sm">?</span>
                )}
              </div>
            </div>

            <button
              onClick={handleExecuteSmartFusion}
              disabled={selectedItemIds.length !== 3 || isFusing}
              className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-98 ${
                selectedItemIds.length === 3 && !isFusing
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sparkles size={15} />
              <span>{isFusing ? 'Synthesizing...' : 'ACTIVATE THE CUBE (3 ➔ 1 NEXT TIER)'}</span>
            </button>
          </div>
        )}

        {/* GEM FUSION MODE */}
        {activeCubeMode === 'GEMS' && (
          <div className="w-full flex flex-col items-center gap-3 mt-1">
            {/* Gem Type Select */}
            <div className="flex gap-2 justify-center">
              {(['RUBY', 'EMERALD', 'SAPPHIRE', 'TOPAZ', 'DIAMOND'] as GemType[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGemType(g)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                    selectedGemType === g
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {g === 'RUBY' && '🔴 Ruby'}
                  {g === 'EMERALD' && '🟢 Emerald'}
                  {g === 'SAPPHIRE' && '🔵 Sapphire'}
                  {g === 'TOPAZ' && '🟡 Topaz'}
                  {g === 'DIAMOND' && '💎 Diamond'}
                </button>
              ))}
            </div>

            {/* Tier Select */}
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>Source Tier:</span>
              {[1, 2, 3, 4].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTier(t)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs border transition ${
                    selectedTier === t
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  T{t}
                </button>
              ))}
              <span>➔ <strong>T{selectedTier + 1}</strong></span>
            </div>

            <button
              onClick={handleExecuteGemFusion}
              disabled={isFusing}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 shadow-md shadow-cyan-500/25 flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <Gem size={15} />
              <span>SYNTHESIZE 3 TIER {selectedTier} GEMS ➔ 1 TIER {selectedTier + 1}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Bag Items Selection for Smart Fusion */}
      {activeCubeMode === 'FUSION' && (
        <div className="bg-game-card p-3 rounded-xl border border-game-border flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-300 text-xs">
              Inventory Bag ({inventory.length})
            </h4>
            <span className="text-[10px] text-slate-400">
              Selected: <strong className="text-amber-400">{selectedItemIds.length}/3</strong>
            </span>
          </div>

          {inventory.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic py-3 text-center">
              Inventory is empty. Clear stage waves to loot more equipment!
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {inventory.map((item) => {
                const tmpl = templates[item.templateId];
                const isSelected = selectedItemIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item.id)}
                    className={`relative p-2 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-2xl">{tmpl?.icon || '📦'}</span>
                    <span className="text-[10px] font-bold text-slate-200 truncate w-full text-center">
                      {tmpl?.name || 'Equipment'}
                    </span>
                    <span className="text-[9px] text-amber-400 font-semibold">
                      +{item.enhanceLevel} • {item.rarity}
                    </span>

                    {isSelected && (
                      <div className="absolute top-1 right-1 text-amber-400">
                        <CheckCircle2 size={13} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
