'use client';

import React, { useState, useEffect } from 'react';
import TopHUD from '@/components/layout/TopHUD';
import BottomNav from '@/components/layout/BottomNav';
import {
  TabType,
  resolveNavigationConfig,
  normalizeTab,
} from '@/config/navigationConfig';
import PartyManager from '@/features/party/PartyManager';
import InventoryManager from '@/features/inventory/InventoryManager';
import WorkshopManager from '@/features/workshop/WorkshopManager';
import { TowerManager } from '@/features/tower/TowerManager';
import { SkyIslandHub } from '@/features/hub/SkyIslandHub';
import { PiggyBankModal } from '@/components/modals/PiggyBankModal';
import { AwakeningPassModal } from '@/components/modals/AwakeningPassModal';
import { MockWldPaymentSheet } from '@/components/modals/MockWldPaymentSheet';
import { EnhanceModal } from '@/components/modals/EnhanceModal';
import { QuestsModal } from '@/components/modals/QuestsModal';
import { TrialArenaModal } from '@/components/modals/TrialArenaModal';
import { PartyFormationModal } from '@/components/modals/PartyFormationModal';
import { ChestRewardModal } from '@/components/modals/ChestRewardModal';
import { ChestVaultSheet } from '@/components/modals/ChestVaultSheet';
import { RecruitmentModal } from '@/components/modals/RecruitmentModal';
import { ExpeditionModal } from '@/components/modals/ExpeditionModal';
import { TutorialSpotlightOverlay } from '@/components/tutorial/TutorialSpotlightOverlay';
import { GameLoadingScreen } from '@/components/layout/GameLoadingScreen';
import { useGameStore } from '@/store/useGameStore';
import { assetManager } from '@/engine/AssetManager';

