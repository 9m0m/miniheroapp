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
    <div className="bg-[#0e131d] border border-[#1e293b] rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#1e293b]">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Equipped Gear Matrix
        </span>
        <span className="text-[10px] text-slate-400 font-mono">8 Tactical Slots</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {MATRIX_SLOTS.map(({ slot, code, label }) => {
          const item = hero.equipment[slot];
          const tpl = item ? templates[item.templateId] : null;
          const color = item ? RARITY_COLORS[item.rarity] || '#CBD5E1' : '#334155';

          return (
            <button
              type="button"
              key={slot}
              onClick={() => item && onInspectItem(item)}
              style={{
                borderColor: item ? `${color}aa` : '#1e293b',
                boxShadow: item ? `inset 0 0 8px ${color}15` : 'none',
              }}
              className={`relative flex flex-col items-center justify-between p-2 rounded-md border transition-[background,border-color,transform] active:scale-95 min-h-[66px] cursor-pointer ${
                item
                  ? 'bg-[#101623] hover:bg-[#161e30]'
                  : 'bg-[#080b12] border-dashed opacity-50 hover:opacity-80'
              }`}
            >
              <div
                style={{ color }}
                className="w-7 h-7 rounded bg-[#080b12] border border-[#1e293b] flex items-center justify-center font-bold text-xs shrink-0 shadow-inner"
              >
                {code}
              </div>
              <span className={`text-[10px] font-bold truncate w-full text-center mt-1 ${item ? 'text-slate-200' : 'text-slate-500'}`}>
                {tpl ? tpl.name : label}
              </span>

              {item && item.enhanceLevel > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[9px] px-1 rounded shadow">
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

export default EquipmentSlotGrid;
