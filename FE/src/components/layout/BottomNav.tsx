'use client';

import React from 'react';
import { Swords, Users, Box, FlaskConical, Anvil } from 'lucide-react';

export type TabType = 'BATTLE' | 'PARTY' | 'CUBE' | 'ALCHEMY' | 'BLACKSMITH';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  const tabs = [
    { id: 'BATTLE' as TabType, label: 'Battle', icon: Swords },
    { id: 'PARTY' as TabType, label: 'Heroes', icon: Users },
    { id: 'CUBE' as TabType, label: 'The Cube', icon: Box },
    { id: 'ALCHEMY' as TabType, label: 'Alchemy', icon: FlaskConical },
    { id: 'BLACKSMITH' as TabType, label: 'Blacksmith', icon: Anvil },
  ];

  return (
    <nav className="bg-game-card border-t border-game-border py-1.5 px-2 flex justify-around items-center z-20 select-none shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-all ${
              isActive
                ? 'text-yellow-400 bg-yellow-400/10 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200 active:scale-95'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-yellow-400' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
