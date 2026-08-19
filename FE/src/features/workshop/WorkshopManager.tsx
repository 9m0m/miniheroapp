'use client';

import React, { useState } from 'react';
import BlacksmithManager from '../blacksmith/BlacksmithManager';
import CubeManager from '../cube/CubeManager';
import AlchemyManager from '../alchemy/AlchemyManager';
import { Anvil, Box, FlaskConical } from 'lucide-react';

export type WorkshopSubTab = 'BLACKSMITH' | 'CUBE' | 'ALCHEMY';

const SUB_TABS = [
  {
    id: 'BLACKSMITH' as WorkshopSubTab,
    label: 'Forge',
    subLabel: 'Craft & Socket',
    icon: Anvil,
  },
  {
    id: 'CUBE' as WorkshopSubTab,
    label: 'The Cube',
    subLabel: 'Fusion & Gems',
    icon: Box,
  },
  {
    id: 'ALCHEMY' as WorkshopSubTab,
    label: 'Alchemy',
    subLabel: 'Potions & Blessings',
    icon: FlaskConical,
  },
];

export default function WorkshopManager() {
  const [activeSubTab, setActiveSubTab] = useState<WorkshopSubTab>('BLACKSMITH');

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-slate-950">
      {/* Workshop Master Sub-Tab Switcher */}
      <div className="p-3 pb-1 bg-slate-900 border-b border-slate-800">
        <div
          role="tablist"
          aria-label="Workshop disciplines"
          className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800"
        >
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeSubTab === tab.id;

            return (
              <button
                type="button"
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveSubTab(tab.id)}
                className={`py-2 px-1 rounded-lg text-center flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px] ${
                  isSelected
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={14} className={isSelected ? 'text-black' : 'text-slate-300'} aria-hidden="true" />
                  <span className="text-xs font-bold">{tab.label}</span>
                </div>
                <span
                  className={`text-xs font-medium leading-none ${
                    isSelected ? 'text-black/80' : 'text-slate-500'
                  }`}
                >
                  {tab.subLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Workshop Sub-Tab View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeSubTab === 'BLACKSMITH' && <BlacksmithManager />}
        {activeSubTab === 'CUBE' && <CubeManager />}
        {activeSubTab === 'ALCHEMY' && <AlchemyManager />}
      </div>
    </div>
  );
}