import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function GameMainPage() {
  const featureFlags  = useGameStore((state) => state.featureFlags);
  const navConfig     = resolveNavigationConfig(featureFlags);
  const { mode }      = navConfig;

  const isTowerV2Enabled = featureFlags?.towerV2Enabled !== false;

  const [activeTab, setActiveTab]         = useState<TabType>(navConfig.defaultTab);
  const [isViewingTower, setIsViewingTower] = useState<boolean>(false);

  const activeModal      = useGameStore((state) => state.activeModal);
  const closeModal       = useGameStore((state) => state.closeModal);
  const openModal        = useGameStore((state) => state.openModal);
  const fetchInitialData = useGameStore((state) => state.fetchInitialData);
  const sessionStatus    = useGameStore((state) => state.sessionStatus);

  useEffect(() => {
    assetManager.init();
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (!isTowerV2Enabled && isViewingTower) setIsViewingTower(false);
  }, [isTowerV2Enabled, isViewingTower]);

  const handleTabChange = (tab: TabType) => {
    const nextTab = normalizeTab(tab, navConfig);
    setActiveTab(nextTab);
    if (nextTab !== 'TOWN') setIsViewingTower(false);
  };

  // ── 1. Initial bootstrapping / game loading ──────────────────────────────
  if (sessionStatus === 'bootstrapping' || sessionStatus === 'idle') {
    return <GameLoadingScreen message="Connecting to Sky Sanctuary…" />;
  }

  // ── 2. Neither flag is strictly true → service unavailable ────────────────
  if (mode === 'unavailable') {
    return (
      <div className="flex justify-center min-h-screen min-h-[100dvh] bg-[#07090E] pt-[env(safe-area-inset-top)]">
        <main className="w-full max-w-md bg-game-dark border-x border-game-border flex flex-col items-center justify-center p-6 text-center h-screen h-[100dvh] max-h-[100dvh]">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-base font-bold text-slate-100 mb-1">Game Service Unavailable</h1>
          <p className="text-xs text-slate-400 mb-6 max-w-xs leading-relaxed">
            The game servers are currently undergoing maintenance or feature configurations are inactive.
          </p>
          <button
            type="button"
            onClick={() => fetchInitialData()}
            className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer shadow transition-[background-color,transform]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </main>
      </div>
    );
  }

  const normalizedActiveTab = normalizeTab(activeTab, navConfig);

  const renderPrimaryPanel = () => {
    if (isViewingTower && isTowerV2Enabled) {
      return <TowerManager onClose={() => setIsViewingTower(false)} />;
    }
    return (
      <SkyIslandHub
        isTowerV2Enabled={isTowerV2Enabled}
        onOpenTower={() => { if (isTowerV2Enabled) setIsViewingTower(true); }}
        onOpenRecruitment={() => openModal('RECRUITMENT' as any)}
        onOpenExpedition={() => openModal('EXPEDITION' as any)}
        onOpenWorkshop={() => handleTabChange('WORKSHOP')}
        onOpenQuests={() => openModal('QUESTS' as any)}
        onOpenArena={() => openModal('TRIAL_ARENA' as any)}
        onOpenHeroes={() => handleTabChange('HEROES')}
      />
    );
  };

  return (
    <div className="flex justify-center min-h-screen min-h-[100dvh] bg-[#07090E] pt-[env(safe-area-inset-top)]">
      <main
        id="game-main-container"
        className="w-full max-w-md bg-game-dark border-x border-game-border flex flex-col h-screen h-[100dvh] max-h-[100dvh] relative shadow-2xl overflow-hidden"
      >
        {/* Auth Required Recovery Screen */}
        {sessionStatus === 'auth_required' && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-100 mb-2">Authentication Required</h2>
            <p className="text-xs text-slate-400 mb-6 max-w-xs leading-relaxed">
              Your session has expired. Please verify with World ID to securely authenticate and continue playing.
            </p>
            <button
              type="button"
              onClick={() => fetchInitialData()}
              className="py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg active:scale-95 transition-[background-color,transform] cursor-pointer"
            >
              Verify with World ID
            </button>
          </div>
        )}

        {/* 1. Top HUD Bar */}
        <TopHUD />

        {/* 2. Dynamic View by Active Tab */}
        <div
          role="tabpanel"
          id={`panel-${normalizedActiveTab.toLowerCase()}`}
          aria-labelledby={`tab-${normalizedActiveTab.toLowerCase()}`}
          className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-game-dark"
        >
          {/* Primary Core v2 Sanctuary surface */}
          {normalizedActiveTab === 'TOWN' && renderPrimaryPanel()}

          {/* Core v2 hero roster */}
          {normalizedActiveTab === 'HEROES' && <PartyManager />}

          {/* Inventory Tab */}
          {normalizedActiveTab === 'INVENTORY' && <InventoryManager />}

          {/* Workshop Tab */}
          {normalizedActiveTab === 'WORKSHOP' && <WorkshopManager />}
        </div>

        {/* 3. Tutorial Spotlight Overlay */}
        <TutorialSpotlightOverlay />

        {/* 4. Accessible Bottom Navigation Bar */}
        <BottomNav activeTab={normalizedActiveTab} onSelectTab={handleTabChange} />

        {/* 5. Modals & Sheets */}
        <RecruitmentModal
          isOpen={activeModal === 'RECRUITMENT'}
          onClose={closeModal}
        />
        <ExpeditionModal
          isOpen={activeModal === 'EXPEDITION'}
          onClose={closeModal}
        />
        <QuestsModal
          isOpen={activeModal === 'QUESTS'}
          onClose={closeModal}
        />
        <TrialArenaModal
          isOpen={activeModal === 'TRIAL_ARENA'}
          onClose={closeModal}
        />
        <ChestVaultSheet
          isOpen={activeModal === 'CHEST_VAULT'}
          onClose={closeModal}
        />
        <PiggyBankModal />
        <AwakeningPassModal />
        <MockWldPaymentSheet />
        <EnhanceModal />
        <PartyFormationModal />
        <ChestRewardModal />
      </main>
    </div>
  );
}
