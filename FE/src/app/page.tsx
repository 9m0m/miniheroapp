'use client';

import React, { useState, useEffect } from 'react';
import TopHUD from '@/components/layout/TopHUD';
import BottomNav, { TabType } from '@/components/layout/BottomNav';
import BattleCanvas from '@/features/battle/BattleCanvas';
import BattleDashboard from '@/features/battle/BattleDashboard';
import PartyManager from '@/features/party/PartyManager';
import CubeManager from '@/features/cube/CubeManager';
import AlchemyManager from '@/features/alchemy/AlchemyManager';
import BlacksmithManager from '@/features/blacksmith/BlacksmithManager';
import { PiggyBankModal } from '@/components/modals/PiggyBankModal';
import { AwakeningPassModal } from '@/components/modals/AwakeningPassModal';
import { GrowthFundModal } from '@/components/modals/GrowthFundModal';
import { MockWldPaymentSheet } from '@/components/modals/MockWldPaymentSheet';
import { EnhanceModal } from '@/components/modals/EnhanceModal';
import { SkillTreeModal } from '@/components/modals/SkillTreeModal';
import { WorldMapModal } from '@/components/modals/WorldMapModal';
import { BattleLogModal } from '@/components/modals/BattleLogModal';
import { QuestsModal } from '@/components/modals/QuestsModal';
import { TrialArenaModal } from '@/components/modals/TrialArenaModal';
import { useGameStore } from '@/store/useGameStore';

export default function GameMainPage() {
  const [activeTab, setActiveTab] = useState<TabType>('PARTY');
  const { activeModal, closeModal, fetchInitialData } = useGameStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <div className="flex justify-center min-h-screen bg-[#07090E]">
      <main className="w-full max-w-md bg-game-dark border-x border-game-border flex flex-col h-screen relative shadow-2xl overflow-hidden select-none">
        {/* 1. Top HUD Bar (Currencies, Stage Progress & Earning Hooks) */}
        <TopHUD />

        {/* 2. 2D Game Battle Canvas (Always Live 60FPS) */}
        <BattleCanvas />

        {/* 3. Dynamic Management View by Active Tab */}
        <div className="flex-1 flex flex-col overflow-hidden bg-game-dark">
          {activeTab === 'BATTLE' && <BattleDashboard />}
          {activeTab === 'PARTY' && <PartyManager />}
          {activeTab === 'CUBE' && <CubeManager />}
          {activeTab === 'ALCHEMY' && <AlchemyManager />}
          {activeTab === 'BLACKSMITH' && <BlacksmithManager />}
        </div>

        {/* 4. Bottom Navigation Bar */}
        <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* 5. Modals & Sheets */}
        {activeModal === 'PIGGY_BANK' && <PiggyBankModal />}
        {activeModal === 'AWAKENING_PASS' && <AwakeningPassModal />}
        {activeModal === 'GROWTH_FUND' && <GrowthFundModal />}
        {activeModal === 'MOCK_WLD_PAY' && <MockWldPaymentSheet />}
        {activeModal === 'ENHANCE' && <EnhanceModal />}
        {activeModal === 'SKILL_TREE' && <SkillTreeModal />}
        {activeModal === 'WORLD_MAP' && <WorldMapModal />}
        {activeModal === 'BATTLE_LOGS' && <BattleLogModal />}
        <QuestsModal isOpen={activeModal === 'QUESTS'} onClose={closeModal} />
        <TrialArenaModal isOpen={activeModal === 'TRIAL_ARENA'} onClose={closeModal} />
      </main>
    </div>
  );
}
