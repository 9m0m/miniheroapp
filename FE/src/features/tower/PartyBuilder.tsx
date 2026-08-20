'use client';

import React, { useState } from 'react';
import { Hero } from '@/types/hero.types';
import { HeroRole } from '@/domain/heroes/hero.types';
import { TowerPartyV2Dto, TowerPartyGridSlot, GridRow, GridCol, TeamTactic, SkillPolicy } from '@/types/tower.types';
import { ROLE_COLOR_CONFIG, getTowerSpriteConfig } from '@/engine/tower/TowerSpriteManifest';
import { Check, ArrowLeft, RotateCcw, Shield, Sparkles } from 'lucide-react';

interface PartyBuilderProps {
  ownedHeroes: Hero[];
  currentPartyV2?: TowerPartyV2Dto;
  onSave: (party: TowerPartyV2Dto) => void;
  onBack: () => void;
}

const ROWS: GridRow[] = ['FRONT', 'BACK'];
const COLS: GridCol[] = ['LEFT', 'CENTER', 'RIGHT'];

const ROW_TITLES: Record<string, { label: string; sub: string; color: string }> = {
  FRONT: { label: 'FRONTLINE (VANGUARD)', sub: 'Absorbs direct melee strikes & shields backline', color: 'text-amber-400' },
  BACK: { label: 'BACKLINE (REARGUARD)', sub: 'Ranged DPS & Healers protected behind frontline', color: 'text-cyan-400' },
};

