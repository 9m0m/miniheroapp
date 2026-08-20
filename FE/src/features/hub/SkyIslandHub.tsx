'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { BuildingNode } from './components/BuildingNode';
import {
  Swords,
  Sparkles,
  Compass,
  Wrench,
  ClipboardList,
  Trophy,
  Users,
  ChevronRight,
  Plus,
  Shield,
  Target,
  Wand2,
  Compass as ObjectiveIcon,
} from 'lucide-react';
import { ROLE_COLOR_CONFIG, getTowerSpriteConfig } from '@/engine/tower/TowerSpriteManifest';
import { HeroRole } from '@/domain/heroes/hero.types';

interface SkyIslandHubProps {
  isTowerV2Enabled?: boolean;
  onOpenTower: () => void;
  onOpenRecruitment: () => void;
  onOpenExpedition: () => void;
  onOpenWorkshop: () => void;
  onOpenQuests: () => void;
  onOpenArena: () => void;
  onOpenHeroes: () => void;
}

export const SkyIslandHub: React.FC<SkyIslandHubProps> = ({
  isTowerV2Enabled = true,
  onOpenTower,
  onOpenRecruitment,
  onOpenExpedition,
  onOpenWorkshop,
  onOpenQuests,
  onOpenArena,
  onOpenHeroes,
}) => {
  const towerProgress = useGameStore((s) => s.towerProgress);
  const activeExpeditions = useGameStore((s) => s.activeExpeditions || []);
  const ownedHeroesById = useGameStore((s) => s.ownedHeroesById || {});
  const coreV2Party = useGameStore((s) => s.coreV2Party || []);
  const onboardingState = useGameStore((s) => s.onboardingState);

  const ownedHeroesList = Object.values(ownedHeroesById);
  const currentFloor = towerProgress?.currentFloor || 1;
  const maxCleared = towerProgress?.highestFloorCleared || 0;
  const squadHeroes = coreV2Party.map((id) => ownedHeroesById[id]).filter(Boolean) as any[];

  const expeditionDot = activeExpeditions.length > 0 ? 'active' : 'idle';
  const recruitDot = ownedHeroesList.length === 0 ? 'ready' : 'idle';

  // Determine current Next Objective in normal document flow
  const resolveObjective = () => {
    if (!onboardingState || onboardingState.step === 'WELCOME') {
      return {
        text: 'Recruit your frontline Knight to assemble your squad.',
        actionLabel: 'Recruit',
        action: onOpenRecruitment,
      };
    }
    if (onboardingState.step === 'SUMMON_KNIGHT_REQUIRED') {
      return {
        text: 'Perform guaranteed Knight summon at the Altar of Heroes.',
        actionLabel: 'Altar',
        action: onOpenRecruitment,
      };
    }
    if (onboardingState.step === 'SUMMON_RANGER_REQUIRED') {
      return {
        text: 'Recruit your second champion to reinforce the squad.',
        actionLabel: 'Recruit',
        action: onOpenRecruitment,
      };
    }
    if (
      onboardingState.step === 'FIRST_EXPEDITION_REQUIRED' ||
      onboardingState.step === 'FIRST_EXPEDITION_RUNNING' ||
      onboardingState.step === 'FIRST_EXPEDITION_CLAIM_REQUIRED'
    ) {
      return {
        text: 'Dispatch heroes on patrol to earn your 3rd ticket & starter gear.',
        actionLabel: 'Patrol',
        action: onOpenExpedition,
      };
    }
    if (onboardingState.step === 'THIRD_SUMMON_REQUIRED') {
      return {
        text: 'Use your earned ticket to complete your 3-hero squad.',
        actionLabel: 'Summon',
        action: onOpenRecruitment,
      };
    }
    if (squadHeroes.length < 3) {
      return {
        text: `Deploy ${3 - squadHeroes.length} more hero${3 - squadHeroes.length > 1 ? 'es' : ''} to ready your 3v3 squad.`,
        actionLabel: 'Edit Squad',
        action: onOpenHeroes,
      };
    }
    return {
      text: `Challenge Floor ${currentFloor} of The Infinite Tower.`,
      actionLabel: 'Ascend',
      action: isTowerV2Enabled ? onOpenTower : () => {},
    };
  };

  const objective = resolveObjective();

  const SLOT_LABELS = ['Front', 'Mid', 'Back'];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#06080e] text-slate-100 select-none pb-6">
      {/* ─── 1. Header Section: Sanctuary Base Title ─────────────── */}
      <div className="relative overflow-hidden px-4 pt-4 pb-3 border-b border-[#1e293b] bg-gradient-to-b from-[#141b2b]/50 to-transparent">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Sky Sanctuary
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#0e131d] px-2 py-0.5 rounded border border-[#1e293b]">
            Season 1
          </span>
        </div>

        <h1 className="text-base font-black tracking-tight text-slate-100 leading-tight">
          Tactical Command Center
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Celestial Aerial Fortress · 3v3 Turn Strategy
        </p>
      </div>

      {/* ─── 2. Next Objective Directive (Normal Document Flow) ───── */}
      <div className="px-3 pt-2.5">
        <div className="rounded-lg border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-[#101623] to-[#0d121c] p-2.5 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-amber-500/15 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-400 shadow-inner">
              <ObjectiveIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">
                Next Directive
              </span>
              <p className="text-[11px] font-medium text-slate-200 truncate mt-0.5">{objective.text}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={objective.action}
            className="min-h-[36px] px-3.5 btn-game-amber text-xs font-black rounded-md shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            {objective.actionLabel}
          </button>
        </div>
      </div>

      {/* ─── 3. Active Squad Strip (3 Structured Party Slots) ─────── */}
      <div className="px-3 pt-2.5">
        <div className="rounded-lg border border-[#1e293b] bg-[#0e131d] p-2.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2} aria-hidden="true" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                Combat Squad ({squadHeroes.length}/3)
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenHeroes}
              className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer focus-visible:ring-1 focus-visible:ring-amber-400 rounded px-1"
            >
              <span>Manage Party</span>
              <ChevronRight className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((index) => {
              const hero = squadHeroes[index];
              const slotLabel = SLOT_LABELS[index];

              if (hero) {
                const roleConfig = hero.role && (hero.role as string) in ROLE_COLOR_CONFIG ? ROLE_COLOR_CONFIG[hero.role as HeroRole] : null;
                const sprite = getTowerSpriteConfig(hero.templateId, hero.role as HeroRole);

                return (
                  <div
                    key={hero.id || index}
                    className="relative min-h-[50px] flex items-center gap-2 p-1.5 rounded-md bg-[#131926] border border-[#222d3d] min-w-0 shadow-inner"
                  >
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs border overflow-hidden shrink-0 ${
                        roleConfig ? `${roleConfig.border} ${roleConfig.bg}` : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      {sprite?.imageSrc ? (
                        <img src={sprite.imageSrc} alt={hero.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-amber-300 text-[10px]">{(hero.name || 'H')[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-100 truncate">
                          {hero.name || 'Hero'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                        <span className="text-amber-400">Lv.{hero.level || 1}</span>
                        <span>•</span>
                        <span>{slotLabel}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={`empty-${index}`}
                  type="button"
                  onClick={onOpenHeroes}
                  className="min-h-[50px] flex items-center justify-center gap-1 p-1.5 rounded-md bg-[#0a0e17] border border-dashed border-[#1e293b] hover:border-amber-500/50 hover:bg-[#111724] active:scale-95 text-slate-500 hover:text-slate-300 text-[10px] font-semibold cursor-pointer transition-colors"
                  aria-label={`Slot ${index + 1} (${slotLabel}): Empty, tap to deploy champion`}
                >
                  <Plus className="w-3 h-3 text-amber-500/70" />
                  <span>{slotLabel} Slot</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 4. Centerpiece Activity: The Infinite Tower ─────────── */}
      <div className="px-3 pt-2.5">
        <BuildingNode
          Icon={Swords}
          title="The Infinite Tower"
          subtitle="3v3 tactical turn-based floor battles"
          accentColor="amber"
          statusDot={maxCleared > 0 ? 'active' : 'idle'}
          statusText={
            isTowerV2Enabled
              ? `Target: Floor ${currentFloor}/30 · Cleared: ${maxCleared}/30`
              : 'Tower V2 Inactive'
          }
          isPrimary={true}
          disabled={!isTowerV2Enabled}
          dataTutorialTarget="building-tower"
          onClick={onOpenTower}
        />
      </div>

      {/* ─── 5. Operations: Altar & Expedition ──────────────────── */}
      <div className="px-3 pt-2.5 flex flex-col gap-1.5">
        <div className="px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Operations
          </span>
        </div>

        <BuildingNode
          Icon={Sparkles}
          title="Altar of Heroes"
          subtitle="Celestial champion recruitment & star ascension"
          accentColor="indigo"
          statusDot={recruitDot}
          statusText={`${ownedHeroesList.length} Champions Roster · Fair Pity Active`}
          dataTutorialTarget="building-recruitment"
          onClick={onOpenRecruitment}
        />

        <BuildingNode
          Icon={Compass}
          title="Expeditions"
          subtitle="Dispatch heroes on timed patrol missions for loot"
          accentColor="cyan"
          statusDot={expeditionDot}
          statusText={
            activeExpeditions.length > 0
              ? `${activeExpeditions.length}/1 Active Patrol in Progress`
              : 'Idle · Ready to dispatch heroes'
          }
          dataTutorialTarget="building-expedition"
          onClick={onOpenExpedition}
        />
      </div>

      {/* ─── 6. Utilities: Forge, Quests, Arena ─────────────────── */}
      <div className="px-3 pt-2.5 flex flex-col gap-1.5">
        <div className="px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Utilities
          </span>
        </div>

        <BuildingNode
          Icon={Wrench}
          title="Ancient Forge & Workshop"
          subtitle="Craft, enhance gear (+15), and fuse in The Cube"
          accentColor="emerald"
          statusText="Forge · The Cube · Dismantle Station"
          onClick={onOpenWorkshop}
        />

        <BuildingNode
          Icon={ClipboardList}
          title="Hall of Quests & Pass"
          subtitle="Daily bounties, weekly milestones & streak pass"
          accentColor="amber"
          statusText="Milestones & Awakening Rewards"
          onClick={onOpenQuests}
        />

        <BuildingNode
          Icon={Trophy}
          title="Trial Arena & Vault"
          subtitle="Real-time DPS training dummy & boss speedrun"
          accentColor="rose"
          statusText="Season 1 Active · Global Leaderboard"
          onClick={onOpenArena}
        />
      </div>
    </div>
  );
};

export default SkyIslandHub;
