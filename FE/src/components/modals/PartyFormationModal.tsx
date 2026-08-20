'use client';

import React from 'react';
import { ModalShell } from '@/components/ui/ModalShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useGameStore } from '@/store/useGameStore';
import { HeroClass } from '@/types/enums';
import {
  Users,
  Shield,
  Crosshair,
  Wand2,
  HeartHandshake,
  Swords,
  Sparkles,
  Zap,
  CheckCircle2,
  PlusCircle,
  X,
} from 'lucide-react';
import { getTowerSpriteConfig, ROLE_COLOR_CONFIG } from '@/engine/tower/TowerSpriteManifest';
import { HeroRole } from '@/domain/heroes/hero.types';

const SLOT_ROLES = [
  { index: 0, label: 'Frontline', role: 'Vanguard', icon: Shield },
  { index: 1, label: 'Midline', role: 'Tactical', icon: Wand2 },
  { index: 2, label: 'Backline', role: 'Marksman', icon: Crosshair },
];

export const PartyFormationModal: React.FC = () => {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const addFloatingText = useGameStore((state) => state.addFloatingText);

  // Core v2 State
  const ownedHeroesById = useGameStore((state) => state.ownedHeroesById || {});
  const coreV2Party = useGameStore((state) => state.coreV2Party || []);
  const addHeroToCoreParty = useGameStore((state) => state.addHeroToCoreParty);
  const removeHeroFromCoreParty = useGameStore((state) => state.removeHeroFromCoreParty);
  const setCoreV2Party = useGameStore((state) => state.setCoreV2Party);

  const isOpen = activeModal === 'CORE_PARTY_FORMATION';

  const allOwnedHeroes: any[] = Object.values(ownedHeroesById || {});
  const partyIds = coreV2Party || [];
  const deployedHeroes = partyIds.map((id) => ownedHeroesById[id]).filter(Boolean);
  const reserveHeroes = allOwnedHeroes.filter((h) => !partyIds.includes(h.id));

  // Calculate squad total ATK power
  const totalSquadATK = deployedHeroes.reduce((acc, h) => {
    const atk = h.towerStats?.atk || h.computedStats?.physAtk || 100;
    return acc + atk;
  }, 0);

  // Auto-Deploy Best Squad (Highest ATK 3 heroes)
  const handleAutoDeploy = () => {
    if (allOwnedHeroes.length === 0) return;
    const sorted = [...allOwnedHeroes].sort((a, b) => {
      const atkA = a.towerStats?.atk || a.computedStats?.physAtk || 100;
      const atkB = b.towerStats?.atk || b.computedStats?.physAtk || 100;
      return atkB - atkA;
    });

    const best3 = sorted.slice(0, 3).map((h) => h.id);
    setCoreV2Party(best3);
    addFloatingText?.('Auto-optimized squad formation!', 180, 70, '#F59E0B', true);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={closeModal}
      icon={<Users size={18} className="text-cyan-400" />}
      title="Battle Squad Formation"
      description={`Squad Power: ${Math.round(totalSquadATK).toLocaleString()} ATK`}
    >
      <div className="space-y-3">
        {/* 1. Active Deployment 3 Slots */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Swords size={13} className="text-cyan-400" aria-hidden="true" />
              <span>Active Squad ({partyIds.length}/3)</span>
            </span>
            <span className="text-slate-400 text-[11px] font-normal">Tap X to bench</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {SLOT_ROLES.map((slot) => {
              const hero = deployedHeroes[slot.index];
              const SlotIcon = slot.icon;

              if (hero) {
                const sprite = getTowerSpriteConfig(hero.templateId, hero.role as HeroRole);
                const roleConfig = hero.role && hero.role in ROLE_COLOR_CONFIG ? ROLE_COLOR_CONFIG[hero.role as HeroRole] : null;
                const heroATK = hero.towerStats?.atk || hero.computedStats?.physAtk || 100;

                return (
                  <div
                    key={hero.id}
                    className="relative bg-[#101623] rounded-lg border border-cyan-500/40 p-2 flex flex-col items-center justify-between gap-1 shadow-sm group"
                  >
                    {/* Bench button */}
                    <button
                      type="button"
                      onClick={() => removeHeroFromCoreParty(hero.id)}
                      aria-label={`Remove ${hero.name || hero.templateId} from squad`}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white flex items-center justify-center transition z-10 cursor-pointer"
                    >
                      <X size={12} aria-hidden="true" />
                    </button>

                    {/* Slot badge */}
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-tight bg-[#080b12] px-1.5 py-0.5 rounded border border-[#1e293b] flex items-center gap-1">
                      <SlotIcon size={10} aria-hidden="true" />
                      <span>{slot.label}</span>
                    </span>

                    {/* Avatar */}
                    <div className="w-11 h-11 rounded overflow-hidden border border-[#222d3d] bg-[#080b12] flex items-center justify-center my-0.5 shadow-inner">
                      {sprite?.imageSrc ? (
                        <img
                          src={sprite.imageSrc}
                          alt={hero.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-amber-300">{(hero.name || 'H')[0]}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="w-full text-center truncate">
                      <div className="text-[11px] font-bold text-slate-100 truncate">
                        {hero.name || hero.templateId}
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono tabular-nums">
                        {Math.round(heroATK)} ATK
                      </div>
                    </div>
                  </div>
                );
              }

              // Empty Slot
              return (
                <div
                  key={`empty_${slot.index}`}
                  className="rounded-lg border border-dashed border-[#1e293b] bg-[#080b12]/60 p-2.5 flex flex-col items-center justify-center gap-1.5 min-h-[110px] text-slate-500"
                >
                  <SlotIcon size={18} className="text-slate-600" aria-hidden="true" />
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-slate-400">Empty</div>
                    <div className="text-[10px] text-slate-500">{slot.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Squad Synergy Banner */}
        <Card variant="raised" padding="sm" className="flex items-center gap-2 border-amber-500/30">
          <div className="w-7 h-7 rounded-md bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Sparkles size={14} aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300">
              {partyIds.length === 3 ? 'Full 3-Hero Synergy Active (+10% Squad ATK)' : 'Deploy 3 Heroes'}
            </div>
            <div className="text-[11px] text-slate-400">
              {partyIds.length === 3
                ? 'Passive combat bonuses and optimal turn order enabled'
                : 'Deploy 3 heroes to activate full squad passive bonuses'}
            </div>
          </div>
        </Card>

        {/* 3. Reserve Heroes Section */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-slate-300">
            <span>Reserve Champions ({reserveHeroes.length})</span>
          </div>

          {reserveHeroes.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {reserveHeroes.map((hero) => {
                const sprite = getTowerSpriteConfig(hero.templateId, hero.role);
                const heroATK = hero.towerStats?.atk || hero.computedStats?.physAtk || 100;

                return (
                  <Card
                    key={hero.id}
                    variant="base"
                    padding="sm"
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded overflow-hidden border border-[#222d3d] bg-[#080b12] shrink-0 flex items-center justify-center">
                        {sprite?.imageSrc ? (
                          <img src={sprite.imageSrc} alt={hero.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-amber-300">{(hero.name || 'H')[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                          <span>{hero.name || hero.templateId}</span>
                          <span className="text-[10px] text-amber-400 font-mono">
                            Lv.{hero.level || 1}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                          {hero.role || 'HERO'} • {Math.round(heroATK)} ATK
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={partyIds.length < 3 ? 'accent' : 'secondary'}
                      onClick={() => addHeroToCoreParty(hero.id)}
                    >
                      <PlusCircle size={12} className="mr-1" aria-hidden="true" /> Deploy
                    </Button>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-2.5 bg-[#080b12] rounded-md border border-[#1e293b] text-xs text-slate-500">
              All recruited champions deployed in combat squad.
            </div>
          )}
        </div>

        {/* 4. Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="secondary" onClick={handleAutoDeploy}>
            <Zap size={14} className="mr-1 text-amber-400" aria-hidden="true" /> Auto-Deploy
          </Button>

          <Button variant="primary" onClick={closeModal}>
            <CheckCircle2 size={14} className="mr-1" aria-hidden="true" /> Confirm Squad
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};

export default PartyFormationModal;
