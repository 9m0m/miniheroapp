import React from 'react';
import { TowerEntity } from '@/domain/combat/combat.types';
import { getTowerSpriteConfig, ROLE_COLOR_CONFIG } from '@/engine/tower/TowerSpriteManifest';
import { Crosshair } from 'lucide-react';

export interface FloatingText {
  id: string;
  targetId: string;
  text: string;
  isCrit?: boolean;
  isHeal?: boolean;
  isEvade?: boolean;
  createdAt: number;
  remainingMs: number;
}

export interface TopBottomCombatantCardProps {
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

const TopBottomCombatantCardComponent: React.FC<TopBottomCombatantCardProps> = ({
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

export const TopBottomCombatantCard = React.memo(
  TopBottomCombatantCardComponent,
  (prev, next) => {
    return (
      prev.entity.entityId === next.entity.entityId &&
      prev.entity.currentHp === next.entity.currentHp &&
      prev.entity.maxHp === next.entity.maxHp &&
      prev.entity.shield === next.entity.shield &&
      prev.entity.isDowned === next.entity.isDowned &&
      prev.entity.evadeCharges === next.entity.evadeCharges &&
      prev.entity.regenStacks === next.entity.regenStacks &&
      prev.isActive === next.isActive &&
      prev.isLunging === next.isLunging &&
      prev.isHit === next.isHit &&
      prev.isFrozen === next.isFrozen &&
      prev.isPlayerSide === next.isPlayerSide &&
      prev.isTargeted === next.isTargeted &&
      prev.floatingTexts.length === next.floatingTexts.length &&
      (prev.floatingTexts.length === 0 ||
        prev.floatingTexts.every((t, i) => t.id === next.floatingTexts[i]?.id))
    );
  }
);
