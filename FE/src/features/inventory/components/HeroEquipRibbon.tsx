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
    <div className="bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-amber-950/20 border border-amber-500/40 rounded-2xl p-3 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          Equipped Gear ({selectedHeroClass})
        </span>
        <span className="text-xs text-amber-200/60 font-medium">Tap item to inspect / unequip</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {ALL_SLOTS.map(({ slot, code, label }) => {
          const item = hero.equipment[slot];
          const tpl = item ? templates[item.templateId] : null;
          const color = item ? RARITY_COLORS[item.rarity] || '#CBD5E1' : '#F59E0B';

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
                borderColor: item ? color : 'rgba(245, 158, 11, 0.2)',
                boxShadow: item ? `0 0 6px ${color}25` : 'none',
              }}
              className={`relative flex flex-col items-center justify-between h-14 p-1 rounded-xl border-2 transition-all active:scale-95 ${
                item
                  ? 'bg-gradient-to-b from-slate-850 to-slate-950 hover:from-slate-800 shadow-sm'
                  : 'bg-amber-950/10 border-dashed hover:bg-amber-900/20 opacity-50'
              }`}
            >
              <div
                style={{ color: item ? color : 'rgba(245, 158, 11, 0.4)' }}
                className="w-6 h-6 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-xs shrink-0 shadow-inner"
              >
                {item && tpl ? tpl.name.charAt(0) : code}
              </div>
              <span className={`text-xs truncate w-full text-center font-bold leading-none mb-0.5 ${item ? 'text-slate-100' : 'text-amber-200/50'}`}>
                {label}
              </span>

              {item && item.enhanceLevel > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-amber-400 text-slate-950 font-black text-xs px-1 rounded-full shadow">
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
