'use client';

import React, { useState, useEffect } from 'react';
import { TowerBattleResult, TowerEntity, TowerReplayEvent } from '@/domain/combat/combat.types';
import { TurnOrderStrip } from './TurnOrderStrip';
import { getTowerSpriteConfig, ROLE_COLOR_CONFIG } from '@/engine/tower/TowerSpriteManifest';
import { resolveInitiativeOrder } from '@/engine/tower/TurnBattleEngine';
import { Play, Pause, FastForward, SkipForward } from 'lucide-react';

interface TowerBattleBoardProps {
  battleResult: TowerBattleResult;
  onFinish: () => void;
}

interface FloatingText {
  id: string;
  targetId: string;
  text: string;
  isCrit?: boolean;
  isHeal?: boolean;
  isEvade?: boolean;
}

export const TowerBattleBoard: React.FC<TowerBattleBoardProps> = ({ battleResult, onFinish }) => {
  const [entities, setEntities] = useState<TowerEntity[]>(() => {
    // Deep clone initial combatants
    return JSON.parse(JSON.stringify(battleResult.finalCombatants || []));
  });

  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 0>(1); // 1x, 2x, 0 = Instant
  const [activeActorId, setActiveActorId] = useState<string | undefined>();
  const [actingAttackerId, setActingAttackerId] = useState<string | undefined>();
  const [hitTargetId, setHitTargetId] = useState<string | undefined>();
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [currentRound, setCurrentRound] = useState(1);

  const events = battleResult.replayEvents || [];

  const hasFinishedRef = React.useRef(false);

  const triggerFinishOnce = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onFinish();
  };

  // Event Replay Loop
  useEffect(() => {
    if (!isPlaying || currentEventIndex >= events.length) {
      if (currentEventIndex >= events.length && events.length > 0) {
        const timer = setTimeout(() => {
          triggerFinishOnce();
        }, 800);
        return () => clearTimeout(timer);
      }
      return;
    }

    if (speedMultiplier === 0) {
      // Instant mode: apply all remaining events immediately
      applyAllRemainingEvents();
      triggerFinishOnce();
      return;
    }

    const delay = speedMultiplier === 2 ? 350 : 700;
    const timer = setTimeout(() => {
      processNextEvent();
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentEventIndex, speedMultiplier, events]);

  const processNextEvent = () => {
    if (currentEventIndex >= events.length) return;

    const event = events[currentEventIndex];
    handleSingleEvent(event);
    setCurrentEventIndex((prev) => prev + 1);
  };

  const handleSingleEvent = (event: TowerReplayEvent) => {
    if (event.round) {
      setCurrentRound(event.round);
    }

    switch (event.eventType) {
      case 'ACTION_START':
        setActiveActorId(event.sourceEntityId);
        break;

      case 'SKILL_USE':
        setActingAttackerId(event.sourceEntityId);
        setTimeout(() => setActingAttackerId(undefined), 300);
        break;

      case 'DAMAGE_APPLIED':
        if (event.targetEntityId) {
          setHitTargetId(event.targetEntityId);
          setTimeout(() => setHitTargetId(undefined), 300);

          if (event.isEvaded) {
            addFloatingText(event.targetEntityId, 'EVADED!', false, false, true);
          } else {
            const txt = event.isCrit ? `💥 -${event.amount}` : `-${event.amount}`;
            addFloatingText(event.targetEntityId, txt, event.isCrit, false, false);
          }

          setEntities((prev) =>
            prev.map((e) => {
              if (e.entityId === event.targetEntityId) {
                const nextHp = event.targetRemainingHp ?? Math.max(0, e.currentHp - (event.amount || 0));
                const isDowned = nextHp <= 0;
                return {
                  ...e,
                  currentHp: nextHp,
                  shield: event.targetShield ?? e.shield,
                  evadeCharges: event.isEvaded ? Math.max(0, e.evadeCharges - 1) : e.evadeCharges,
                  isDowned,
                  ...(isDowned ? { shield: 0, evadeCharges: 0, regenStacks: 0 } : {}),
                };
              }
              return e;
            })
          );
        }
        break;

      case 'HEAL_APPLIED':
        if (event.targetEntityId) {
          addFloatingText(event.targetEntityId, `+${event.amount}`, false, true, false);
          setEntities((prev) =>
            prev.map((e) => {
              if (e.entityId === event.targetEntityId) {
                return {
                  ...e,
                  currentHp: event.targetRemainingHp ?? Math.min(e.maxHp, e.currentHp + (event.amount || 0)),
                };
              }
              return e;
            })
          );
        }
        break;

      case 'ENTITY_DOWN':
        if (event.targetEntityId) {
          setEntities((prev) =>
            prev.map((e) => (e.entityId === event.targetEntityId ? { ...e, isDowned: true, currentHp: 0, shield: 0, evadeCharges: 0, regenStacks: 0 } : e))
          );
        }
        break;

      case 'EFFECT_APPLIED':
        if (event.targetEntityId && event.effectOpcode) {
          setEntities((prev) =>
            prev.map((e) => {
              if (e.entityId === event.targetEntityId) {
                const spd = e.effectiveStats?.speed || 100;
                const arm = e.effectiveStats?.armor || 0;
                if (event.effectOpcode === 'EVADE') return { ...e, evadeCharges: 1 };
                if (event.effectOpcode === 'REGEN') return { ...e, regenStacks: Math.min(2, e.regenStacks + 1) };
                if (event.effectOpcode === 'SHIELD') return { ...e, shield: event.targetShield ?? (e.shield + (event.amount || 0)) };
                if (event.effectOpcode === 'HASTE') return { ...e, effectiveStats: { ...e.effectiveStats, speed: Math.min(180, spd + (event.amount || 0)) } as any };
                if (event.effectOpcode === 'SLOW') return { ...e, effectiveStats: { ...e.effectiveStats, speed: Math.max(60, spd - (event.amount || 0)) } as any };
                if (event.effectOpcode === 'ARMOR_BREAK') return { ...e, effectiveStats: { ...e.effectiveStats, armor: Math.max(0, arm - (event.amount || 0)) } as any };
              }
              return e;
            })
          );
        }
        break;

      case 'EFFECT_EXPIRED':
        if (event.targetEntityId && event.effectOpcode) {
          setEntities((prev) =>
            prev.map((e) => {
              if (e.entityId === event.targetEntityId) {
                const spd = e.effectiveStats?.speed || 100;
                const arm = e.effectiveStats?.armor || 0;
                if (event.effectOpcode === 'REGEN') return { ...e, regenStacks: Math.max(0, e.regenStacks - 1) };
                if (event.effectOpcode === 'EVADE') return { ...e, evadeCharges: 0 };
                if (event.effectOpcode === 'SHIELD') return { ...e, shield: event.targetShield ?? 0 };
                if (event.effectOpcode === 'HASTE') return { ...e, effectiveStats: { ...e.effectiveStats, speed: Math.max(60, spd - (event.amount || 0)) } as any };
                if (event.effectOpcode === 'SLOW') return { ...e, effectiveStats: { ...e.effectiveStats, speed: Math.min(180, spd + (event.amount || 0)) } as any };
                if (event.effectOpcode === 'ARMOR_BREAK') return { ...e, effectiveStats: { ...e.effectiveStats, armor: arm + (event.amount || 0) } as any };
              }
              return e;
            })
          );
        }
        break;

      case 'BATTLE_END':
        setActiveActorId(undefined);
        break;
    }
  };

  const applyAllRemainingEvents = () => {
    for (let i = currentEventIndex; i < events.length; i++) {
      handleSingleEvent(events[i]);
    }
    setCurrentEventIndex(events.length);
  };

  const addFloatingText = (
    targetId: string,
    text: string,
    isCrit = false,
    isHeal = false,
    isEvade = false
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, targetId, text, isCrit, isHeal, isEvade }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 900);
  };

  const playerTeam = entities.filter((e) => e.side === 'PLAYER');
  const enemyTeam = entities.filter((e) => e.side === 'ENEMY');
  const initiativeOrder = resolveInitiativeOrder(entities, currentRound);

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Turn Order Strip */}
      <TurnOrderStrip
        initiativeOrder={initiativeOrder}
        activeEntityId={activeActorId}
        roundNumber={currentRound}
      />

      {/* Round & Team Energy Indicator */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900/95 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-amber-400">Round {currentRound}/5</span>
          <span className="text-[10px] text-slate-500">• 5-Round Cap</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-0.5">
            ⚡ Energy:
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((e) => (
              <div
                key={e}
                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[9px] font-bold ${
                  e <= Math.min(5, 2 + (currentRound - 1))
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-700'
                }`}
              >
                {e}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3v3 Combat Arena */}
      <div className="flex-1 relative flex flex-col justify-center px-3 py-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Arena Grid Background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Center VS line */}
        <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-slate-700/40 to-transparent pointer-events-none" />

        {/* 3v3 Boards: Left = Player Team, Right = Enemy Team */}
        <div className="grid grid-cols-2 gap-3 relative z-10 w-full max-w-lg mx-auto">
          {/* Player Team Column */}
          <div className="flex flex-col gap-2.5">
            <div className="text-[10px] font-bold tracking-wider text-blue-400 uppercase flex items-center gap-1">
              <span>🛡️</span> Player Vanguard
            </div>
            {playerTeam.map((hero) => (
              <CombatantCard
                key={hero.entityId}
                entity={hero}
                isActive={hero.entityId === activeActorId}
                isLunging={hero.entityId === actingAttackerId}
                isHit={hero.entityId === hitTargetId}
                floatingTexts={floatingTexts.filter((t) => t.targetId === hero.entityId)}
                isPlayerSide={true}
              />
            ))}
          </div>

          {/* Enemy Team Column */}
          <div className="flex flex-col gap-2.5">
            <div className="text-[10px] font-bold tracking-wider text-red-400 uppercase flex items-center justify-end gap-1">
              Enemy Trio <span>⚔️</span>
            </div>
            {enemyTeam.map((bot) => (
              <CombatantCard
                key={bot.entityId}
                entity={bot}
                isActive={bot.entityId === activeActorId}
                isLunging={bot.entityId === actingAttackerId}
                isHit={bot.entityId === hitTargetId}
                floatingTexts={floatingTexts.filter((t) => t.targetId === bot.entityId)}
                isPlayerSide={false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Battle Controls */}
      <div className="p-3 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              if (speedMultiplier === 1) setSpeedMultiplier(2);
              else if (speedMultiplier === 2) setSpeedMultiplier(0);
              else setSpeedMultiplier(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1 transition-colors"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{speedMultiplier === 0 ? 'MAX' : `${speedMultiplier}x`}</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Event {currentEventIndex}/{events.length}
        </div>

        <button
          onClick={() => {
            applyAllRemainingEvents();
            triggerFinishOnce();
          }}
          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-all shadow-md shadow-amber-500/20 active:scale-95"
        >
          <span>Skip</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

interface CombatantCardProps {
  entity: TowerEntity;
  isActive: boolean;
  isLunging: boolean;
  isHit: boolean;
  floatingTexts: FloatingText[];
  isPlayerSide: boolean;
}

const CombatantCard: React.FC<CombatantCardProps> = ({
  entity,
  isActive,
  isLunging,
  isHit,
  floatingTexts,
  isPlayerSide,
}) => {
  const spriteConfig = getTowerSpriteConfig(entity.templateId);
  const roleConfig = ROLE_COLOR_CONFIG[entity.role];
  const hpPercent = Math.max(0, Math.min(100, (entity.currentHp / entity.maxHp) * 100));

  return (
    <div
      className={`relative flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 ${
        entity.isDowned
          ? 'bg-slate-950/60 border-slate-900 opacity-40 grayscale'
          : isActive
          ? 'bg-slate-900 border-amber-400/80 ring-1 ring-amber-400/60 shadow-lg shadow-amber-500/10'
          : isPlayerSide
          ? 'bg-slate-900/80 border-slate-800'
          : 'bg-slate-900/80 border-slate-800'
      } ${
        isLunging
          ? isPlayerSide
            ? 'translate-x-3 duration-100'
            : '-translate-x-3 duration-100'
          : 'translate-x-0'
      } ${isHit ? 'animate-pulse bg-red-950/60 border-red-500 scale-95 duration-100' : ''}`}
    >
      {/* Floating Damage / Heal Popups */}
      {floatingTexts.map((item) => (
        <div
          key={item.id}
          className={`absolute top-0 ${
            isPlayerSide ? 'left-4' : 'right-4'
          } -translate-y-4 font-black text-sm z-30 pointer-events-none animate-bounce drop-shadow-md ${
            item.isEvade
              ? 'text-purple-300'
              : item.isHeal
              ? 'text-emerald-400'
              : item.isCrit
              ? 'text-amber-400 scale-125'
              : 'text-red-400'
          }`}
        >
          {item.text}
        </div>
      ))}

      {/* Avatar Sprite or Vector Emblem */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden border ${
          roleConfig.border
        } ${roleConfig.bg}`}
      >
        {spriteConfig?.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={spriteConfig.imageSrc}
            alt={entity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-lg">{roleConfig.icon}</span>
        )}
        {entity.shield > 0 && (
          <div className="absolute top-0 left-0 bg-blue-500 text-[8px] font-bold px-1 rounded-br text-white shadow">
            {entity.shield}
          </div>
        )}
        {entity.evadeCharges > 0 && (
          <div className="absolute top-0 right-0 bg-purple-500 text-[8px] font-bold px-1 rounded-bl text-white">
            EV
          </div>
        )}
        {entity.regenStacks > 0 && (
          <div className="absolute bottom-0 right-0 bg-emerald-500 text-[8px] font-bold px-1 rounded-tl text-white">
            +{entity.regenStacks}
          </div>
        )}
      </div>

      {/* Info & Persistent HP Bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-xs font-bold text-slate-200 truncate">{entity.name}</span>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleConfig.badge}`}
          >
            {entity.role}
          </span>
        </div>

        {/* HP Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 border border-slate-700/60 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 ${
              hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
          {entity.shield > 0 && (
            <div className="absolute inset-0 bg-cyan-400/40 border-r-2 border-cyan-300" />
          )}
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-0.5">
          <span>
            {entity.isDowned ? 'DOWN' : `${entity.currentHp}/${entity.maxHp}`}
          </span>
          <span>SPD {entity.effectiveStats?.speed || 100}</span>
        </div>
      </div>
    </div>
  );
};
