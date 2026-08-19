'use client';

import { TowerFloorDto, TowerProgressDto } from '@/types/tower.types';
import { Hero } from '@/types/hero.types';
import { ROLE_COLOR_CONFIG } from '@/engine/tower/TowerSpriteManifest';
import { Users, Swords, Lock, CheckCircle2, ChevronRight, X } from 'lucide-react';

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
  const currentFloorNum = progress?.currentFloor || 1;
  const highestCleared = progress?.highestFloorCleared || 0;
  const currentFloor = floors.find((f) => f.floorNumber === currentFloorNum) || floors[0];

  const frontHero = ownedHeroes.find((h) => h.id === progress?.savedPartyV2?.slots.find((slot) => slot.row === 'FRONT')?.heroId);
  const midHero = ownedHeroes.find((h) => h.id === progress?.savedPartyV2?.slots.find((slot) => slot.row === 'MID')?.heroId);
  const backHero = ownedHeroes.find((h) => h.id === progress?.savedPartyV2?.slots.find((slot) => slot.row === 'BACK')?.heroId);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-lg">
            🏰
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-100">The Infinite Tower</h1>
            <p className="text-[10px] text-slate-400">Season 1 · 3v3 Tactical Turn Battle</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress & Current Floor Banner */}
      {currentFloor && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 mb-4 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              NEXT TARGET · FLOOR {currentFloor.floorNumber}/30
            </span>
            <span className="text-xs font-mono text-slate-400">
              Cleared: <strong className="text-amber-400">{highestCleared}</strong>/30
            </span>
          </div>

          <h2 className="text-base font-black text-slate-100 mb-1">{currentFloor.name}</h2>
          <p className="text-xs text-slate-400 mb-3 line-clamp-1">{currentFloor.description}</p>

          <button
            onClick={() => onSelectFloor(currentFloor)}
            className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98 transition-all"
          >
            <Swords className="w-4 h-4" />
            <span>Challenge Floor {currentFloor.floorNumber}</span>
          </button>
        </div>
      )}

      {/* 3-Hero Team Quick Preview */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Your 3v3 Formation</span>
          </span>
          <button
            onClick={onEditTeam}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            Edit Team →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <PartyMiniSlot title="FRONT" hero={frontHero} />
          <PartyMiniSlot title="MID" hero={midHero} />
          <PartyMiniSlot title="BACK" hero={backHero} />
        </div>
      </div>

      {/* 30 Floors List */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Floor Map (1–30):
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
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-400/80 cursor-pointer shadow-md shadow-amber-500/10'
                    : isCleared
                    ? 'bg-slate-900/80 border-slate-800 cursor-pointer hover:border-slate-700'
                    : isLocked
                    ? 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed'
                    : 'bg-slate-900/60 border-slate-800 cursor-pointer hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      floor.isBoss
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : isCleared
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isCurrent
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {floor.isBoss ? '👑' : floor.floorNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-amber-300' : isCleared ? 'text-slate-200' : 'text-slate-400'
                        }`}
                      >
                        {floor.name}
                      </span>
                      {floor.isBoss && (
                        <span className="text-[9px] font-bold text-red-400 bg-red-950/80 px-1.5 py-0.2 rounded border border-red-500/30">
                          BOSS
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">Lv.{floor.recommendedLevel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCleared && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isLocked && <Lock className="w-3.5 h-3.5 text-slate-600" />}
                  {!isLocked && <ChevronRight className="w-4 h-4 text-slate-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PartyMiniSlot: React.FC<{ title: string; hero?: Hero }> = ({ title, hero }) => {
  const roleConfig = hero?.role ? ROLE_COLOR_CONFIG[hero.role] : null;

  return (
    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col items-center text-center">
      <span className="text-[9px] font-bold text-slate-500 uppercase mb-1">{title}</span>
      {hero ? (
        <>
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs border mb-1 ${
              roleConfig?.border || 'border-slate-700'
            } ${roleConfig?.bg || 'bg-slate-800'}`}
          >
            {roleConfig?.icon || '🛡️'}
          </div>
          <span className="text-[10px] font-bold text-slate-300 truncate max-w-full">{hero.name}</span>
        </>
      ) : (
        <div className="text-[10px] text-slate-600 my-auto">Empty</div>
      )}
    </div>
  );
};