export const PartyBuilder: React.FC<PartyBuilderProps> = ({
  ownedHeroes,
  currentPartyV2,
  onSave,
  onBack,
}) => {
  // Slots state (3x2: FRONT or BACK, mapped if any legacy MID exists)
  const [slots, setSlots] = useState<TowerPartyGridSlot[]>(() => {
    if (currentPartyV2?.slots && currentPartyV2.slots.length === 3) {
      return currentPartyV2.slots.map((s) => ({
        ...s,
        row: s.row === 'MID' ? 'BACK' : s.row, // Sanitize legacy MID to BACK
      }));
    }
    if (ownedHeroes.length >= 3) {
      return [
        { heroId: ownedHeroes[0].id, row: 'FRONT', col: 'CENTER' },
        { heroId: ownedHeroes[1].id, row: 'BACK', col: 'LEFT' },
        { heroId: ownedHeroes[2].id, row: 'BACK', col: 'RIGHT' },
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
      // Best practice 3x2: 1 Tank Front-Center, 2 Backline Left & Right
      const newSlots: TowerPartyGridSlot[] = [
        { heroId: ownedHeroes[0].id, row: 'FRONT', col: 'CENTER' },
        { heroId: ownedHeroes[1].id, row: 'BACK', col: 'LEFT' },
        { heroId: ownedHeroes[2].id, row: 'BACK', col: 'RIGHT' },
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
    <div className="flex flex-col h-full bg-[#06080e] text-slate-100 p-3 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-md btn-game-dark cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>
        <div className="text-xs font-bold text-slate-200 font-mono">
          3×2 Tactical Grid ({slots.length}/3)
        </div>
        <button
          type="button"
          onClick={handleAutoAssign}
          className="p-1.5 rounded-md btn-game-dark text-slate-400 hover:text-slate-200 cursor-pointer"
          title="Auto Assign"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 3x2 Interactive Formation Grid (2 Rows x 3 Columns) */}
      <div className="flex flex-col gap-2 mb-2.5 p-3 bg-[#0e131d] border border-[#1e293b] rounded-lg shadow-sm">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
          <span>Enemy Side (Facing Top)</span>
          <span className="text-cyan-400 font-mono">Column Line-of-Sight</span>
        </div>

        <div className="flex flex-col gap-2.5 mt-1">
          {ROWS.map((row) => {
            const rowInfo = ROW_TITLES[row] || ROW_TITLES.FRONT;
            return (
              <div key={row} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[9px] px-1 font-mono">
                  <span className={`font-bold ${rowInfo.color}`}>{rowInfo.label}</span>
                  <span className="text-slate-500">{row === 'FRONT' ? 'Row 1 (Guard)' : 'Row 2 (Damage)'}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {COLS.map((col) => {
                    const hero = getHeroAtCell(row, col);
                    const isSelected = activeCell.row === row && activeCell.col === col;
                    const roleConfig = hero?.role ? ROLE_COLOR_CONFIG[hero.role] : null;
                    const sprite = hero ? getTowerSpriteConfig(hero.templateId, hero.role) : null;

                    return (
                      <button
                        type="button"
                        key={`${row}_${col}`}
                        onClick={() => handleCellClick(row, col)}
                        className={`relative p-2 rounded-lg border flex flex-col items-center justify-center min-h-[72px] transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-md scale-102'
                            : hero
                            ? 'bg-[#101623] border-[#222d3d] hover:border-slate-500'
                            : 'bg-[#080b12] border-dashed border-[#1e293b] hover:border-slate-700'
                        }`}
                      >
                        <div className="absolute top-1 left-1.5 text-[8px] font-mono font-bold text-slate-500">
                          {row.substring(0, 1)}•{col.substring(0, 1)}
                        </div>

                        {hero ? (
                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded overflow-hidden mb-0.5">
                              {sprite?.imageSrc ? (
                                <img src={sprite.imageSrc} alt={hero.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs">{roleConfig?.icon || '⚔️'}</span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-200 truncate max-w-[76px]">
                              {hero.name}
                            </span>
                            <span className="text-[8px] text-amber-400 font-mono">
                              SPD {hero.towerStats?.speed || 100}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-600">
                            <span className="text-sm font-bold leading-none">+</span>
                            <span className="text-[8px] uppercase tracking-wider mt-0.5 font-mono">{col}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Tactic Selector */}
      <div className="p-2.5 bg-[#0e131d] border border-[#1e293b] rounded-lg mb-2.5 flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Team Tactical Directive
        </label>
        <select
          value={tactic}
          onChange={(e) => setTactic(e.target.value as TeamTactic)}
          className="bg-[#080b12] border border-[#1e293b] rounded px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          <option value="BALANCED">Balanced (Standard Front-to-Back)</option>
          <option value="FOCUS_LOW_HP">Focus Low HP (Finisher Priority)</option>
          <option value="BACKLINE_PRESSURE">Backline Pressure (Assassins Bypass Front)</option>
          <option value="DEFENSIVE">Defensive (Heals & Shields First)</option>
          <option value="CONTROL_FIRST">Control First (Debuffs & CC)</option>
        </select>
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
                ? 'btn-game-amber font-black shadow-sm'
                : 'bg-[#0e131d] text-slate-400 border border-[#1e293b] hover:text-slate-200'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Owned Heroes List */}
      <div className="flex-1 overflow-y-auto pr-0.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {filteredHeroes.map((hero) => {
            const isAssigned = slots.some((s) => s.heroId === hero.id);
            const assignedSlot = slots.find((s) => s.heroId === hero.id);
            const roleConfig = ROLE_COLOR_CONFIG[hero.role || 'BRUISER'];
            const sprite = getTowerSpriteConfig(hero.templateId, hero.role);

            return (
              <div
                key={hero.id}
                onClick={() => handleSelectHero(hero)}
                className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                  isAssigned
                    ? 'bg-[#101623] border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-[#0e131d] border-[#1e293b] hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center border text-xs overflow-hidden ${roleConfig.border} ${roleConfig.bg}`}
                >
                  {sprite?.imageSrc ? (
                    <img src={sprite.imageSrc} alt={hero.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{roleConfig.icon}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 truncate">{hero.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleConfig.badge}`}>
                      {hero.role || hero.heroClass}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>Lv.{hero.level}</span>
                    <span>SPD {hero.towerStats?.speed || 100}</span>
                    <span>HP {hero.towerStats?.maxHp || 1000}</span>
                  </div>
                </div>

                {assignedSlot && (
                  <div className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded font-mono">
                    {assignedSlot.row}•{assignedSlot.col.substring(0, 1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-2 pt-2 border-t border-[#1e293b]">
        <button
          type="button"
          disabled={!isComplete}
          onClick={handleSave}
          className={`w-full py-2.5 rounded-md font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg min-h-[44px] cursor-pointer uppercase tracking-wider ${
            isComplete
              ? 'btn-game-amber shadow-amber-500/20 active:scale-98'
              : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>Save 3×2 Grid Formation</span>
        </button>
      </div>
    </div>
  );
};

export default PartyBuilder;
