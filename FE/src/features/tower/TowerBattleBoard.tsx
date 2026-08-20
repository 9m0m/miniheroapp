'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TowerBattleResult, TowerEntity, TowerReplayEvent } from '@/domain/combat/combat.types';
import { TurnOrderStrip } from './TurnOrderStrip';
import { getTowerSpriteConfig, ROLE_COLOR_CONFIG } from '@/engine/tower/TowerSpriteManifest';
import { resolveInitiativeOrder } from '@/engine/tower/TurnBattleEngine';
import { FastForward, Swords, Crosshair, Zap, Pause, Play, LogOut } from 'lucide-react';
import { ModalShell } from '@/components/ui/ModalShell';

interface TowerBattleBoardProps {
  battleResult: TowerBattleResult;
  onFinish: () => void;
  onSurrender?: () => Promise<boolean> | void;
  isRetreating?: boolean;
}

interface FloatingText {
  id: string;
  targetId: string;
  text: string;
  isCrit?: boolean;
  isHeal?: boolean;
  isEvade?: boolean;
  createdAt: number;
  remainingMs: number;
}

const COLS: ('LEFT' | 'CENTER' | 'RIGHT')[] = ['LEFT', 'CENTER', 'RIGHT'];

export const TowerBattleBoard: React.FC<TowerBattleBoardProps> = ({
  battleResult,
  onFinish,
  onSurrender,
  isRetreating = false,
}) => {
  const [entities, setEntities] = useState<TowerEntity[]>(() => {
    const raw: TowerEntity[] = JSON.parse(JSON.stringify(battleResult.finalCombatants || []));
    // Normalize domain coordinates on entities so entity.gridRow and gridCol are collision-free 3x2
    (['PLAYER', 'ENEMY'] as const).forEach((side) => {
      const occupied = new Set<string>();
      raw.filter((e) => e.side === side).forEach((e, idx) => {
        let r: 'FRONT' | 'BACK' = e.gridRow === 'FRONT' ? 'FRONT' : 'BACK';
        let c: 'LEFT' | 'CENTER' | 'RIGHT' = e.gridCol || (r === 'FRONT' ? 'CENTER' : idx === 1 ? 'LEFT' : 'RIGHT');
        let key = `${r}_${c}`;
        if (occupied.has(key)) {
          const fallbacks: Array<{ row: 'FRONT' | 'BACK'; col: 'LEFT' | 'CENTER' | 'RIGHT' }> = [
            { row: 'FRONT', col: 'CENTER' },
            { row: 'BACK', col: 'LEFT' },
            { row: 'BACK', col: 'RIGHT' },
            { row: 'FRONT', col: 'LEFT' },
            { row: 'FRONT', col: 'RIGHT' },
            { row: 'BACK', col: 'CENTER' },
          ];
          const nextFree = fallbacks.find((f) => !occupied.has(`${f.row}_${f.col}`));
          if (nextFree) {
            r = nextFree.row;
            c = nextFree.col;
            key = `${r}_${c}`;
          }
        }
        occupied.add(key);
        e.gridRow = r;
        e.gridCol = c;
      });
    });
    return raw;
  });

  const events = battleResult.replayEvents || [];

  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [autoBattle, setAutoBattle] = useState(false); // Manual command by default
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);
  const [activeActorId, setActiveActorId] = useState<string | undefined>(() => {
    return events[0]?.sourceEntityId || undefined;
  });
  const [actingAttackerId, setActingAttackerId] = useState<string | undefined>();
  const [hitTargetId, setHitTargetId] = useState<string | undefined>();
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [currentRound, setCurrentRound] = useState(1);

  const lungeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);
  const floatingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const scheduledActionTimersRef = useRef<NodeJS.Timeout[]>([]);
  const isExecutingTurnRef = useRef(false);
  const hasFinishedRef = useRef(false);

  const triggerFinishOnce = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onFinish();
  };

  const handlePauseBattle = () => {
    setIsPlaying(false);
    setIsPauseModalOpen(true);
    isExecutingTurnRef.current = false;
    scheduledActionTimersRef.current.forEach(clearTimeout);
    scheduledActionTimersRef.current = [];

    // Clear transient visual states
    setActingAttackerId(undefined);
    setHitTargetId(undefined);
    if (lungeTimerRef.current) clearTimeout(lungeTimerRef.current);
    if (hitTimerRef.current) clearTimeout(hitTimerRef.current);
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);

    // Freeze floating damage popups and record exact remaining countdown
    const now = Date.now();
    floatingTimersRef.current.forEach((t) => clearTimeout(t));
    floatingTimersRef.current.clear();
    setFloatingTexts((prev) =>
      prev.map((item) => {
        const elapsed = now - item.createdAt;
        return {
          ...item,
          remainingMs: Math.max(100, item.remainingMs - elapsed),
        };
      })
    );
  };

  const handleResumeBattle = () => {
    setIsPauseModalOpen(false);
    setIsPlaying(true);

    // Resume floating damage popups
    const now = Date.now();
    setFloatingTexts((prev) => {
      prev.forEach((item) => {
        const timer = setTimeout(() => {
          setFloatingTexts((current) => current.filter((t) => t.id !== item.id));
          floatingTimersRef.current.delete(item.id);
        }, item.remainingMs);
        floatingTimersRef.current.set(item.id, timer);
      });
      return prev.map((item) => ({ ...item, createdAt: now }));
    });
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (lungeTimerRef.current) clearTimeout(lungeTimerRef.current);
      if (hitTimerRef.current) clearTimeout(hitTimerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      scheduledActionTimersRef.current.forEach(clearTimeout);
      scheduledActionTimersRef.current = [];
      floatingTimersRef.current.forEach((t) => clearTimeout(t));
      floatingTimersRef.current.clear();
    };
  }, []);

  // Determine current event and active actor
  const currentEvent = events[currentEventIndex];
  const activeActor = entities.find(
    (e) => e.entityId === activeActorId || e.entityId === currentEvent?.sourceEntityId
  );
  const isPlayerTurn = activeActor?.side === 'PLAYER' && !activeActor?.isDowned;

  // Auto-target default enemy if none is selected
  useEffect(() => {
    if (isPlayerTurn) {
      if (!selectedTargetId) {
        const nextSkillEvt = events.slice(currentEventIndex).find((e) => e.eventType === 'SKILL_USE' && e.targetEntityId);
        if (nextSkillEvt?.targetEntityId) {
          setSelectedTargetId(nextSkillEvt.targetEntityId);
        } else {
          const firstLivingEnemy = entities.find((e) => e.side === 'ENEMY' && !e.isDowned);
          if (firstLivingEnemy) setSelectedTargetId(firstLivingEnemy.entityId);
        }
      }
    }
  }, [currentEventIndex, activeActorId, isPlayerTurn, entities, events, selectedTargetId]);

  useEffect(() => {
    // 1. If paused or not playing, completely freeze playback
    if (isPauseModalOpen || !isPlaying) {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      return;
    }

    // 2. Terminal battle end check
    if (currentEventIndex >= events.length) {
      if (events.length > 0) {
        finishTimerRef.current = setTimeout(() => {
          triggerFinishOnce();
        }, 800);
        return () => {
          if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
        };
      }
      return;
    }

    // 3. If manual mode and player turn is awaiting command
    if (!autoBattle && isPlayerTurn) {
      if (currentEvent?.eventType === 'ACTION_START') {
        handleSingleEvent(currentEvent);
        setCurrentEventIndex((prev) => prev + 1);
      }
      return;
    }

    // 4. Schedule next event automatically
    const delay = speedMultiplier === 2 ? 350 : 650;
    const timer = setTimeout(() => {
      processNextEvent();
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, isPauseModalOpen, autoBattle, isPlayerTurn, currentEventIndex, speedMultiplier, events]);

  const processNextEvent = () => {
    if (currentEventIndex >= events.length) return;

    const event = events[currentEventIndex];
    handleSingleEvent(event);
    setCurrentEventIndex((prev) => prev + 1);
  };

  const handleManualExecuteTurn = () => {
    if (isPauseModalOpen || isExecutingTurnRef.current) return;
    if (currentEventIndex >= events.length) return;

    isExecutingTurnRef.current = true;
    const startIndex = currentEventIndex;
    const firstEvent = events[startIndex];
    handleSingleEvent(firstEvent);

    let nextIdx = startIndex + 1;
    const pendingEvents: { event: TowerReplayEvent; delay: number }[] = [];

    while (nextIdx < events.length && events[nextIdx].eventType !== 'ACTION_START') {
      const subEvent = events[nextIdx];
      const delay = (nextIdx - startIndex) * (speedMultiplier === 2 ? 150 : 250);
      pendingEvents.push({ event: subEvent, delay });
      nextIdx++;
    }

    const finalNextIdx = nextIdx;
    pendingEvents.forEach(({ event, delay }) => {
      const t = setTimeout(() => {
        handleSingleEvent(event);
      }, delay);
      scheduledActionTimersRef.current.push(t);
    });

    const maxDelay = pendingEvents.length > 0 ? pendingEvents[pendingEvents.length - 1].delay : 0;
    const finishT = setTimeout(() => {
      setCurrentEventIndex(finalNextIdx);
      isExecutingTurnRef.current = false;
      scheduledActionTimersRef.current = [];
    }, maxDelay + (speedMultiplier === 2 ? 100 : 150));
    scheduledActionTimersRef.current.push(finishT);
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
        if (lungeTimerRef.current) clearTimeout(lungeTimerRef.current);
        lungeTimerRef.current = setTimeout(() => setActingAttackerId(undefined), 300);
        break;

      case 'DAMAGE_APPLIED':
        if (event.targetEntityId) {
          setHitTargetId(event.targetEntityId);
          if (hitTimerRef.current) clearTimeout(hitTimerRef.current);
          hitTimerRef.current = setTimeout(() => setHitTargetId(undefined), 300);

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

  const addFloatingText = (
    targetId: string,
    text: string,
    isCrit = false,
    isHeal = false,
    isEvade = false
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const initialRemaining = 900;
    const item: FloatingText = {
      id,
      targetId,
      text,
      isCrit,
      isHeal,
      isEvade,
      createdAt: Date.now(),
      remainingMs: initialRemaining,
    };
    setFloatingTexts((prev) => [...prev, item]);

    if (!isPauseModalOpen && isPlaying) {
      const timer = setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
        floatingTimersRef.current.delete(id);
      }, initialRemaining);
      floatingTimersRef.current.set(id, timer);
    }
  };

  const initiativeOrder = resolveInitiativeOrder(entities, currentRound);

  // Render a clean 3x2 Grid (2 Rows x 3 Cols) for either side
  const renderFormation3x2 = (side: 'PLAYER' | 'ENEMY') => {
    const teamEntities = entities.filter((e) => e.side === side);
    // Enemy: Top row is Backline, Bottom row is Frontline (facing player)
    // Player: Top row is Frontline (facing enemy), Bottom row is Backline
    const rowKeys: ('FRONT' | 'BACK')[] = side === 'ENEMY' ? ['BACK', 'FRONT'] : ['FRONT', 'BACK'];

    return (
      <div className="flex flex-col gap-2.5 w-full">
        {rowKeys.map((rowKey) => (
          <div key={rowKey} className="grid grid-cols-3 gap-2">
            {COLS.map((colKey) => {
              const entity = teamEntities.find((e) => e.gridRow === rowKey && e.gridCol === colKey);

              if (!entity) {
                return (
                  <div
                    key={`${rowKey}_${colKey}`}
                    className="rounded-xl border border-dashed border-[#1e293b]/30 bg-[#080b12]/20 min-h-[72px]"
                  />
                );
              }

              const isHeroActive = entity.entityId === activeActorId;
              const isTargeted = selectedTargetId === entity.entityId;

              return (
                <TopBottomCombatantCard
                  key={entity.entityId}
                  entity={entity}
                  isActive={isHeroActive}
                  isLunging={entity.entityId === actingAttackerId}
                  isHit={entity.entityId === hitTargetId}
                  isFrozen={isPauseModalOpen || !isPlaying}
                  floatingTexts={floatingTexts.filter((t) => t.targetId === entity.entityId)}
                  isPlayerSide={side === 'PLAYER'}
                  isTargeted={isTargeted}
                  onSelectTarget={() => {
                    if (side === 'ENEMY' && !entity.isDowned && !isPauseModalOpen) {
                      setSelectedTargetId(entity.entityId);
                    }
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col w-full h-full bg-[#06080e] text-slate-100 select-none overflow-hidden justify-between">
      {/* ─── 1. Top Turn Order Strip & Energy Bar ─────────────────────────────────── */}
      <div className="shrink-0 flex flex-col">
        <TurnOrderStrip
          initiativeOrder={initiativeOrder}
          activeEntityId={activeActorId}
          roundNumber={currentRound}
        />

        {/* Round, Team Energy & Pause Menu Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e131d] border-b border-[#1e293b] text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-black text-amber-400 text-sm">Round {currentRound}/10</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-cyan-400 font-bold flex items-center gap-0.5">
                ⚡ Energy:
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((e) => (
                  <div
                    key={e}
                    className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-black ${
                      e <= Math.min(5, 2 + (currentRound - 1))
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                        : 'bg-[#080b12] border-[#1e293b] text-slate-700'
                    }`}
                  >
                    {e}
                  </div>
                ))}
              </div>
            </div>

            {/* Battle Pause / Tactical Menu Button */}
            <button
              type="button"
              onClick={handlePauseBattle}
              aria-label="Pause combat and open retreat menu"
              title="Pause & Retreat"
              className="p-1.5 rounded-md bg-[#080b12] border border-[#1e293b] hover:border-amber-400 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <Pause size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. Clean 3×2 Combat Arena (Mobile Tactical Vertical Orientation) ─── */}
      <div className="flex-1 relative flex flex-col justify-between p-3 bg-gradient-to-b from-[#0a0e17] via-[#06080e] to-[#0a0e17] overflow-y-auto">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* ── TOP SECTION: ENEMY SQUAD 3×2 (Facing Down) ── */}
        <div className="relative z-10 flex flex-col">
          {renderFormation3x2('ENEMY')}
        </div>

        {/* ── MIDDLE SECTION: OPEN CLASH ZONE ── */}
        <div className="relative z-15 my-auto h-4 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800/80 to-transparent" />
        </div>

        {/* ── BOTTOM SECTION: PLAYER VANGUARD 3×2 (Facing Up) ── */}
        <div className="relative z-10 flex flex-col">
          {renderFormation3x2('PLAYER')}
        </div>
      </div>

      {/* ─── 3. Bottom Battle Controls & Strike Action Dock ───────────────────────────────── */}
      <div className="p-3 bg-[#0e131d] border-t border-[#1e293b] flex items-center justify-between gap-3 shrink-0 min-h-[60px]">
        {/* Left: Mode & Speed controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoBattle(!autoBattle)}
            disabled={isPauseModalOpen}
            className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              autoBattle
                ? 'btn-game-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'btn-game-dark text-slate-300'
            }`}
          >
            <Zap size={14} className={autoBattle ? 'text-slate-950 fill-current' : 'text-slate-400'} />
            <span>AUTO: {autoBattle ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSpeedMultiplier(speedMultiplier === 1 ? 2 : 1)}
            disabled={isPauseModalOpen}
            className="px-3 py-2 rounded-lg btn-game-dark text-xs font-black text-slate-300 flex items-center gap-1 cursor-pointer font-mono"
          >
            <FastForward className="w-4 h-4" />
            <span>{speedMultiplier}x</span>
          </button>
        </div>

        {/* Right: Dynamic Turn Strike Action Button */}
        {!autoBattle && isPlayerTurn && !isPauseModalOpen ? (
          <button
            type="button"
            onClick={handleManualExecuteTurn}
            className="flex-1 max-w-[220px] py-2.5 px-4 btn-game-amber text-slate-950 font-black text-xs rounded-lg uppercase tracking-wider cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2 animate-pulse"
          >
            <Swords size={15} />
            <span className="truncate">Strike with {activeActor?.name || 'Hero'}!</span>
          </button>
        ) : (
          <div className="text-xs font-black text-slate-400 font-mono px-3 text-right">
            {isPauseModalOpen ? 'Paused' : autoBattle ? 'Auto Battling...' : 'Awaiting Turn...'}
          </div>
        )}
      </div>

      {/* ─── 4. Tactical Pause & Retreat Modal ───────────────────────────────── */}
      <ModalShell
        isOpen={isPauseModalOpen}
        onClose={() => {
          if (!isRetreating) {
            handleResumeBattle();
          }
        }}
        title="Battle Paused"
        icon={<Pause size={18} className="text-amber-400" />}
      >
        <div className="flex flex-col gap-3 text-xs text-slate-200 select-none">
          <div className="p-3 bg-[#0e131d] border border-[#1e293b] rounded-lg flex flex-col gap-2">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Current Combat Status:</span>
              <span className="font-bold text-amber-300 font-mono">Round {currentRound} / 10</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Active Squad:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {entities.filter((e) => e.side === 'PLAYER' && !e.isDowned).length}/3 Heroes Standing
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-[#1e293b] pt-2">
              If you retreat from combat now, the floor attempt will end and you will return to the Tower Lobby.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              disabled={isRetreating}
              onClick={handleResumeBattle}
              className="w-full py-2.5 rounded-md btn-game-amber text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Play size={14} />
              <span>Resume Battle</span>
            </button>

            {onSurrender && (
              <button
                type="button"
                disabled={isRetreating}
                onClick={async () => {
                  const success = await onSurrender();
                  if (success) {
                    setIsPauseModalOpen(false);
                  }
                }}
                className="w-full py-2.5 rounded-md bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 text-red-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isRetreating ? (
                  <span>Retreating...</span>
                ) : (
                  <>
                    <LogOut size={14} />
                    <span>Retreat & Exit Combat</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </ModalShell>
    </div>
  );
};

interface TopBottomCombatantCardProps {
  entity: TowerEntity;
  isActive: boolean;
  isLunging: boolean;
  isHit: boolean;
  isFrozen: boolean;
  floatingTexts: FloatingText[];
  isPlayerSide: boolean;
  isTargeted: boolean;
  onSelectTarget: () => void;
}

const TopBottomCombatantCard: React.FC<TopBottomCombatantCardProps> = ({
  entity,
  isActive,
  isLunging,
  isHit,
  isFrozen,
  floatingTexts,
  isPlayerSide,
  isTargeted,
  onSelectTarget,
}) => {
  const spriteConfig = getTowerSpriteConfig(entity.templateId, entity.role);
  const roleConfig = ROLE_COLOR_CONFIG[entity.role];
  const hpPercent = Math.max(0, Math.min(100, (entity.currentHp / entity.maxHp) * 100));

  return (
    <div
      onClick={onSelectTarget}
      className={`relative flex flex-col items-center p-2 rounded-xl border transition-all duration-150 text-center ${
        !isPlayerSide && !entity.isDowned ? 'cursor-pointer hover:border-amber-400' : ''
      } ${
        entity.isDowned
          ? 'bg-[#080b12]/60 border-slate-900 opacity-40 grayscale'
          : isActive
          ? 'bg-[#141b2b] border-amber-400 ring-2 ring-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.6)] z-20 scale-[1.02]'
          : isTargeted
          ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400 shadow-md'
          : isPlayerSide
          ? 'bg-[#0e131d] border-[#1e293b]'
          : 'bg-[#0e131d] border-[#1e293b]'
      } ${
        isLunging && !isFrozen
          ? isPlayerSide
            ? '-translate-y-2 duration-100 shadow-cyan-500/20'
            : 'translate-y-2 duration-100 shadow-red-500/20'
          : 'translate-y-0'
      } ${isHit && !isFrozen ? 'animate-pulse bg-red-950/70 border-red-500 scale-95 duration-100' : ''}`}
    >
      {/* Floating Damage / Heal Popups */}
      {floatingTexts.map((item) => (
        <div
          key={item.id}
          className={`absolute -top-3 left-1/2 -translate-x-1/2 font-black text-xs z-30 pointer-events-none drop-shadow-md font-mono whitespace-nowrap ${
            isFrozen ? '' : 'animate-bounce'
          }`}
        >
          <span
            className={
              item.isEvade
                ? 'text-purple-300'
                : item.isHeal
                ? 'text-emerald-400'
                : item.isCrit
                ? 'text-amber-400 scale-125 font-black inline-block'
                : 'text-red-400'
            }
          >
            {item.text}
          </span>
        </div>
      ))}

      {/* Target Crosshair Badge */}
      {isTargeted && !entity.isDowned && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg z-20 font-mono">
          <Crosshair size={10} />
          <span>TARGET</span>
        </div>
      )}

      {/* Hero Avatar Emblem & Role Badge */}
      <div className="w-full flex items-center justify-between gap-1 mb-1 mt-0.5">
        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleConfig.badge}`}>
          {entity.role}
        </span>
        <span className="text-[9px] font-mono font-bold text-amber-400">
          SPD {entity.effectiveStats?.speed || 100}
        </span>
      </div>

      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden border my-0.5 shadow-inner transition-all duration-200 ${
          isActive ? 'ring-2 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]' : ''
        } ${roleConfig.border} ${roleConfig.bg}`}
      >
        {spriteConfig?.imageSrc ? (
          <img
            src={spriteConfig.imageSrc}
            alt={entity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-base font-bold">{roleConfig.icon}</span>
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

      {/* Hero / Enemy Name */}
      <span className="text-xs font-black text-slate-100 truncate w-full mt-1">
        {entity.name}
      </span>

      {/* Persistent HP Bar */}
      <div className="w-full h-2 rounded-full bg-[#080b12] border border-[#1e293b] overflow-hidden relative my-1">
        <div
          className={`h-full transition-all duration-300 ${
            hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${hpPercent}%` }}
        />
        {entity.shield > 0 && (
          <div className="absolute inset-0 bg-cyan-400/40 border-r border-cyan-300" />
        )}
      </div>

      {/* Bottom Numbers: HP */}
      <div className="w-full flex items-center justify-center text-[10px] font-mono text-slate-300 font-bold">
        <span>{entity.isDowned ? 'DOWN' : `${entity.currentHp} / ${entity.maxHp}`}</span>
      </div>
    </div>
  );
};

export default TowerBattleBoard;
