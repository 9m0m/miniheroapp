'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { HeroClass } from '../../types/enums';
import { ItemInstance } from '../../types/item.types';
import { EquipmentSlotGrid } from './components/EquipmentSlotGrid';
import { CombatStatsMatrix } from './components/CombatStatsMatrix';
import { ItemInspectionDrawer } from '../inventory/components/ItemInspectionDrawer';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Plus, Check, Shield, Target, Sparkles, HeartPulse, AlertTriangle } from 'lucide-react';

const CLASS_ICONS: Record<HeroClass, React.ElementType> = {
  WARRIOR: Shield,
  RANGER: Target,
  MAGE: Sparkles,
  PRIEST: HeartPulse,
};

export default function PartyManager() {
  const ownedHeroesById = useGameStore((state) => state.ownedHeroesById);
  const coreV2Party = useGameStore((state) => state.coreV2Party);
  const addHeroToCoreParty = useGameStore((state) => state.addHeroToCoreParty);
  const removeHeroFromCoreParty = useGameStore((state) => state.removeHeroFromCoreParty);
  const templates = useGameStore((state) => state.templates);
  const unequipItem = useGameStore((state) => state.unequipItem);

  const [inspectingItem, setInspectingItem] = useState<ItemInstance | null>(null);
  const [selectedHeroId, setSelectedHeroId] = useState<string>('');

  // Authoritative Core v2 list of owned heroes
  const allOwnedHeroes: any[] = Object.values(ownedHeroesById || {});

  if (allOwnedHeroes.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center gap-3 select-none">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-300">No Heroes Recruited</h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          You currently do not own any heroes. Recruit heroes from the Altar to manage your party.
        </p>
      </div>
    );
  }

  const effectiveHero = allOwnedHeroes.find((h) => h.id === selectedHeroId) || allOwnedHeroes[0];

  // heroClass is null for classless Core v2 heroes — never coerce to WARRIOR
  const heroClass: HeroClass | null = effectiveHero.heroClass
    ? (effectiveHero.heroClass as HeroClass)
    : null;

  // Equipment mutations are only safe for heroes that have a genuine legacy heroClass.
  // For classless Core heroes we show a read-only view to avoid mutating the wrong class path.
  const hasLegacyClass = heroClass !== null;

  const isInSquad = (coreV2Party || []).includes(effectiveHero.id);
  const totalStats = effectiveHero.computedStats || {
    physAtk: 10,
    magicAtk: 0,
    maxHp: 100,
    armor: 10,
    magicResist: 5,
    atkSpeed: 1,
    critRate: 5,
    critDmg: 50,
    dodgeRate: 0,
    blockRate: 0,
    lifeSteal: 0,
    tenacity: 0,
  };

  // Icon for the hero selector: fall back to Shield for classless heroes
  const getHeroIcon = (h: any): React.ElementType => {
    const cls = h.heroClass as HeroClass | undefined;
    return cls ? (CLASS_ICONS[cls] || Shield) : Shield;
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-3 p-3 max-w-lg mx-auto pb-4 select-none">
      {/* 1. Dynamic Hero Selector Bar */}
      <div className="flex gap-1.5 overflow-x-auto p-1.5 bg-slate-950 rounded-xl border border-slate-800 scrollbar-thin">
        {allOwnedHeroes.map((h) => {
          const isSelected = effectiveHero.id === h.id;
          const inSquad = (coreV2Party || []).includes(h.id);
          const Icon = getHeroIcon(h);

          return (
            <button
              type="button"
              key={h.id}
              onClick={() => setSelectedHeroId(h.id)}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-colors relative flex flex-col items-center gap-1 min-w-[72px] shrink-0 ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-black' : 'text-slate-300'} aria-hidden="true" />
              <span className="truncate max-w-[68px]">{h.name || h.templateId}</span>
              <span className={`text-[10px] font-normal ${isSelected ? 'text-black/80' : 'text-slate-400'}`}>
                {inSquad ? 'In Squad' : `Lv. ${h.level || 1}`}
              </span>
              {inSquad && !isSelected && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Hero Header Card & Squad Toggle */}
      <Card variant="raised" padding="md" className="flex items-center justify-between shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-100">{effectiveHero?.name || effectiveHero?.templateId}</span>
            <span className="bg-slate-800 text-amber-300 font-mono text-xs px-2 py-0.5 rounded-md border border-amber-500/30">
              Lv. {effectiveHero?.level || 1}
            </span>
          </div>
          <div>
            <Badge variant={isInSquad ? 'success' : 'neutral'} size="sm">
              {isInSquad ? 'In Combat Squad' : 'In Reserve'}
            </Badge>
          </div>
        </div>

        <div>
          {isInSquad ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => removeHeroFromCoreParty(effectiveHero.id)}
            >
              <Check size={13} className="mr-1" aria-hidden="true" /> Dismiss
            </Button>
          ) : (
            <Button
              size="sm"
              variant="accent"
              onClick={() => addHeroToCoreParty(effectiveHero.id)}
            >
              <Plus size={13} className="mr-1" aria-hidden="true" /> Deploy
            </Button>
          )}
        </div>
      </Card>

      {/* 3. Combat Stats Matrix */}
      <CombatStatsMatrix stats={totalStats} />

      {/* 4. Equipment Matrix — disabled for classless Core heroes to prevent class-identity mutation */}
      {hasLegacyClass ? (
        <EquipmentSlotGrid
          hero={effectiveHero}
          selectedHeroClass={heroClass!}
          templates={templates}
          onInspectItem={(item) => setInspectingItem(item)}
        />
      ) : (
        <div className="w-full flex items-start gap-2 p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 text-xs text-amber-300">
          <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-400" aria-hidden="true" />
          <span>
            Equipment management is not available for this hero template — no legacy class mapping exists.
            Equipment changes are handled server-side via the Forge or upgrade screens.
          </span>
        </div>
      )}

      {/* 5. Item Inspection Drawer — only shown when a legacy-class hero has equipment */}
      {inspectingItem && hasLegacyClass && (
        <ItemInspectionDrawer
          item={inspectingItem}
          template={templates[inspectingItem.templateId]}
          selectedHeroClass={heroClass!}
          isEquippedOnHero={true}
          onClose={() => setInspectingItem(null)}
          onEquip={() => {}}
          onUnequip={(cls, slot) => unequipItem(cls, slot)}
          onMoveToStash={() => {}}
          onMoveToBackpack={() => {}}
          onSalvage={() => {}}
        />
      )}
    </div>
  );
}
