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
    <div className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-2 py-1.5 flex items-center justify-between gap-2 overflow-x-auto select-none">
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[10px] font-bold tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
          R{roundNumber}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold hidden sm:inline">
          Order
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
        {initiativeOrder.map((entity, index) => {
          const isActive = entity.entityId === activeEntityId;
          const isPlayer = entity.side === 'PLAYER';
          const roleConfig = ROLE_COLOR_CONFIG[entity.role];

          return (
            <div
              key={`${entity.entityId}-${index}`}
              className={`relative flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400 scale-105 shadow-md shadow-amber-500/20'
                  : entity.isDowned
                  ? 'bg-slate-900/40 border-slate-800 opacity-40 grayscale'
                  : isPlayer
                  ? 'bg-blue-950/40 border-blue-500/40'
                  : 'bg-red-950/40 border-red-500/40'
              }`}
            >
              <span className="text-[10px]">{roleConfig.icon}</span>
              <span
                className={`text-[10px] font-bold truncate max-w-[65px] ${
                  isActive ? 'text-amber-300' : isPlayer ? 'text-blue-300' : 'text-red-300'
                }`}
              >
                {entity.name}
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-slate-900/80 text-slate-400 border border-slate-700/50">
                {entity.effectiveStats?.speed || 100}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
