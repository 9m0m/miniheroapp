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
  LayoutGrid,
  Plus,
  Compass as ObjectiveIcon,
} from 'lucide-react';

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
        text: 'Recruit your Marksman Ranger for ranged support.',
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
        text: 'Dispatch heroes on a quick 10s patrol to earn your 3rd ticket.',
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

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#08090F] text-slate-100 select-none pb-6">
      {/* ─── 1. Header Section ───────────────────────────────────── */}
      <div className="relative overflow-hidden px-4 pt-5 pb-3 border-b border-slate-800/70">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-transparent"
        />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              World Hero · Core v2
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Season 1</span>
        </div>

        <h1 className="text-lg font-black tracking-tight text-slate-100 leading-tight">
          Command Center
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Celestial Tactical Sanctuary · 3v3 Turn-Based Strategy
        </p>
      </div>

      {/* ─── 2. Next Objective Card (In Document Flow) ───────────── */}
      <div className="px-3 pt-3">
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/25 via-slate-900 to-slate-950 p-3 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
              <ObjectiveIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Next Objective
              </p>
              <p className="text-[11px] text-slate-300 truncate">{objective.text}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={objective.action}
            className="min-h-[36px] px-3 bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            {objective.actionLabel}
          </button>
        </div>
      </div>

      {/* ─── 3. Active Squad Strip (3 Fixed Slots) ───────────────── */}
      <div className="px-3 pt-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} aria-hidden="true" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Squad ({squadHeroes.length}/3)
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenHeroes}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((index) => {
              const hero = squadHeroes[index];
              if (hero) {
                return (
                  <div
                    key={hero.id || index}
                    className="min-h-[44px] flex items-center gap-2 p-2 rounded-lg bg-slate-800 border border-slate-700/80 min-w-0"
                  >
                    <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">
                      {(hero.name || 'H')[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-slate-200 truncate">
                        {hero.name || 'Hero'}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono">Lv. {hero.level || 1}</p>
                    </div>
                  </div>
                );
              }
              return (
                <button
                  key={`empty-${index}`}
                  type="button"
                  onClick={onOpenHeroes}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800/40 border border-dashed border-slate-700/70 hover:bg-slate-800/60 active:scale-95 text-slate-500 hover:text-slate-400 text-xs font-semibold cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-amber-400"
                  aria-label={`Slot ${index + 1}: Empty, tap to add hero`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Add Hero</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 4. Primary Activity: The Infinite Tower ─────────────── */}
      <div className="px-3 pt-3">
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
      <div className="px-3 pt-3 flex flex-col gap-2">
        <div className="px-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Operations
          </span>
        </div>

        <BuildingNode
          Icon={Sparkles}
          title="Altar of Heroes"
          subtitle="Summon and recruit champions"
          accentColor="indigo"
          statusDot={recruitDot}
          statusText={`${ownedHeroesList.length} Owned · 18 Available · 6 Reserved`}
          dataTutorialTarget="building-recruitment"
          onClick={onOpenRecruitment}
        />

        <BuildingNode
          Icon={Compass}
          title="Expedition Airship"
          subtitle="Dispatch heroes on timed patrol missions"
          accentColor="cyan"
          statusDot={expeditionDot}
          statusText={
            activeExpeditions.length > 0
              ? `${activeExpeditions.length}/2 Active Patrols in Progress`
              : 'Idle · Dispatch heroes for materials'
          }
          dataTutorialTarget="building-expedition"
          onClick={onOpenExpedition}
        />
      </div>

      {/* ─── 6. Utilities: Forge, Quests, Arena ─────────────────── */}
      <div className="px-3 pt-3 flex flex-col gap-2">
        <div className="px-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Utilities
          </span>
        </div>

        <BuildingNode
          Icon={Wrench}
          title="Ancient Forge & Workshop"
          subtitle="Craft, enhance, and combine gear & gems"
          accentColor="emerald"
          statusText="8 Equipment Slots · Stats Matrix"
          onClick={onOpenWorkshop}
        />

        <BuildingNode
          Icon={ClipboardList}
          title="Hall of Quests & Pass"
          subtitle="Daily bounties, milestones & season pass"
          accentColor="amber"
          statusText="Milestones & Awakening Rewards"
          onClick={onOpenQuests}
        />

        <BuildingNode
          Icon={Trophy}
          title="Trial Arena & Vault"
          subtitle="Champion trials, seasonal growth & chest vault"
          accentColor="rose"
          statusText="Season 1 Active"
          onClick={onOpenArena}
        />
      </div>
    </div>
  );
};
