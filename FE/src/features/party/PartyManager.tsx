'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { HeroClass, ItemSlot } from '@/types/game.types';
import { calculateTheoreticalDPS } from '@/engine/damageCalculator';
import { Shield, Zap, Heart, Sword, Crosshair, Sparkles, Plus } from 'lucide-react';

const CLASS_CONFIG: Record<HeroClass, { name: string; icon: string; color: string }> = {
  WARRIOR: { name: 'Arthur', icon: '🛡️', color: 'from-blue-600 to-indigo-700' },
  RANGER: { name: 'Robin', icon: '🏹', color: 'from-emerald-600 to-teal-700' },
  MAGE: { name: 'Merlin', icon: '🔮', color: 'from-purple-600 to-violet-700' },
  PRIEST: { name: 'Elena', icon: '💖', color: 'from-rose-500 to-pink-700' },
};

const ALL_SLOTS: { slot: ItemSlot; label: string; icon: string }[] = [
  { slot: 'MAIN_HAND', label: 'Vũ Khí', icon: '⚔️' },
  { slot: 'OFF_HAND', label: 'Vũ Khí Phụ', icon: '🛡️' },
  { slot: 'HELMET', label: 'Mũ Giáp', icon: '🪖' },
  { slot: 'ARMOR', label: 'Áo Giáp', icon: '🥋' },
  { slot: 'PANTS', label: 'Quần Giáp', icon: '👖' },
  { slot: 'BOOTS', label: 'Giày', icon: '👢' },
  { slot: 'RING_1', label: 'Nhẫn 1', icon: '💍' },
  { slot: 'RING_2', label: 'Nhẫn 2', icon: '💍' },
  { slot: 'NECKLACE', label: 'Dây Chuyền', icon: '📿' },
  { slot: 'TALISMAN', label: 'Bùa Chú', icon: '🧿' },
];

export default function PartyManager() {
  const { heroes, selectedHeroClass, selectHero, unequipItem, templates, getHeroTotalStats } = useGameStore();

  const hero = heroes[selectedHeroClass];
  const totalStats = getHeroTotalStats(selectedHeroClass);
  const liveDPS = calculateTheoreticalDPS(totalStats);

  return (
    <div className="flex flex-col gap-3 p-3 text-xs overflow-y-auto flex-1 pb-16">
      {/* 1. Hero Switcher Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-game-dark p-1 rounded-lg border border-game-border">
        {(Object.keys(CLASS_CONFIG) as HeroClass[]).map((classKey) => {
          const config = CLASS_CONFIG[classKey];
          const isSelected = selectedHeroClass === classKey;

          return (
            <button
              key={classKey}
              onClick={() => selectHero(classKey)}
              className={`flex flex-col items-center py-1.5 rounded-md transition-all ${
                isSelected
                  ? `bg-gradient-to-b ${config.color} text-white font-bold shadow-md scale-105`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-game-card'
              }`}
            >
              <span className="text-base">{config.icon}</span>
              <span className="text-[10px] mt-0.5">{config.name}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Hero Level & Live DPS Header */}
      <div className="bg-game-card p-3 rounded-lg border border-game-border flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-xl shadow-inner">
            {CLASS_CONFIG[selectedHeroClass].icon}
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>{hero.name}</span>
              <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.2 rounded font-mono">
                Lv.{hero.level}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Class: {selectedHeroClass}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Sát Thương DPS
          </div>
          <div className="text-base font-bold font-mono text-yellow-400">
            🔥 {liveDPS.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 3. 10 Equipment Slots Grid */}
      <div className="bg-game-card p-3 rounded-lg border border-game-border flex flex-col gap-2">
        <h3 className="font-bold text-slate-200 text-xs flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>10 Ô Trang Bị & Phụ Kiện</span>
        </h3>

        <div className="grid grid-cols-5 gap-2">
          {ALL_SLOTS.map((slotInfo) => {
            const instance = hero.equipment[slotInfo.slot];
            const template = instance ? templates[instance.templateId] : null;

            return (
              <div
                key={slotInfo.slot}
                onClick={() => {
                  if (instance) unequipItem(selectedHeroClass, slotInfo.slot);
                }}
                className={`relative aspect-square rounded-md border flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                  instance
                    ? 'bg-game-dark border-yellow-500/50 hover:border-yellow-400 hover:scale-105'
                    : 'bg-game-dark/50 border-game-border/60 border-dashed hover:border-slate-500'
                }`}
                title={instance ? `${template?.name} (+${instance.enhanceLevel})` : `Trống (${slotInfo.label})`}
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
                    <span className="text-[8px] text-slate-500 mt-0.5">{slotInfo.label}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Streamlined Live Stat Sheet */}
      <div className="bg-game-card p-3 rounded-lg border border-game-border flex flex-col gap-2">
        <h3 className="font-bold text-slate-200 text-xs flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Bảng Chỉ Số Chi Tiết (Live Stats)</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="bg-game-dark p-2 rounded flex justify-between items-center border border-game-border/40">
            <span className="text-slate-400 flex items-center gap-1">
              <Sword className="w-3 h-3 text-red-400" /> ATK Vật Lý:
            </span>
            <span className="text-red-400 font-bold">{totalStats.physAtk}</span>
          </div>

          <div className="bg-game-dark p-2 rounded flex justify-between items-center border border-game-border/40">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> ATK Phép:
            </span>
            <span className="text-purple-400 font-bold">{totalStats.magicAtk}</span>
          </div>

          <div className="bg-game-dark p-2 rounded flex justify-between items-center border border-game-border/40">
            <span className="text-slate-400 flex items-center gap-1">
              <Heart className="w-3 h-3 text-emerald-400" /> Máu Tối Đa:
            </span>
            <span className="text-emerald-400 font-bold">{totalStats.maxHp}</span>
          </div>

          <div className="bg-game-dark p-2 rounded flex justify-between items-center border border-game-border/40">
            <span className="text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-400" /> Giáp / DR:
            </span>
            <span className="text-blue-400 font-bold">{totalStats.armor} ({totalStats.dmgReduction}%)</span>
          </div>

          <div className="bg-game-dark p-2 rounded flex justify-between items-center border border-game-border/40">
            <span className="text-slate-400 flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-yellow-400" /> Chí Mạng:
            </span>
            <span className="text-yellow-400 font-bold">{totalStats.critRate}% ({totalStats.critDmg}%)</span>
          </div>

          <div className="bg-game-dark p-2 rounded flex justify-between items-center border border-game-border/40">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> Tốc Đánh:
            </span>
            <span className="text-cyan-400 font-bold">{totalStats.atkSpeed.toFixed(2)}/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
