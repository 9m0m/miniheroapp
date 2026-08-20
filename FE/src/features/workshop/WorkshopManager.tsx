'use client';

import React, { useState } from 'react';
import BlacksmithManager from '../blacksmith/BlacksmithManager';
import CubeManager from '../cube/CubeManager';
import AlchemyManager from '../alchemy/AlchemyManager';
import { Anvil, Box, Trash2 } from 'lucide-react';

export type WorkshopSubTab = 'BLACKSMITH' | 'CUBE' | 'ALCHEMY';

const SUB_TABS = [
  {
    id: 'BLACKSMITH' as WorkshopSubTab,
    label: 'Forge',
    subLabel: 'Craft & Enhance',
    icon: Anvil,
  },
  {
    id: 'CUBE' as WorkshopSubTab,
    label: 'The Cube',
    subLabel: 'Fusion Matrix',
    icon: Box,
  },
  {
    id: 'ALCHEMY' as WorkshopSubTab,
    label: 'Dismantle',
    subLabel: 'Scrap & Sell',
    icon: Trash2,
  },
];

export default function WorkshopManager() {
  const [activeSubTab, setActiveSubTab] = useState<WorkshopSubTab>('BLACKSMITH');

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#06080e] select-none">
      {/* Workshop Master Sub-Tab Switcher */}
      <div className="p-3 pb-1.5 bg-[#0a0e17] border-b border-[#1e293b] shrink-0 shadow-sm">
        <div
          role="tablist"
          aria-label="Workshop disciplines"
          className="grid grid-cols-3 gap-1.5 bg-[#06080e] p-1 rounded-lg border border-[#1e293b] shadow-inner"
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
                className={`py-2 px-1 rounded-md text-center flex flex-col items-center justify-center gap-0.5 transition-all min-h-[44px] cursor-pointer ${
                  isSelected
                    ? 'btn-game-amber shadow-sm font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0e131d]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={14} className={isSelected ? 'text-slate-950' : 'text-slate-300'} aria-hidden="true" />
                  <span className="text-xs font-bold">{tab.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono leading-none ${
                    isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'
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
