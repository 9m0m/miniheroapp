'use client';

import React, { useState } from 'react';
import { Hero } from '@/types/hero.types';
import { HeroRole } from '@/domain/heroes/hero.types';
import { TowerPartyV2Dto, TowerPartyGridSlot, GridRow, GridCol, TeamTactic, SkillPolicy } from '@/types/tower.types';
import { ROLE_COLOR_CONFIG } from '@/engine/tower/TowerSpriteManifest';
import { Check, ArrowLeft, RotateCcw } from 'lucide-react';

interface PartyBuilderProps {
  ownedHeroes: Hero[];
  currentPartyV2?: TowerPartyV2Dto;
  onSave: (party: TowerPartyV2Dto) => void;
  onBack: () => void;
}

const ROWS: GridRow[] = ['FRONT', 'MID', 'BACK'];
const COLS: GridCol[] = ['LEFT', 'CENTER', 'RIGHT'];

export const PartyBuilder: React.FC<PartyBuilderProps> = ({
  ownedHeroes,
  currentPartyV2,
  onSave,
  onBack,
}) => {
  // Slots state
  const [slots, setSlots] = useState<TowerPartyGridSlot[]>(() => {
    if (currentPartyV2?.slots && currentPartyV2.slots.length === 3) {
      return currentPartyV2.slots;
    }
    if (ownedHeroes.length >= 3) {
      return [
        { heroId: ownedHeroes[0].id, row: 'FRONT', col: 'CENTER' },
        { heroId: ownedHeroes[1].id, row: 'MID', col: 'CENTER' },
        { heroId: ownedHeroes[2].id, row: 'BACK', col: 'CENTER' },
      ];
    }
    return [];
  });

  const [tactic, setTactic] = useState<TeamTactic>(currentPartyV2?.tactic || 'BALANCED');
  const [heroPolicies, setHeroPolicies] = useState<Record<string, SkillPolicy>>(
    currentPartyV2?.heroPolicies || {}
  );
  const [energyPriority, setEnergyPriority] = useState<string[]>(
    currentPartyV2?.energyPriority || slots.map((s) => s.heroId)
  );

  const [activeCell, setActiveCell] = useState<{ row: GridRow; col: GridCol }>({
    row: 'FRONT',
    col: 'CENTER',
  });
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<HeroRole | 'ALL'>('ALL');

  const getHeroAtCell = (row: GridRow, col: GridCol) => {
    const slot = slots.find((s) => s.row === row && s.col === col);
    if (!slot) return null;
    return ownedHeroes.find((h) => h.id === slot.heroId) || null;
  };

  const handleCellClick = (row: GridRow, col: GridCol) => {
    setActiveCell({ row, col });
  };

  const handleSelectHero = (hero: Hero) => {
    const otherSlots = slots.filter((s) => s.heroId !== hero.id && !(s.row === activeCell.row && s.col === activeCell.col));
    const newSlots: TowerPartyGridSlot[] = [...otherSlots, { heroId: hero.id, row: activeCell.row, col: activeCell.col }];
    
    if (newSlots.length <= 3) {
      setSlots(newSlots);
      if (!energyPriority.includes(hero.id)) {
        setEnergyPriority([...energyPriority.filter((id) => newSlots.some((s) => s.heroId === id)), hero.id]);
      }
    }
  };

  const handleAutoAssign = () => {
    if (ownedHeroes.length >= 3) {
      const newSlots: TowerPartyGridSlot[] = [
        { heroId: ownedHeroes[0].id, row: 'FRONT', col: 'CENTER' },
        { heroId: ownedHeroes[1].id, row: 'MID', col: 'CENTER' },
        { heroId: ownedHeroes[2].id, row: 'BACK', col: 'CENTER' },
      ];
      setSlots(newSlots);
      setEnergyPriority(newSlots.map((s) => s.heroId));
    }
  };

  const isComplete = slots.length === 3;

  const filteredHeroes = ownedHeroes.filter((h) => {
    if (selectedRoleFilter === 'ALL') return true;
    return h.role === selectedRoleFilter;
  });

  const handleSave = () => {
    if (!isComplete) return;

    const partyV2: TowerPartyV2Dto = {
      slots,
      tactic,
      heroPolicies,
      energyPriority,
    };

    onSave(partyV2);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-3 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-slate-900 border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>
        <div className="text-xs font-bold text-slate-200">3×3 Grid Formation ({slots.length}/3)</div>
        <button
          type="button"
          onClick={handleAutoAssign}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          title="Auto Assign"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 3x3 Interactive Grid */}
      <div className="flex flex-col gap-1.5 mb-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
          <span>Enemy Side (Facing Top)</span>
          <span className="text-cyan-400">Column Cover Active</span>
        </div>

        <div className="grid grid-rows-3 gap-1.5 mt-1">
          {ROWS.map((row) => (
            <div key={row} className="grid grid-cols-3 gap-1.5">
              {COLS.map((col) => {
                const hero = getHeroAtCell(row, col);
                const isSelected = activeCell.row === row && activeCell.col === col;
                const roleConfig = hero?.role ? ROLE_COLOR_CONFIG[hero.role] : null;

                return (
                  <button
                    type="button"
                    key={`${row}_${col}`}
                    onClick={() => handleCellClick(row, col)}
                    className={`relative p-2 rounded-lg border flex flex-col items-center justify-center min-h-[64px] transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                        : hero
                        ? 'bg-slate-950 border-slate-700 hover:border-slate-500'
                        : 'bg-slate-950/40 border-dashed border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="absolute top-1 left-1.5 text-[8px] font-bold text-slate-500">
                      {row.substring(0, 1)}•{col.substring(0, 1)}
                    </div>

                    {hero ? (
                      <div className="flex flex-col items-center">
                        <span className="text-base">{roleConfig?.icon || '⚔️'}</span>
                        <span className="text-[10px] font-bold text-slate-200 truncate max-w-[70px]">
                          {hero.name}
                        </span>
                        <span className="text-[8px] text-amber-400 font-mono">
                          SPD {hero.towerStats?.speed || 100}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs">+</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tactics & Policies Bar */}
      <div className="flex gap-2 mb-3">
        {/* Tactic Selector */}
        <div className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded-lg flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Team Tactic
          </label>
          <select
            value={tactic}
            onChange={(e) => setTactic(e.target.value as TeamTactic)}
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="BALANCED">Balanced (Default)</option>
            <option value="FOCUS_LOW_HP">Focus Low HP (Finishers)</option>
            <option value="BACKLINE_PRESSURE">Backline Pressure (Assassins)</option>
            <option value="DEFENSIVE">Defensive (Heals & Shields First)</option>
            <option value="CONTROL_FIRST">Control First (Debuffs & CC)</option>
          </select>
        </div>
      </div>

      {/* Role Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1.5 mb-2">
        {(['ALL', 'TANK', 'BRUISER', 'ASSASSIN', 'MARKSMAN', 'MAGE', 'SUPPORT'] as const).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setSelectedRoleFilter(role)}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-colors flex-shrink-0 cursor-pointer ${
              selectedRoleFilter === role
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Owned Heroes List */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {filteredHeroes.map((hero) => {
            const isAssigned = slots.some((s) => s.heroId === hero.id);
            const assignedSlot = slots.find((s) => s.heroId === hero.id);
            const roleConfig = ROLE_COLOR_CONFIG[hero.role || 'BRUISER'];
            const policy = heroPolicies[hero.id] || 'AUTO';

            return (
              <div
                key={hero.id}
                className={`flex flex-col gap-1.5 p-2 rounded-lg border transition-all ${
                  isAssigned
                    ? 'bg-slate-900 border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  onClick={() => handleSelectHero(hero)}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border text-sm ${roleConfig.border} ${roleConfig.bg}`}
                  >
                    {roleConfig.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 truncate">{hero.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleConfig.badge}`}>
                        {hero.role || hero.heroClass}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>Lv.{hero.level}</span>
                      <span>SPD {hero.towerStats?.speed || 100}</span>
                      <span>HP {hero.towerStats?.maxHp || 1000}</span>
                    </div>
                  </div>

                  {assignedSlot && (
                    <div className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded">
                      {assignedSlot.row.substring(0, 1)}•{assignedSlot.col.substring(0, 1)}
                    </div>
                  )}
                </div>

                {/* Per-hero policy if assigned */}
                {isAssigned && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                    <span className="text-slate-400 font-semibold">Skill Policy:</span>
                    <select
                      value={policy}
                      onChange={(e) =>
                        setHeroPolicies({ ...heroPolicies, [hero.id]: e.target.value as SkillPolicy })
                      }
                      className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 text-[10px]"
                    >
                      <option value="AUTO">Auto (Adaptive)</option>
                      <option value="SAVE">Save (Basic Only)</option>
                      <option value="AGGRESSIVE">Aggressive (Burst)</option>
                      <option value="DEFENSIVE">Defensive (Conserve)</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-2 pt-2 border-t border-slate-800">
        <button
          type="button"
          disabled={!isComplete}
          onClick={handleSave}
          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg min-h-[44px] cursor-pointer ${
            isComplete
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-98'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>Save 3×3 Grid Formation</span>
        </button>
      </div>
    </div>
  );
};
