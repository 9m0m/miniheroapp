'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { ModalShell } from '../ui/ModalShell';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sparkles, Swords, Package } from 'lucide-react';
import { RARITY_COLORS } from '@/types/enums';

export const ChestRewardModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const openedRewardItem = useGameStore((state) => state.openedRewardItem);
  const closeChestRewardModal = useGameStore((state) => state.closeChestRewardModal);
  const templates = useGameStore((state) => state.templates);
  const selectedHeroClass = useGameStore((state) => state.selectedHeroClass);
  const equipItem = useGameStore((state) => state.equipItem);

  if (activeModal !== 'CHEST_REWARD' || !openedRewardItem) return null;

  const template = templates[openedRewardItem.templateId];
  if (!template) return null;

  const rarityVariant = `rarity-${openedRewardItem.rarity.toLowerCase()}` as any;
  const color = RARITY_COLORS[openedRewardItem.rarity] || '#94A3B8';

  const handleEquipNow = () => {
    equipItem(selectedHeroClass, openedRewardItem);
    closeChestRewardModal();
  };

  return (
    <ModalShell
      isOpen={activeModal === 'CHEST_REWARD' && !!openedRewardItem}
      onClose={closeChestRewardModal}
      icon={<Sparkles size={18} className="text-amber-400" />}
      title="Treasure Discovered"
      description="New tactical relic unsealed from chest"
    >
      <div className="space-y-3">
        {/* Item Showcase Card */}
        <div
          style={{ borderColor: color }}
          className="flex flex-col items-center gap-2 p-3.5 bg-[#080b12] border-2 rounded-lg shadow-xl"
        >
          <div
            style={{ color, borderColor: color }}
            className="w-14 h-14 rounded-lg bg-[#101623] border flex items-center justify-center font-black text-xl relative my-0.5 shadow-inner"
          >
            <span>{template.icon || template.name.charAt(0)}</span>
            {openedRewardItem.enhanceLevel > 0 && (
              <span className="absolute top-1 right-1 text-[9px] font-black bg-amber-400 text-slate-950 px-1 rounded font-mono">
                +{openedRewardItem.enhanceLevel}
              </span>
            )}
          </div>

          <div className="text-center">
            <h4 style={{ color }} className="font-black text-sm">{template.name}</h4>
            <div className="flex items-center justify-center gap-2 mt-0.5 font-mono text-[10px]">
              <span style={{ color }} className="font-bold uppercase">
                {openedRewardItem.rarity}
              </span>
              <span>•</span>
              <span className="text-slate-400">Slot: {template.slot}</span>
              <span>•</span>
              <span className="text-slate-400">iLvl {openedRewardItem.itemLevel}</span>
            </div>
            {template.description && (
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs italic">&ldquo;{template.description}&rdquo;</p>
            )}
          </div>

          {/* Base Stats Preview */}
          <div className="w-full grid grid-cols-2 gap-1 pt-2 border-t border-[#1e293b] text-xs font-mono">
            {template.baseStats.physAtk ? (
              <div className="bg-[#101623] p-1.5 rounded border border-[#1e293b] flex justify-between text-rose-400 font-bold">
                <span>Phys ATK:</span>
                <span>+{template.baseStats.physAtk}</span>
              </div>
            ) : null}
            {template.baseStats.magicAtk ? (
              <div className="bg-[#101623] p-1.5 rounded border border-[#1e293b] flex justify-between text-purple-400 font-bold">
                <span>Magic ATK:</span>
                <span>+{template.baseStats.magicAtk}</span>
              </div>
            ) : null}
            {template.baseStats.armor ? (
              <div className="bg-[#101623] p-1.5 rounded border border-[#1e293b] flex justify-between text-blue-400 font-bold">
                <span>Armor:</span>
                <span>+{template.baseStats.armor}</span>
              </div>
            ) : null}
            {template.baseStats.maxHp ? (
              <div className="bg-[#101623] p-1.5 rounded border border-[#1e293b] flex justify-between text-emerald-400 font-bold">
                <span>Max HP:</span>
                <span>+{template.baseStats.maxHp}</span>
              </div>
            ) : null}
            {template.baseStats.critRate ? (
              <div className="bg-[#101623] p-1.5 rounded border border-[#1e293b] flex justify-between text-yellow-400 font-bold">
                <span>Crit Rate:</span>
                <span>+{template.baseStats.critRate}%</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <Button variant="secondary" onClick={closeChestRewardModal} className="min-h-[44px]">
            <Package size={14} className="mr-1" aria-hidden="true" />
            <span>Store in Bag</span>
          </Button>

          <Button variant="accent" onClick={handleEquipNow} className="min-h-[44px] font-black uppercase tracking-wider">
            <Swords size={14} className="mr-1" aria-hidden="true" />
            <span>Equip Now</span>
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};

export default ChestRewardModal;
