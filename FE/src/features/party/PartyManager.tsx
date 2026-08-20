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
import { Plus, Check, Shield, Target, Sparkles, HeartPulse, Swords } from 'lucide-react';
import { ROLE_COLOR_CONFIG, getTowerSpriteConfig } from '../../engine/tower/TowerSpriteManifest';
import { HeroRole } from '../../domain/heroes/hero.types';

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
        <div className="w-12 h-12 rounded-lg bg-[#0e131d] border border-[#1e293b] flex items-center justify-center text-slate-500 shadow-inner">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-black text-slate-200">No Champions Recruited</h3>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          You currently do not own any champions. Recruit champions from the Altar of Heroes to manage your party.
        </p>
      </div>
    );
  }

  const effectiveHero = allOwnedHeroes.find((h) => h.id === selectedHeroId) || allOwnedHeroes[0];
  const heroClass: HeroClass = (effectiveHero.heroClass as HeroClass) || 'WARRIOR';
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

  const sprite = getTowerSpriteConfig(effectiveHero.templateId, effectiveHero.role as HeroRole);
  const roleConfig = effectiveHero.role && (effectiveHero.role as string) in ROLE_COLOR_CONFIG ? ROLE_COLOR_CONFIG[effectiveHero.role as HeroRole] : null;

  return (
    <div className="w-full flex-1 flex flex-col gap-2.5 p-3 max-w-lg mx-auto pb-6 select-none bg-[#06080e] overflow-y-auto">
      {/* 1. Dynamic Hero Selector Ribbon */}
      <div className="flex gap-2 overflow-x-auto p-1.5 bg-[#0a0e17] rounded-lg border border-[#1e293b] shadow-inner">
        {allOwnedHeroes.map((h) => {
          const isSelected = effectiveHero.id === h.id;
          const inSquad = (coreV2Party || []).includes(h.id);
          const hSprite = getTowerSpriteConfig(h.templateId, h.role);

          return (
            <button
              type="button"
              key={h.id}
              onClick={() => setSelectedHeroId(h.id)}
              className={`py-2 px-2.5 rounded-md text-xs font-black transition-[background,border-color,transform] relative flex flex-col items-center gap-1 min-w-[72px] shrink-0 border cursor-pointer ${
                isSelected
                  ? 'btn-game-amber shadow-md'
                  : 'bg-[#0e131d] border-[#1e293b] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-7 h-7 rounded overflow-hidden bg-slate-950 border border-slate-700/60 flex items-center justify-center">
                {hSprite?.imageSrc ? (
                  <img src={hSprite.imageSrc} alt={h.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px]">{(h.name || 'H')[0]}</span>
                )}
              </div>
              <span className="truncate max-w-[68px] text-[11px] font-bold">{h.name || h.templateId}</span>
              <span className={`text-[9px] font-mono ${isSelected ? 'text-slate-900 font-black' : 'text-slate-400'}`}>
                {inSquad ? 'In Squad' : `Lv.${h.level || 1}`}
              </span>
              {inSquad && !isSelected && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Hero Header Showcase Card */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#141b2b] via-[#101623] to-[#0d121c] border border-[#263348] rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#080b12] border border-amber-400/50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {sprite?.imageSrc ? (
              <img src={sprite.imageSrc} alt={effectiveHero.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-base font-black text-amber-400">{(effectiveHero.name || 'H')[0]}</span>
            )}
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-100 truncate">
                {effectiveHero?.name || effectiveHero?.templateId}
              </span>
              <span className="bg-[#080b12] text-amber-400 font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-amber-500/40">
                Lv.{effectiveHero?.level || 1}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant={isInSquad ? 'success' : 'neutral'} size="xs">
                {isInSquad ? 'Active Combat Squad' : 'Reserve Roster'}
              </Badge>
              {roleConfig && (
                <span className="text-[10px] text-slate-400 font-mono font-semibold">
                  {effectiveHero.role}
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          {isInSquad ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => removeHeroFromCoreParty(effectiveHero.id)}
            >
              <Check size={12} className="mr-1" aria-hidden="true" /> Dismiss
            </Button>
          ) : (
            <Button
              size="sm"
              variant="accent"
              onClick={() => addHeroToCoreParty(effectiveHero.id)}
            >
              <Plus size={12} className="mr-1" aria-hidden="true" /> Deploy
            </Button>
          )}
        </div>
      </div>

      {/* 3. Combat Attributes Matrix */}
      <CombatStatsMatrix stats={totalStats} />

      {/* 4. Equipment Matrix */}
      <EquipmentSlotGrid
        hero={effectiveHero}
        selectedHeroClass={heroClass}
        templates={templates}
        onInspectItem={(item) => setInspectingItem(item)}
      />

      {/* 5. Item Inspection Drawer */}
      {inspectingItem && (
        <ItemInspectionDrawer
          item={inspectingItem}
          template={templates[inspectingItem.templateId]}
          selectedHeroClass={heroClass}
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
