'use client';

import React, { useState } from 'react';
import { TowerFloorDto, TowerProgressDto } from '@/types/tower.types';
import { Hero } from '@/types/hero.types';
import { ROLE_COLOR_CONFIG, getTowerSpriteConfig } from '@/engine/tower/TowerSpriteManifest';
import { Users, Swords, Lock, CheckCircle2, ChevronRight, X, BookOpen, Shield, Zap, Sparkles, Crosshair } from 'lucide-react';
import { ModalShell } from '@/components/ui/ModalShell';

interface TowerLobbyProps {
  progress?: TowerProgressDto;
  floors: TowerFloorDto[];
  ownedHeroes: Hero[];
  onSelectFloor: (floor: TowerFloorDto) => void;
  onEditTeam: () => void;
  onClose?: () => void;
}

export const TowerLobby: React.FC<TowerLobbyProps> = ({
  progress,
  floors,
  ownedHeroes,
  onSelectFloor,
  onEditTeam,
  onClose,
}) => {
  const [showTacticalGuide, setShowTacticalGuide] = useState(false);

  const currentFloorNum = progress?.currentFloor || 1;
  const highestCleared = progress?.highestFloorCleared || 0;
  const currentFloor = floors.find((f) => f.floorNumber === currentFloorNum) || floors[0];

  const partySlots = progress?.savedPartyV2?.slots || [];

  return (
    <div className="flex flex-col h-full bg-[#06080e] text-slate-100 p-3.5 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-base shadow-inner">
            🏰
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-100">The Infinite Tower</h1>
            <p className="text-[10px] text-slate-400 font-mono">Season 1 · 3×2 Tactical Strategy</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowTacticalGuide(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold cursor-pointer hover:bg-cyan-900/80 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tactical Rules</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md btn-game-dark text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress & Current Floor Banner */}
      {currentFloor && (
        <div className="p-3.5 rounded-lg bg-gradient-to-r from-amber-950/40 via-[#101623] to-[#0a0e17] border border-amber-500/40 mb-3 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
              TARGET · FLOOR {currentFloor.floorNumber}/30
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Cleared: <strong className="text-amber-400 font-black">{highestCleared}</strong>/30
            </span>
          </div>

          <h2 className="text-sm font-black text-slate-100 mb-0.5">{currentFloor.name}</h2>
          <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">{currentFloor.description}</p>

          <button
            onClick={() => onSelectFloor(currentFloor)}
            className="w-full py-2.5 rounded-md btn-game-amber text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 cursor-pointer uppercase tracking-wider"
          >
            <Swords className="w-4 h-4" />
            <span>Challenge Floor {currentFloor.floorNumber}</span>
          </button>
        </div>
      )}

      {/* 3-Hero Team Quick Preview (3x2 Formation Slots) */}
      <div className="p-3 rounded-lg bg-[#0e131d] border border-[#1e293b] mb-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>3×2 Active Formation</span>
          </span>
          <button
            onClick={onEditTeam}
            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
          >
            Edit Formation →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {partySlots.length > 0 ? (
            partySlots.map((slot, idx) => {
              const hero = ownedHeroes.find((h) => h.id === slot.heroId);
              const title = `${slot.row === 'FRONT' ? 'FRONT' : 'BACK'}•${slot.col.substring(0, 1)}`;
              return <PartyMiniSlot key={slot.heroId || idx} title={title} hero={hero} />;
            })
          ) : (
            <>
              <PartyMiniSlot title="FRONT•C" hero={ownedHeroes[0]} />
              <PartyMiniSlot title="BACK•L" hero={ownedHeroes[1]} />
              <PartyMiniSlot title="BACK•R" hero={ownedHeroes[2]} />
            </>
          )}
        </div>
      </div>

      {/* 30 Floors List */}
      <div className="flex-1 overflow-y-auto pr-0.5">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 px-1">
          Floor Progression Map (1–30):
        </div>
        <div className="flex flex-col gap-1.5">
          {floors.map((floor) => {
            const isCleared = floor.floorNumber <= highestCleared;
            const isCurrent = floor.floorNumber === currentFloorNum;
            const isLocked = floor.floorNumber > highestCleared + 1;

            return (
              <div
                key={floor.floorNumber}
                onClick={() => !isLocked && onSelectFloor(floor)}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-950/40 to-[#101623] border-amber-400/80 cursor-pointer shadow-md'
                    : isCleared
                    ? 'bg-[#0e131d] border-[#1e293b] cursor-pointer hover:border-slate-700'
                    : isLocked
                    ? 'bg-[#080b12] border-slate-900 opacity-40 cursor-not-allowed'
                    : 'bg-[#0e131d] border-[#1e293b] cursor-pointer hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center font-black text-xs ${
                      floor.isBoss
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : isCleared
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono'
                        : isCurrent
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-[#080b12] text-slate-400 border border-slate-800 font-mono'
                    }`}
                  >
                    {isCleared ? <CheckCircle2 className="w-4 h-4" /> : floor.floorNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-amber-300' : isCleared ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        Floor {floor.floorNumber} — {floor.name}
                      </span>
                      {floor.isBoss && (
                        <span className="text-[9px] px-1 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                          BOSS
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Rec. Lv.{floor.recommendedLevel} · Score: {floor.baseScore}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isCleared && (
                    <span className="text-[9px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                      CLEARED
                    </span>
                  )}
                  {isLocked && <Lock className="w-3.5 h-3.5 text-slate-600" />}
                  {!isLocked && <ChevronRight className="w-4 h-4 text-slate-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tactical 3v3 Combat Guide Modal */}
      <ModalShell
        isOpen={showTacticalGuide}
        onClose={() => setShowTacticalGuide(false)}
        title="3×2 Tactical Combat Rules"
        icon={<BookOpen size={18} className="text-cyan-400" />}
      >
        <div className="space-y-2.5 text-xs text-slate-200 select-none max-h-[50vh] overflow-y-auto pr-0.5">
          <div className="p-3 bg-[#0e131d] border border-[#1e293b] rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Shield size={15} className="text-blue-400 shrink-0" />
              <span>1. 3×2 Grid & Column Line-of-Sight</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Heroes in the <strong>FRONTLINE</strong> (Vanguard) absorb direct melee attacks, guarding the <strong>BACKLINE</strong> in the same column until the frontline hero falls.
            </p>
          </div>

          <div className="p-3 bg-[#0e131d] border border-[#1e293b] rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <Zap size={15} className="text-cyan-400 shrink-0" />
              <span>2. Speed & Initiative Turn Order</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every round, all 6 combatants act in order of their <strong>Speed (SPD)</strong> attribute shown on the live <strong>Initiative Ribbon</strong>.
            </p>
          </div>

          <div className="p-3 bg-[#0e131d] border border-[#1e293b] rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-purple-300">
              <Sparkles size={15} className="text-purple-400 shrink-0" />
              <span>3. Team Energy & Burst Skills</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Team Energy increases by <strong>+1 each round</strong> (up to 5 max), empowering hero skills.
            </p>
          </div>

          <div className="p-3 bg-[#0e131d] border border-[#1e293b] rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <Crosshair size={15} className="text-emerald-400 shrink-0" />
              <span>4. Tactical Directives & 10-Round Cap</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Customize Team Tactics (<em>Balanced, Focus Low HP, Backline Pressure, Defensive</em>).
              Defeat all enemies within <strong>10 rounds</strong> to clear the floor!
            </p>
          </div>
        </div>
      </ModalShell>
    </div>
  );
};

const PartyMiniSlot: React.FC<{ title: string; hero?: Hero }> = ({ title, hero }) => {
  if (!hero) {
    return (
      <div className="flex flex-col items-center justify-center p-2 rounded-md bg-[#080b12] border border-dashed border-[#1e293b] min-h-[56px]">
        <span className="text-[8px] font-bold text-slate-500 font-mono">{title}</span>
        <span className="text-[10px] text-slate-600">Empty</span>
      </div>
    );
  }

  const roleConfig = ROLE_COLOR_CONFIG[hero.role || 'BRUISER'];
  const sprite = getTowerSpriteConfig(hero.templateId, hero.role);

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-md bg-[#080b12] border border-[#1e293b]">
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs border overflow-hidden shrink-0 ${roleConfig.border} ${roleConfig.bg}`}
      >
        {sprite.imageSrc ? (
          <img src={sprite.imageSrc} alt={hero.name} className="w-full h-full object-cover" />
        ) : (
          <span>{hero.name[0]}</span>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-[8px] font-bold text-slate-400 font-mono">{title}</div>
        <div className="text-[10px] font-bold text-slate-200 truncate">{hero.name}</div>
      </div>
    </div>
  );
};

export default TowerLobby;
