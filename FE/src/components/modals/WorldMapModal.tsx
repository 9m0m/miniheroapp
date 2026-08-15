'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, Map, ShieldAlert, Sparkles, Lock, CheckCircle2, Flame, Snowflake, Compass } from 'lucide-react';
import { WorldConfig } from '../../types';

const WORLDS_DATA: WorldConfig[] = [
  {
    worldIndex: 1,
    name: 'World 1: Emerald Forest',
    description: 'Vibrant wilderness teeming with ancient Goblin clans and feral beasts.',
    backgroundTheme: 'from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/40',
    dominantElement: 'PHYSICAL',
    bossName: 'Elder Goblin King',
    bossIcon: '👑',
    totalStages: 10,
    dropBonusList: ['+10% Gold Boost', 'Alchemy Herbal Essence Drops'],
  },
  {
    worldIndex: 2,
    name: 'World 2: Frozen Citadel',
    description: 'Glacial fortress where sub-zero blizzards test the endurance of warriors.',
    backgroundTheme: 'from-cyan-950/80 via-slate-900 to-slate-950 border-cyan-500/40',
    dominantElement: 'COLD',
    bossName: 'Ancient Frost Wyrm',
    bossIcon: '🐉',
    totalStages: 10,
    dropBonusList: ['+25% Glacial Shards', '+10% Cold Resistance Gear'],
  },
  {
    worldIndex: 3,
    name: 'World 3: Volcanic Caldera',
    description: 'Sea of magma where fire demons and lava behemoths roam.',
    backgroundTheme: 'from-red-950/80 via-slate-900 to-slate-950 border-red-500/40',
    dominantElement: 'FIRE',
    bossName: 'Fire Lord Ifrit',
    bossIcon: '🔥',
    totalStages: 10,
    dropBonusList: ['+25% Fire Crystals', '+15% Fire Damage Buff'],
  },
  {
    worldIndex: 4,
    name: 'World 4: Void Abyss',
    description: 'Chaotic cosmic dimension harboring primordial eldritch entities.',
    backgroundTheme: 'from-purple-950/80 via-slate-900 to-slate-950 border-purple-500/40',
    dominantElement: 'CHAOS',
    bossName: 'Void Overlord Abaddon',
    bossIcon: '👁️',
    totalStages: 10,
    dropBonusList: ['+30% Void Cores', '+15% Legendary Drop Rate'],
  },
];

export const WorldMapModal: React.FC = () => {
  const { worldIndex, stageIndex, maxClearedStage, activeModal, closeModal } = useGameStore();
  const [selectedWorldIndex, setSelectedWorldIndex] = useState(worldIndex);

  if (activeModal !== 'WORLD_MAP') return null;

  const selectedWorld = WORLDS_DATA.find((w) => w.worldIndex === selectedWorldIndex) || WORLDS_DATA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 border border-cyan-500/30 p-5 shadow-2xl text-white">
        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold mb-1 border border-cyan-500/30">
            <Compass size={13} />
            <span>WORLD EXPEDITION MAP</span>
          </div>
          <h3 className="text-base font-bold text-slate-100">40 Stages & Boss Progression</h3>
          <p className="text-[10px] text-slate-400">
            Current: <strong className="text-yellow-400">World {worldIndex} - Stage {stageIndex}</strong> (Record: {maxClearedStage})
          </p>
        </div>

        {/* 4 World Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 mb-3 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {WORLDS_DATA.map((w) => {
            const isUnlocked = maxClearedStage >= (w.worldIndex - 1) * 10;
            const isSelected = selectedWorldIndex === w.worldIndex;

            return (
              <button
                key={w.worldIndex}
                onClick={() => setSelectedWorldIndex(w.worldIndex)}
                className={`py-2 px-1 rounded-lg text-center transition flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-white font-bold shadow-md'
                    : isUnlocked
                    ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-950 text-slate-600 opacity-60'
                }`}
              >
                <span className="text-base">{w.bossIcon}</span>
                <span className="text-[9px] truncate w-full">W.{w.worldIndex}</span>
              </button>
            );
          })}
        </div>

        {/* Selected World Overview Card */}
        <div className={`p-4 rounded-xl border bg-gradient-to-b ${selectedWorld.backgroundTheme} space-y-2.5 mb-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedWorld.bossIcon}</span>
              <div>
                <h4 className="font-bold text-sm text-slate-100">{selectedWorld.name}</h4>
                <span className="text-[10px] text-cyan-300 font-mono">
                  Boss: {selectedWorld.bossName}
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 font-bold text-slate-300">
              {selectedWorld.dominantElement}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            {selectedWorld.description}
          </p>

          {/* World Bonuses */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Region Drop Buffs:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedWorld.dropBonusList.map((bonus, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900/90 text-emerald-300 border border-emerald-500/30 font-medium"
                >
                  ✨ {bonus}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={closeModal}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
        >
          Return to Arena
        </button>
      </div>
    </div>
  );
};
