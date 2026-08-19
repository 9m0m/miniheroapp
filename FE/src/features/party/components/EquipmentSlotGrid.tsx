import React from 'react';
import { HeroClass, ItemSlot, RARITY_COLORS } from '../../../types/enums';
import { Hero } from '../../../types/hero.types';
import { ItemTemplate, ItemInstance } from '../../../types/item.types';

interface EquipmentSlotGridProps {
  hero: Hero;
  selectedHeroClass: HeroClass;
  templates: Record<string, ItemTemplate>;
  onInspectItem: (item: ItemInstance) => void;
}

const MATRIX_SLOTS: { slot: ItemSlot; code: string; label: string }[] = [
  { slot: 'MAIN_HAND', code: 'WPN', label: 'Weapon' },
  { slot: 'OFF_HAND', code: 'OFF', label: 'Off-Hand' },
  { slot: 'HELMET', code: 'HLM', label: 'Helmet' },
  { slot: 'ARMOR', code: 'ARM', label: 'Armor' },
  { slot: 'PANTS', code: 'PNT', label: 'Pants' },
  { slot: 'BOOTS', code: 'BOT', label: 'Boots' },
  { slot: 'RING_1', code: 'RNG', label: 'Ring' },
  { slot: 'TALISMAN', code: 'TAL', label: 'Talisman' },
];

export const EquipmentSlotGrid: React.FC<EquipmentSlotGridProps> = ({
  hero,
  templates,
  onInspectItem,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Equipped Gear Matrix
        </span>
        <span className="text-[11px] text-slate-400 font-medium">8 Equipment Slots (6 Gear + 2 Acc)</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {MATRIX_SLOTS.map(({ slot, code, label }) => {
          const item = hero.equipment[slot];
          const tpl = item ? templates[item.templateId] : null;
          const color = item ? RARITY_COLORS[item.rarity] || '#CBD5E1' : '#475569';

          return (
            <button
              type="button"
              key={slot}
              onClick={() => item && onInspectItem(item)}
              style={{
                borderColor: item ? `${color}88` : '#334155',
              }}
              className={`relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all active:scale-95 min-h-[64px] cursor-pointer ${
                item
                  ? 'bg-slate-950 hover:bg-slate-900 shadow-sm'
                  : 'bg-slate-950/60 border-dashed opacity-60 hover:opacity-80'
              }`}
            >
              <div
                style={{ color }}
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs shrink-0"
              >
                {code}
              </div>
              <span className={`text-[11px] font-medium truncate w-full text-center mt-1 ${item ? 'text-slate-200' : 'text-slate-500'}`}>
                {tpl ? tpl.name : label}
              </span>

              {item && item.enhanceLevel > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-bold text-[10px] px-1 rounded-full shadow">
                  +{item.enhanceLevel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
