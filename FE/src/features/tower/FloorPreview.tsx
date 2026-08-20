'use client';

import React from 'react';
import { TowerFloorDto } from '@/types/tower.types';
import { ROLE_COLOR_CONFIG, getTowerSpriteConfig } from '@/engine/tower/TowerSpriteManifest';
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
    <div className="flex flex-col h-full bg-[#06080e] text-slate-100 p-3.5 select-none overflow-y-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-md btn-game-dark cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Floor Preview
        </span>
        <button
          onClick={onEditTeam}
          className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 p-1.5 rounded-md btn-game-cyan cursor-pointer transition-colors font-bold"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team</span>
        </button>
      </div>

      {/* Floor Banner Card */}
      <div
        className={`p-3.5 rounded-lg border mb-3 relative overflow-hidden shadow-md ${
          floor.isBoss
            ? 'bg-gradient-to-r from-red-950/60 via-[#1a1024] to-[#0a0e17] border-red-500/50'
            : 'bg-gradient-to-r from-[#141b2b] via-[#101623] to-[#0a0e17] border-[#222d3d]'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            FLOOR {floor.floorNumber}
          </span>
          {floor.isBoss && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider">
              👑 BOSS STAGE
            </span>
          )}
        </div>

        <h2 className="text-base font-black text-slate-100 mb-0.5">{floor.name}</h2>
        <p className="text-[11px] text-slate-400 mb-2.5">{floor.description}</p>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
          <div>
            <span className="text-slate-500">Rec. Level: </span>
            <span className="font-bold text-amber-400">Lv.{floor.recommendedLevel}</span>
          </div>
        </div>
      </div>

      {/* Enemy Trio Preview */}
      <div className="mb-3">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 px-1">
          Opponent Lineup (3×2 Grid):
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {floor.botTrio.map((bot, index) => {
            const roleConfig = ROLE_COLOR_CONFIG[bot.role];
            const sprite = getTowerSpriteConfig(bot.templateId, bot.role);
            const rowLabel = bot.row === 'FRONT' ? 'FRONT' : 'BACK';

            return (
              <div
                key={`${bot.templateId}-${index}`}
                className="p-2 rounded-lg bg-[#0e131d] border border-[#1e293b] flex flex-col items-center text-center shadow-sm"
              >
                <span className="text-[8px] font-bold text-slate-500 uppercase mb-1 font-mono">
                  {rowLabel} · {bot.col.substring(0, 1)}
                </span>
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center text-base border mb-1 overflow-hidden shadow-inner ${roleConfig.border} ${roleConfig.bg}`}
                >
                  {sprite?.imageSrc ? (
                    <img src={sprite.imageSrc} alt={bot.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{roleConfig.icon}</span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-200 truncate max-w-full">
                  {bot.name}
                </span>
                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border my-0.5 ${roleConfig.badge}`}>
                  {bot.role}
                </span>
                <div className="flex flex-col text-[9px] font-mono text-slate-400 mt-0.5">
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
        <div className="p-3 rounded-lg bg-[#0e131d] border border-[#1e293b] mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>First Clear Rewards:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-300">
            {floor.firstClearReward.gold > 0 && <div className="px-2 py-0.5 bg-[#080b12] rounded border border-amber-500/30 text-amber-300">💰 +{floor.firstClearReward.gold} Gold</div>}
            {floor.firstClearReward.essence > 0 && <div className="px-2 py-0.5 bg-[#080b12] rounded border border-cyan-500/30 text-cyan-300">🧪 +{floor.firstClearReward.essence} Essence</div>}
            {floor.firstClearReward.stones > 0 && <div className="px-2 py-0.5 bg-[#080b12] rounded border border-purple-500/30 text-purple-300">💎 +{floor.firstClearReward.stones} Stones</div>}
            {floor.firstClearReward.shards > 0 && <div className="px-2 py-0.5 bg-[#080b12] rounded border border-amber-500/30 text-amber-300">⭐ +{floor.firstClearReward.shards} Shards</div>}
          </div>
        </div>
      )}

      {/* Action CTA */}
      <div className="mt-auto pt-3 border-t border-[#1e293b]">
        <button
          disabled={isLoading}
          onClick={onStartBattle}
          data-tutorial-target="tower-challenge-btn"
          className="w-full py-3 rounded-md btn-game-amber font-black text-xs text-slate-950 flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer uppercase tracking-wider"
        >
          <Swords className="w-4 h-4" />
          <span>{isLoading ? 'Initiating Battle...' : 'Enter Combat'}</span>
        </button>
      </div>
    </div>
  );
};

export default FloorPreview;
