'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { ModalShell } from '../ui/ModalShell';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Sparkles, Swords, Package } from 'lucide-react';

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
      description="New relic unlocked from chest"
    >
      <div className="space-y-3">
        {/* Item Showcase Card */}
        <Card variant="base" padding="md" className="flex flex-col items-center gap-2.5">
          <div className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center text-3xl relative my-1">
            <span>{template.icon}</span>
            {openedRewardItem.enhanceLevel > 0 && (
              <span className="absolute top-1 right-1 text-xs font-bold bg-amber-500 text-slate-950 px-1 rounded font-mono">
                +{openedRewardItem.enhanceLevel}
              </span>
            )}
          </div>

          <div className="text-center">
            <h4 className="font-bold text-sm text-slate-100">{template.name}</h4>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge variant={rarityVariant} size="sm">
                {openedRewardItem.rarity}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">Slot: {template.slot}</span>
              <span className="text-xs text-slate-400 font-mono">iLvl {openedRewardItem.itemLevel}</span>
            </div>
            {template.description && (
              <p className="text-xs text-slate-400 mt-1 max-w-xs">{template.description}</p>
            )}
          </div>

          {/* Base Stats Preview */}
          <div className="w-full grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800 text-xs font-mono">
            {template.baseStats.physAtk ? (
              <div className="bg-slate-900 p-1.5 rounded-md border border-slate-800 flex justify-between text-rose-300">
                <span>Phys ATK:</span>
                <span className="font-bold">+{template.baseStats.physAtk}</span>
              </div>
            ) : null}
            {template.baseStats.magicAtk ? (
              <div className="bg-slate-900 p-1.5 rounded-md border border-slate-800 flex justify-between text-purple-300">
                <span>Magic ATK:</span>
                <span className="font-bold">+{template.baseStats.magicAtk}</span>
              </div>
            ) : null}
            {template.baseStats.armor ? (
              <div className="bg-slate-900 p-1.5 rounded-md border border-slate-800 flex justify-between text-blue-300">
                <span>Armor:</span>
                <span className="font-bold">+{template.baseStats.armor}</span>
              </div>
            ) : null}
            {template.baseStats.maxHp ? (
              <div className="bg-slate-900 p-1.5 rounded-md border border-slate-800 flex justify-between text-emerald-300">
                <span>Max HP:</span>
                <span className="font-bold">+{template.baseStats.maxHp}</span>
              </div>
            ) : null}
            {template.baseStats.critRate ? (
              <div className="bg-slate-900 p-1.5 rounded-md border border-slate-800 flex justify-between text-yellow-300">
                <span>Crit Rate:</span>
                <span className="font-bold">+{template.baseStats.critRate}%</span>
              </div>
            ) : null}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="secondary" onClick={closeChestRewardModal}>
            <Package size={14} className="mr-1" aria-hidden="true" />
            <span>Store in Bag</span>
          </Button>

          <Button variant="accent" onClick={handleEquipNow}>
            <Swords size={14} className="mr-1" aria-hidden="true" />
            <span>Equip Now</span>
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};
