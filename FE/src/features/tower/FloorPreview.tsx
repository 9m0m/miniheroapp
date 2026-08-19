'use client';

import React from 'react';
import { TowerFloorDto } from '@/types/tower.types';
import { ROLE_COLOR_CONFIG } from '@/engine/tower/TowerSpriteManifest';
import { Swords, ArrowLeft, Users, Trophy } from 'lucide-react';

interface FloorPreviewProps {
  floor: TowerFloorDto;
  onStartBattle: () => void;
  onEditTeam: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const FloorPreview: React.FC<FloorPreviewProps> = ({
  floor,
  onStartBattle,
  onEditTeam,
  onBack,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 select-none overflow-y-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Floor Preview
        </span>
        <button
          onClick={onEditTeam}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 p-1.5 rounded-lg bg-blue-950/40 border border-blue-500/30 transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team</span>
        </button>
      </div>

      {/* Floor Banner Card */}
      <div
        className={`p-4 rounded-2xl border mb-4 relative overflow-hidden ${
          floor.isBoss
            ? 'bg-gradient-to-r from-red-950/60 via-purple-950/40 to-slate-900 border-red-500/50'
            : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            FLOOR {floor.floorNumber}
          </span>
          {floor.isBoss && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
              👑 BOSS STAGE
            </span>
          )}
        </div>

        <h2 className="text-lg font-black text-slate-100 mb-1">{floor.name}</h2>
        <p className="text-xs text-slate-400 mb-3">{floor.description}</p>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
          <div>
            <span className="text-slate-500">Rec. Level: </span>
            <span className="font-bold text-amber-400">Lv.{floor.recommendedLevel}</span>
          </div>
          <div>
            <span className="text-slate-500">Base Score: </span>
            <span className="font-bold text-blue-400">{floor.baseScore}</span>
          </div>
        </div>
      </div>

      {/* Enemy Trio Preview */}
      <div className="mb-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Opponent Lineup (3v3):
        </div>
        <div className="grid grid-cols-3 gap-2">
          {floor.botTrio.map((bot, index) => {
            const roleConfig = ROLE_COLOR_CONFIG[bot.role];
            return (
              <div
                key={`${bot.templateId}-${index}`}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center"
              >
                <span className="text-[9px] font-bold text-slate-500 uppercase mb-1">
                  {bot.row} · {bot.col}
                </span>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-base border mb-1.5 ${roleConfig.border} ${roleConfig.bg}`}
                >
                  {roleConfig.icon}
                </div>
                <span className="text-xs font-bold text-slate-200 truncate max-w-full">
                  {bot.name}
                </span>
                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border my-1 ${roleConfig.badge}`}>
                  {bot.role}
                </span>
                <div className="flex flex-col text-[9px] font-mono text-slate-400">
                  <span>HP {bot.maxHp}</span>
                  <span className="text-amber-400">SPD {bot.speed}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* First Clear Reward Card */}
      {floor.firstClearReward && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>First Clear Rewards:</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            {floor.firstClearReward.gold > 0 && <div>💰 +{floor.firstClearReward.gold} Gold</div>}
            {floor.firstClearReward.essence > 0 && <div>🧪 +{floor.firstClearReward.essence} Essence</div>}
            {floor.firstClearReward.stones > 0 && <div>💎 +{floor.firstClearReward.stones} Stones</div>}
            {floor.firstClearReward.shards > 0 && <div>⭐ +{floor.firstClearReward.shards} Shards</div>}
          </div>
        </div>
      )}

      {/* Action CTA */}
      <div className="mt-auto pt-3 border-t border-slate-800">
        <button
          disabled={isLoading}
          onClick={onStartBattle}
          className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
        >
          <Swords className="w-4 h-4" />
          <span>{isLoading ? 'Initiating Battle...' : 'Enter Combat'}</span>
        </button>
      </div>
    </div>
  );
};
