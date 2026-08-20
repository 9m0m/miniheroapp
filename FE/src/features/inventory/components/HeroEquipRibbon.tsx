import React from 'react';
import { HeroClass, ItemSlot, RARITY_COLORS } from '../../../types/enums';
import { Hero } from '../../../types/hero.types';
import { ItemTemplate } from '../../../types/item.types';

interface HeroEquipRibbonProps {
  hero: Hero;
  selectedHeroClass: HeroClass;
  templates: Record<string, ItemTemplate>;
  onSelectSlot: (slot: ItemSlot) => void;
  onInspectItem: (item: any) => void;
}

const ALL_SLOTS: { slot: ItemSlot; code: string; label: string }[] = [
  { slot: 'MAIN_HAND', code: 'WPN', label: 'Main' },
  { slot: 'OFF_HAND', code: 'OFF', label: 'Off' },
  { slot: 'HELMET', code: 'HLM', label: 'Helm' },
  { slot: 'ARMOR', code: 'ARM', label: 'Armor' },
  { slot: 'PANTS', code: 'PNT', label: 'Pants' },
  { slot: 'BOOTS', code: 'BOT', label: 'Boots' },
  { slot: 'RING_1', code: 'RNG', label: 'Ring' },
  { slot: 'TALISMAN', code: 'TAL', label: 'Talis' },
];

export const HeroEquipRibbon: React.FC<HeroEquipRibbonProps> = ({
  hero,
  selectedHeroClass,
  templates,
  onSelectSlot,
  onInspectItem,
}) => {
  return (
    <div className="bg-[#0e131d] border border-[#1e293b] rounded-lg p-2.5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          Equipped Gear ({selectedHeroClass})
        </span>
        <span className="text-[10px] text-slate-400 font-mono">Tap gear to inspect</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {ALL_SLOTS.map(({ slot, code, label }) => {
          const item = hero.equipment[slot];
          const tpl = item ? templates[item.templateId] : null;
          const color = item ? RARITY_COLORS[item.rarity] || '#CBD5E1' : '#475569';

          return (
            <button
              type="button"
              key={slot}
              onClick={() => {
                if (item) {
                  onInspectItem(item);
                } else {
                  onSelectSlot(slot);
                }
              }}
              style={{
                borderColor: item ? `${color}aa` : '#1e293b',
                boxShadow: item ? `inset 0 0 6px ${color}15` : 'none',
              }}
              className={`relative flex flex-col items-center justify-between h-14 p-1 rounded-md border transition-all active:scale-95 cursor-pointer ${
                item
                  ? 'bg-[#101623] hover:bg-[#161e30]'
                  : 'bg-[#080b12] border-dashed opacity-50 hover:opacity-80'
              }`}
            >
              <div
                style={{ color }}
                className="w-6 h-6 rounded bg-[#080b12] border border-[#1e293b] flex items-center justify-center font-black text-xs shrink-0 shadow-inner"
              >
                {item && tpl ? tpl.name.charAt(0) : code}
              </div>
              <span className={`text-[10px] truncate w-full text-center font-bold leading-none mb-0.5 ${item ? 'text-slate-200' : 'text-slate-500'}`}>
                {label}
              </span>

              {item && item.enhanceLevel > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-amber-400 text-slate-950 font-black text-[9px] px-1 rounded shadow">
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

export default HeroEquipRibbon;
