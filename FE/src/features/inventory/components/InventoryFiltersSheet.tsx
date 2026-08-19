'use client';

import React from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { HeroClass, ItemSlot, ItemRarity, RARITY_COLORS } from '@/types/enums';

interface InventoryFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: ItemSlot | null;
  onSelectSlot: (slot: ItemSlot | null) => void;
  selectedClass: 'ALL' | HeroClass;
  onSelectClass: (cls: 'ALL' | HeroClass) => void;
  selectedRarity: 'ALL' | ItemRarity;
  onSelectRarity: (rarity: 'ALL' | ItemRarity) => void;
  onReset: () => void;
}

const SLOTS: { id: ItemSlot; label: string }[] = [
  { id: 'MAIN_HAND', label: 'Weapon (WPN)' },
  { id: 'OFF_HAND', label: 'Off-Hand (OFF)' },
  { id: 'HELMET', label: 'Helmet (HLM)' },
  { id: 'ARMOR', label: 'Armor (ARM)' },
  { id: 'PANTS', label: 'Pants (PNT)' },
  { id: 'BOOTS', label: 'Boots (BOT)' },
  { id: 'RING_1', label: 'Ring (RNG)' },
  { id: 'TALISMAN', label: 'Talisman (TAL)' },
];

const CLASSES: { id: 'ALL' | HeroClass; label: string }[] = [
  { id: 'ALL', label: 'All Classes' },
  { id: 'WARRIOR', label: 'Warrior' },
  { id: 'RANGER', label: 'Archer' },
  { id: 'MAGE', label: 'Wizard' },
  { id: 'PRIEST', label: 'Priest' },
];

const RARITIES: ('ALL' | ItemRarity)[] = [
  'ALL',
  'COMMON',
  'UNCOMMON',
  'RARE',
  'EPIC',
  'LEGENDARY',
  'MYTHIC',
  'ANCIENT',
];

export const InventoryFiltersSheet: React.FC<InventoryFiltersSheetProps> = ({
  isOpen,
  onClose,
  selectedSlot,
  onSelectSlot,
  selectedClass,
  onSelectClass,
  selectedRarity,
  onSelectRarity,
  onReset,
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Inventory Filters">
      <div className="flex flex-col gap-4 py-1 text-xs">
        {/* Class Filter */}
        <div>
          <label className="text-slate-400 font-semibold mb-1.5 block">Hero Class</label>
          <div className="grid grid-cols-3 gap-1.5">
            {CLASSES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectClass(c.id)}
                className={`py-2 px-2.5 rounded-lg border text-center transition min-h-[38px] cursor-pointer ${
                  selectedClass === c.id
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Slot Filter */}
        <div>
          <label className="text-slate-400 font-semibold mb-1.5 block">Equipment Slot</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onSelectSlot(null)}
              className={`py-2 px-2.5 rounded-lg border text-center transition min-h-[38px] cursor-pointer ${
                selectedSlot === null
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Slots
            </button>
            {SLOTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSlot(s.id)}
                className={`py-2 px-2.5 rounded-lg border text-center transition min-h-[38px] cursor-pointer ${
                  selectedSlot === s.id
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rarity Filter */}
        <div>
          <label className="text-slate-400 font-semibold mb-1.5 block">Rarity Tier</label>
          <div className="grid grid-cols-4 gap-1.5">
            {RARITIES.map((r) => {
              const isSelected = selectedRarity === r;
              const color = r === 'ALL' ? '#94A3B8' : RARITY_COLORS[r] || '#94A3B8';
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => onSelectRarity(r)}
                  className={`py-2 px-2 rounded-lg border text-center transition min-h-[38px] cursor-pointer font-medium ${
                    isSelected
                      ? 'bg-slate-800 border-white text-white font-bold'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                  }`}
                  style={{ color: isSelected ? '#FFFFFF' : color }}
                >
                  {r === 'ALL' ? 'All' : r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          <Button variant="secondary" onClick={onReset} className="flex-1 min-h-[44px]">
            Reset Filters
          </Button>
          <Button variant="primary" onClick={onClose} className="flex-1 min-h-[44px]">
            Apply Filters
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
