'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { HeroClass, ItemSlot, ItemInstance } from '@/types/game.types';
import { calculateTheoreticalDPS } from '@/engine/damageCalculator';
import {
  Shield,
  Zap,
  Heart,
  Sword,
  Crosshair,
  Sparkles,
  Hammer,
  X,
  Swords,
  Users,
  CheckCircle2,
  PlusCircle,
  TrendingUp,
  UserCheck,
  UserX,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const CLASS_CONFIG: Record<HeroClass, { name: string; role: string; image: string; color: string; bgBadge: string }> = {
  WARRIOR: { name: 'Warrior', role: 'Frontline Tank', image: '/knightclass.jpg', color: 'from-blue-600 to-indigo-700', bgBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  RANGER: { name: 'Archer', role: 'Physical Ranged DPS', image: '/archer.jpg', color: 'from-emerald-600 to-teal-700', bgBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  MAGE: { name: 'Wizard', role: 'Elemental Magic DPS', image: '/wizard.jpg', color: 'from-purple-600 to-violet-700', bgBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  PRIEST: { name: 'Priest', role: 'Holy Support & Healer', image: '/priest.png', color: 'from-rose-500 to-pink-700', bgBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
};

function HeroAvatarIcon({ heroClass, className = 'w-full h-full' }: { heroClass: HeroClass; className?: string }) {
  const [imageError, setImageError] = useState(false);
  const cfg = CLASS_CONFIG[heroClass];

  if (cfg.image && !imageError) {
    return (
      <img
        src={cfg.image}
        alt={cfg.name}
        className={`${className} object-cover`}
        onError={() => setImageError(true)}
      />
    );
  }

  switch (heroClass) {
    case 'WARRIOR':
      return <Shield className="w-5 h-5 text-blue-400" />;
    case 'RANGER':
      return <Crosshair className="w-5 h-5 text-emerald-400" />;
    case 'MAGE':
      return <Sparkles className="w-5 h-5 text-purple-400" />;
    case 'PRIEST':
      return <Heart className="w-5 h-5 text-rose-400" />;
  }
}

const ALL_SLOTS: { slot: ItemSlot; label: string; icon: string }[] = [
  { slot: 'MAIN_HAND', label: 'Main Weapon', icon: '⚔️' },
  { slot: 'OFF_HAND', label: 'Off-Hand', icon: '🛡️' },
  { slot: 'HELMET', label: 'Helmet', icon: '🪖' },
  { slot: 'ARMOR', label: 'Armor', icon: '🥋' },
  { slot: 'PANTS', label: 'Pants', icon: '👖' },
  { slot: 'BOOTS', label: 'Boots', icon: '👢' },
  { slot: 'RING_1', label: 'Ring 1', icon: '💍' },
  { slot: 'RING_2', label: 'Ring 2', icon: '💍' },
  { slot: 'NECKLACE', label: 'Necklace', icon: '📿' },
  { slot: 'TALISMAN', label: 'Talisman', icon: '🧿' },
];

export default function PartyManager() {
  const {
    heroes,
    activeParty,
    toggleDeployHero,
    selectedHeroClass,
    selectHero,
    templates,
    getHeroTotalStats,
    openEnhanceModal,
    openSkillTreeModal,
  } = useGameStore();

  const [selectedSlotItem, setSelectedSlotItem] = useState<{ slot: ItemSlot; item: ItemInstance } | null>(null);
  const [showAddHeroModal, setShowAddHeroModal] = useState<boolean>(false);
  const [isSquadExpanded, setIsSquadExpanded] = useState<boolean>(false);

  const hero = heroes[selectedHeroClass];
  const totalStats = getHeroTotalStats(selectedHeroClass);
  const liveDPS = calculateTheoreticalDPS(totalStats);

  const isCurrentHeroDeployed = activeParty.includes(selectedHeroClass);

  // Total Party Combined DPS
  const partyTotalDPS = activeParty.reduce((acc, hClass) => {
    const stats = getHeroTotalStats(hClass);
    return acc + calculateTheoreticalDPS(stats);
  }, 0);

  const handleSlotClick = (slot: ItemSlot, instance?: ItemInstance) => {
    if (instance) {
      setSelectedSlotItem({ slot, item: instance });
    } else {
      setSelectedSlotItem(null);
    }
  };

  // Get list of heroes in reserve (not in active party)
  const reserveHeroes = (Object.keys(CLASS_CONFIG) as HeroClass[]).filter(
    (hClass) => !activeParty.includes(hClass)
  );

  return (
    <div className="flex flex-col gap-3 p-3 text-xs overflow-y-auto flex-1 pb-16">
      {/* 1. Collapsible Party Formation & Squad Management Bar */}
      <div className="bg-game-card p-3 rounded-2xl border border-game-border flex flex-col gap-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>ACTIVE SQUAD ({activeParty.length}/3)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 font-mono text-[11px] text-amber-400 font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{partyTotalDPS.toLocaleString()}</span>
            </div>

            <button
              onClick={() => setIsSquadExpanded(!isSquadExpanded)}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-[10px] flex items-center gap-1 transition"
            >
              <span>{isSquadExpanded ? 'Collapse' : 'Edit Squad'}</span>
              {isSquadExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {/* Compact View when Collapsed */}
        {!isSquadExpanded ? (
          <div className="flex items-center justify-between bg-game-dark/60 px-3 py-2 rounded-xl border border-game-border/50">
            <div className="flex items-center gap-2">
              {activeParty.map((hClass, idx) => {
                const cfg = CLASS_CONFIG[hClass];
                return (
                  <div
                    key={hClass}
                    onClick={() => selectHero(hClass)}
                    className="flex items-center gap-1.5 cursor-pointer bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-700/70 hover:border-cyan-400 transition"
                  >
                    <div className="w-5 h-5 rounded-md overflow-hidden border border-slate-700 flex items-center justify-center bg-slate-950">
                      <HeroAvatarIcon heroClass={hClass} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-200">{cfg.name}</span>
                  </div>
                );
              })}
            </div>
            <span className="text-[9px] text-slate-500 font-mono">3 Deployed</span>
          </div>
        ) : (
          /* Full 3 Deployment Slots Grid when Expanded */
          <div className="grid grid-cols-3 gap-2 pt-1 animate-fade-in">
            {Array.from({ length: 3 }).map((_, idx) => {
              const deployedClass = activeParty[idx];
              if (deployedClass) {
                const cfg = CLASS_CONFIG[deployedClass];
                const isSelected = selectedHeroClass === deployedClass;

                return (
                  <div
                    key={deployedClass}
                    className={`p-2 rounded-2xl border flex flex-col items-center justify-between gap-1.5 transition-all relative group ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400/50 shadow-md scale-102'
                        : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500'
                    }`}
                  >
                    {/* Remove Button (✕) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDeployHero(deployedClass);
                      }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white flex items-center justify-center transition-all z-10"
                      title={`Remove ${cfg.name} from active party`}
                    >
                      <X size={11} />
                    </button>

                    {/* Slot Click to Select Hero */}
                    <div
                      onClick={() => selectHero(deployedClass)}
                      className="w-full flex flex-col items-center cursor-pointer pt-1"
                    >
                      <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-700/90 bg-slate-950 flex items-center justify-center shadow-sm relative">
                        <HeroAvatarIcon heroClass={deployedClass} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-100 truncate w-full text-center mt-1">
                        {cfg.name}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate w-full text-center">
                        {deployedClass === 'WARRIOR' ? 'Frontline' : deployedClass === 'PRIEST' ? 'Support' : 'Main DPS'}
                      </span>
                    </div>

                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Slot {idx + 1}
                    </span>
                  </div>
                );
              }

              // Empty Slot with interactive Add button
              return (
                <button
                  key={`empty_${idx}`}
                  onClick={() => setShowAddHeroModal(true)}
                  className="p-3 rounded-2xl border border-dashed border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-900/30 hover:border-cyan-400 flex flex-col items-center justify-center gap-1 text-cyan-300 transition-all group active:scale-95 min-h-[105px]"
                  title="Click to deploy a reserve hero to this slot"
                >
                  <PlusCircle className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">+ Add Hero</span>
                  <span className="text-[8px] text-slate-500">Slot {idx + 1}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Add Hero Modal / Drawer */}
      {showAddHeroModal && (
        <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2.5 animate-scale-up">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs text-white">Select Reserve Hero to Deploy (Max 3)</h4>
            </div>
            <button
              onClick={() => setShowAddHeroModal(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          {reserveHeroes.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {reserveHeroes.map((hClass) => {
                const cfg = CLASS_CONFIG[hClass];
                return (
                  <button
                    key={hClass}
                    onClick={() => {
                      toggleDeployHero(hClass);
                      setShowAddHeroModal(false);
                    }}
                    className="p-2.5 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-950/80 hover:bg-cyan-950/40 flex items-center gap-2.5 transition text-left"
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0 flex items-center justify-center">
                      <HeroAvatarIcon heroClass={hClass} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100">{cfg.name}</div>
                      <div className="text-[9px] text-slate-400 truncate">{cfg.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 py-2">
              All 3 deployment slots are filled!
            </p>
          )}
        </div>
      )}

      {/* 2. Hero Switcher Tabs with Clean Avatars & Status Badges */}
      <div className="grid grid-cols-4 gap-1.5 bg-game-dark p-1 rounded-xl border border-game-border">
        {(Object.keys(CLASS_CONFIG) as HeroClass[]).map((classKey) => {
          const config = CLASS_CONFIG[classKey];
          const isSelected = selectedHeroClass === classKey;
          const isDeployed = activeParty.includes(classKey);

          return (
            <button
              key={classKey}
              onClick={() => {
                selectHero(classKey);
                setSelectedSlotItem(null);
              }}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all relative ${
                isSelected
                  ? `bg-gradient-to-b ${config.color} text-white font-bold shadow-lg ring-1 ring-white/30 scale-102`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-game-card'
              }`}
            >
              {/* Deployed Dot */}
              <div
                className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                  isDeployed ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
                title={isDeployed ? 'Deployed in Battle' : 'In Reserve'}
              />

              <div className={`w-8 h-8 rounded-lg overflow-hidden border mb-1 flex items-center justify-center ${isSelected ? 'border-white/70 shadow-sm' : 'border-slate-700 bg-slate-900'}`}>
                <HeroAvatarIcon heroClass={classKey} />
              </div>
              <span className="text-[10px] mt-0.5 font-bold">{config.name}</span>
              <span className={`text-[8px] mt-0.5 px-1.5 py-0.2 rounded-full ${isDeployed ? 'text-emerald-300 bg-emerald-950/90 font-bold' : 'text-slate-500 bg-slate-800'}`}>
                {isDeployed ? 'Active' : 'Reserve'}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Hero Level, Deployment Toggle & Live DPS Header */}
      <div className="bg-game-card p-3 rounded-2xl border border-game-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 border border-amber-500/40 overflow-hidden flex items-center justify-center text-2xl shadow-md flex-shrink-0 relative">
            <HeroAvatarIcon heroClass={selectedHeroClass} />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>{CLASS_CONFIG[selectedHeroClass].name}</span>
              <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-mono font-bold">
                Lv.{hero.level}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">{CLASS_CONFIG[selectedHeroClass].role}</p>
          </div>
        </div>

        {/* Action Controls: Deploy / Remove Toggle & Skill Modal */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Minimalist Active / Bench Toggle Button (+ / -) */}
          <button
            onClick={() => toggleDeployHero(selectedHeroClass)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
              isCurrentHeroDeployed
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-rose-500/10'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10'
            }`}
            title={isCurrentHeroDeployed ? 'Click to send this hero to reserve' : 'Click to deploy this hero to the battle squad'}
          >
            {isCurrentHeroDeployed ? <Minus size={13} className="text-rose-400" /> : <Plus size={13} className="text-emerald-400" />}
            <span>{isCurrentHeroDeployed ? 'Remove' : 'Deploy'}</span>
          </button>

          <button
            onClick={() => openSkillTreeModal()}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-[10px] hover:brightness-110 active:scale-95 transition flex items-center gap-1 shadow-md shadow-amber-500/20"
          >
            <Zap size={12} />
            <span>Skills</span>
          </button>

          <div className="text-right pl-1 border-l border-slate-700/80">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
              DPS Rating
            </div>
            <div className="text-sm font-bold font-mono text-yellow-400 flex items-center gap-0.5 justify-end">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{liveDPS.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 10 Equipment Slots Grid */}
      <div className="bg-game-card p-3 rounded-2xl border border-game-border flex flex-col gap-2">
        <h3 className="font-bold text-slate-200 text-xs flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>10 Equipment & Accessory Slots ({CLASS_CONFIG[selectedHeroClass].name})</span>
        </h3>

        <div className="grid grid-cols-5 gap-2">
          {ALL_SLOTS.map((slotInfo) => {
            const instance = hero.equipment[slotInfo.slot];
            const template = instance ? templates[instance.templateId] : null;
            const isSelected = selectedSlotItem?.slot === slotInfo.slot;

            return (
              <div
                key={slotInfo.slot}
                onClick={() => handleSlotClick(slotInfo.slot, instance)}
                className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                  instance
                    ? isSelected
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-500/20'
                      : 'bg-game-dark border-yellow-500/50 hover:border-yellow-400 hover:scale-105'
                    : 'bg-game-dark/50 border-game-border/60 border-dashed hover:border-slate-500'
                }`}
                title={instance ? `${template?.name} (+${instance.enhanceLevel})` : `Empty (${slotInfo.label})`}
              >
                {instance ? (
                  <>
                    <span className="text-xl">{template?.icon || '📦'}</span>
                    {instance.enhanceLevel > 0 && (
                      <span className="absolute top-0.5 right-0.5 text-[8px] font-bold bg-yellow-500 text-black px-1 rounded">
                        +{instance.enhanceLevel}
                      </span>
                    )}
                    <span className="text-[8px] text-slate-300 truncate w-full text-center mt-0.5">
                      {slotInfo.label}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm opacity-30">{slotInfo.icon}</span>
                    <span className="text-[7px] text-slate-500 truncate w-full text-center mt-0.5">
                      {slotInfo.label}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Selected Slot Item Modal / Actions Drawer */}
      {selectedSlotItem && (
        <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-3 shadow-xl flex flex-col gap-2.5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {templates[selectedSlotItem.item.templateId]?.icon || '📦'}
              </span>
              <div>
                <h4 className="font-bold text-xs text-amber-300">
                  {templates[selectedSlotItem.item.templateId]?.name || 'Equipment'}
                  {selectedSlotItem.item.enhanceLevel > 0 && ` (+${selectedSlotItem.item.enhanceLevel})`}
                </h4>
                <span className="text-[9px] text-slate-400 font-mono">
                  Rarity: {selectedSlotItem.item.rarity} • Slot: {selectedSlotItem.slot}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedSlotItem(null)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => {
                openEnhanceModal(selectedSlotItem.item);
                setSelectedSlotItem(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] flex items-center gap-1 transition"
            >
              <Hammer size={12} />
              <span>Enhance Gear</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. Live Combat Attributes Matrix */}
      <div className="bg-game-card p-3 rounded-2xl border border-game-border flex flex-col gap-2 shadow-sm">
        <h3 className="font-bold text-slate-200 text-xs flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Combat Attributes ({CLASS_CONFIG[selectedHeroClass].name})</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px] font-mono">
          <div className="flex justify-between bg-game-dark/80 p-2 rounded-xl border border-game-border/60">
            <span className="text-slate-400 flex items-center gap-1">
              <Sword size={12} className="text-rose-400" /> Phys ATK:
            </span>
            <span className="text-rose-400 font-bold">{totalStats.physAtk.toFixed(0)}</span>
          </div>

          <div className="flex justify-between bg-game-dark/80 p-2 rounded-xl border border-game-border/60">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles size={12} className="text-purple-400" /> Magic ATK:
            </span>
            <span className="text-purple-400 font-bold">{totalStats.magicAtk.toFixed(0)}</span>
          </div>

          <div className="flex justify-between bg-game-dark/80 p-2 rounded-xl border border-game-border/60">
            <span className="text-slate-400 flex items-center gap-1">
              <Shield size={12} className="text-blue-400" /> Armor:
            </span>
            <span className="text-blue-400 font-bold">{totalStats.armor.toFixed(0)}</span>
          </div>

          <div className="flex justify-between bg-game-dark/80 p-2 rounded-xl border border-game-border/60">
            <span className="text-slate-400 flex items-center gap-1">
              <Heart size={12} className="text-emerald-400" /> Max HP:
            </span>
            <span className="text-emerald-400 font-bold">{totalStats.maxHp.toFixed(0)}</span>
          </div>

          <div className="flex justify-between bg-game-dark/80 p-2 rounded-xl border border-game-border/60">
            <span className="text-slate-400 flex items-center gap-1">
              <Crosshair size={12} className="text-yellow-400" /> Crit Rate:
            </span>
            <span className="text-yellow-400 font-bold">{totalStats.critRate.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between bg-game-dark/80 p-2 rounded-xl border border-game-border/60">
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp size={12} className="text-amber-400" /> Crit DMG:
            </span>
            <span className="text-amber-400 font-bold">{totalStats.critDmg.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
