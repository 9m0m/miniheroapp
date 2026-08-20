'use client';

import React from 'react';
import { HeroClass, ItemSlot, RARITY_COLORS } from '../../../types/enums';
import { ItemInstance, ItemTemplate } from '../../../types/item.types';
import { computeItemStats } from '../../../engine/statEvaluator';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Shield, Box, Trash2, ArrowUpCircle } from 'lucide-react';

interface ItemInspectionDrawerProps {
  item: ItemInstance | null;
  template: ItemTemplate | null;
  selectedHeroClass: HeroClass;
  isEquippedOnHero: boolean;
  onClose: () => void;
  onEquip: (heroClass: HeroClass, item: ItemInstance) => void;
  onUnequip: (heroClass: HeroClass, slot: ItemSlot) => void;
  onMoveToStash: (item: ItemInstance) => void;
  onMoveToBackpack: (item: ItemInstance) => void;
  onSalvage: (item: ItemInstance) => void;
  onOpenChest?: (chestId: string) => void;
  isInStash?: boolean;
}

export const ItemInspectionDrawer: React.FC<ItemInspectionDrawerProps> = ({
  item,
  template,
  selectedHeroClass,
  isEquippedOnHero,
  onClose,
  onEquip,
  onUnequip,
  onMoveToStash,
  onMoveToBackpack,
  onSalvage,
  onOpenChest,
  isInStash = false,
}) => {
  if (!item || !template) return null;

  const color = RARITY_COLORS[item.rarity] || '#94A3B8';
  const computedStats = computeItemStats(template, item);
  const isChest = template.itemType === 'CHEST' || template.id.startsWith('chest_');
  const isKey = template.itemType === 'KEY' || template.id.startsWith('key_');
  const isEquippable = template.itemType === 'EQUIPMENT' || template.itemType === 'ACCESSORY';
  const isUniversal = template.slot === 'RING_1' || template.slot === 'TALISMAN';
  const classMatches = isUniversal || !template.requiredClass || template.requiredClass === selectedHeroClass;
  const hasStats = Object.values(computedStats).some((val) => typeof val === 'number' && val > 0);

  return (
    <BottomSheet
      isOpen={!!item}
      onClose={onClose}
      icon={<Shield size={18} className="text-cyan-400" />}
      title={
        <div className="flex items-center gap-1.5">
          <span style={{ color }}>{template.name}</span>
          {item.enhanceLevel > 0 && (
            <Badge variant="accent" size="xs">
              +{item.enhanceLevel}
            </Badge>
          )}
        </div>
      }
      description={
        <span className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="font-bold uppercase" style={{ color }}>
            {item.rarity}
          </span>
          <span>•</span>
          <span>{template.itemType || 'ITEM'}</span>
          {isEquippable && (
            <>
              <span>•</span>
              <span>iLvl {item.itemLevel}</span>
              <span>•</span>
              <span>{template.slot}</span>
            </>
          )}
        </span>
      }
    >
      <div className="space-y-3">
        {/* Description */}
        <p className="text-[11px] text-slate-300 italic bg-[#080b12] p-2.5 rounded-md border border-[#1e293b]">
          &ldquo;{template.description}&rdquo;
        </p>

        {/* Stats Grid */}
        {hasStats && isEquippable && (
          <div className="grid grid-cols-2 gap-1.5 text-xs font-mono bg-[#080b12] p-2 rounded-md border border-[#1e293b]">
            {computedStats.physAtk > 0 && (
              <div className="flex justify-between text-rose-400 font-bold bg-[#101623] p-1.5 rounded">
                <span>Phys ATK:</span>
                <span className="tabular-nums">+{computedStats.physAtk}</span>
              </div>
            )}
            {computedStats.magicAtk > 0 && (
              <div className="flex justify-between text-purple-400 font-bold bg-[#101623] p-1.5 rounded">
                <span>Magic ATK:</span>
                <span className="tabular-nums">+{computedStats.magicAtk}</span>
              </div>
            )}
            {computedStats.armor > 0 && (
              <div className="flex justify-between text-blue-400 font-bold bg-[#101623] p-1.5 rounded">
                <span>Armor:</span>
                <span className="tabular-nums">+{computedStats.armor}</span>
              </div>
            )}
            {computedStats.maxHp > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold bg-[#101623] p-1.5 rounded">
                <span>Max HP:</span>
                <span className="tabular-nums">+{computedStats.maxHp}</span>
              </div>
            )}
            {computedStats.critRate > 0 && (
              <div className="flex justify-between text-yellow-400 font-bold bg-[#101623] p-1.5 rounded">
                <span>Crit Rate:</span>
                <span className="tabular-nums">+{computedStats.critRate.toFixed(1)}%</span>
              </div>
            )}
            {computedStats.critDmg > 0 && (
              <div className="flex justify-between text-amber-400 font-bold bg-[#101623] p-1.5 rounded">
                <span>Crit DMG:</span>
                <span className="tabular-nums">+{computedStats.critDmg.toFixed(0)}%</span>
              </div>
            )}
            {computedStats.atkSpeed > 0 && (
              <div className="flex justify-between text-teal-400 font-bold bg-[#101623] p-1.5 rounded">
                <span>Atk Speed:</span>
                <span className="tabular-nums">+{computedStats.atkSpeed.toFixed(2)}</span>
              </div>
            )}
            {computedStats.dmgReduction > 0 && (
              <div className="flex justify-between text-indigo-400 font-bold bg-[#101623] p-1.5 rounded">
                <span>Dmg Reduct:</span>
                <span className="tabular-nums">+{computedStats.dmgReduction.toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {isChest ? (
            <Button
              variant="accent"
              fullWidth
              size="md"
              onClick={() => {
                onOpenChest?.(item.id);
                onClose();
              }}
            >
              <Box size={14} className="mr-1.5" />
              <span>Open Chest Loot</span>
            </Button>
          ) : isEquippedOnHero ? (
            <Button
              variant="danger"
              fullWidth
              size="md"
              onClick={() => {
                onUnequip(selectedHeroClass, template.slot);
                onClose();
              }}
            >
              Unequip to Backpack
            </Button>
          ) : isInStash ? (
            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={() => {
                onMoveToBackpack(item);
                onClose();
              }}
            >
              Move to Backpack
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {isEquippable && (
                  <>
                    {classMatches ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                          onEquip(selectedHeroClass, item);
                          onClose();
                        }}
                      >
                        <ArrowUpCircle size={14} className="mr-1" />
                        <span>Equip ({selectedHeroClass})</span>
                      </Button>
                    ) : (
                      <Button
                        variant="accent"
                        size="md"
                        onClick={() => {
                          if (template.requiredClass) {
                            onEquip(template.requiredClass, item);
                            onClose();
                          }
                        }}
                      >
                        <span>Equip ({template.requiredClass})</span>
                      </Button>
                    )}
                  </>
                )}

                <Button
                  variant="secondary"
                  size="md"
                  fullWidth={!isEquippable}
                  className={!isEquippable ? 'col-span-2' : ''}
                  onClick={() => {
                    onMoveToStash(item);
                    onClose();
                  }}
                >
                  To Stash
                </Button>
              </div>

              {!isKey && (
                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    onSalvage(item);
                    onClose();
                  }}
                >
                  <Trash2 size={13} className="mr-1" />
                  <span>Salvage for Gold & Stones</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};

export default ItemInspectionDrawer;
