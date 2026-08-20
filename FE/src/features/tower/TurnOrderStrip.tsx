'use client';

import React from 'react';
import { TowerEntity } from '@/domain/combat/combat.types';
import { ROLE_COLOR_CONFIG } from '@/engine/tower/TowerSpriteManifest';

interface TurnOrderStripProps {
  initiativeOrder: TowerEntity[];
  activeEntityId?: string;
  roundNumber: number;
}

export const TurnOrderStrip: React.FC<TurnOrderStripProps> = ({
  initiativeOrder,
  activeEntityId,
  roundNumber,
}) => {
  return (
    <div className="w-full bg-[#0a0e17] border-b border-[#1e293b] px-3 py-2 flex items-center justify-between gap-2.5 overflow-x-auto select-none shadow-md shrink-0">
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs font-black tracking-wider text-amber-300 bg-amber-500/25 px-2.5 py-1 rounded-md border border-amber-400/50 font-mono shadow-sm">
          R{roundNumber}
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
        {initiativeOrder.map((entity, index) => {
          const isActive = entity.entityId === activeEntityId;
          const isPlayer = entity.side === 'PLAYER';
          const roleConfig = ROLE_COLOR_CONFIG[entity.role];

          return (
            <div
              key={`${entity.entityId}-${index}`}
              className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? 'bg-amber-500/30 border-amber-300 ring-2 ring-amber-400 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.6)] z-10'
                  : entity.isDowned
                  ? 'bg-slate-900/40 border-slate-800 opacity-40 grayscale'
                  : isPlayer
                  ? 'bg-blue-950/60 border-blue-500/50 shadow-sm'
                  : 'bg-red-950/60 border-red-500/50 shadow-sm'
              }`}
            >
              <span className="text-xs">{roleConfig.icon}</span>
              <span
                className={`text-xs font-black truncate max-w-[85px] ${
                  isActive
                    ? 'text-amber-300'
                    : isPlayer
                    ? 'text-blue-200'
                    : 'text-red-200'
                }`}
              >
                {entity.name}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#080b12] text-slate-300 border border-[#1e293b]">
                {entity.effectiveStats?.speed || 100}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TurnOrderStrip;
