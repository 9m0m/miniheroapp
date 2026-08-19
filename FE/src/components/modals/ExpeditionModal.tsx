'use client';

import React, { useState, useEffect } from 'react';
import { ModalShell } from '@/components/ui/ModalShell';
import { expeditionApi } from '@/services/expeditionApi';
import { ExpeditionConfig, ExpeditionRun, ExpeditionClaimResponse } from '@/types/expedition.types';
import { useGameStore } from '@/store/useGameStore';
import { Compass, Clock, Gift, Lock, AlertCircle, CheckCircle, XCircle, Users } from 'lucide-react';

interface ExpeditionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpeditionModal: React.FC<ExpeditionModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ExpeditionConfig | null>(null);
  const [runs, setRuns] = useState<ExpeditionRun[]>([]);
  const [selectedHeroIds, setSelectedHeroIds] = useState<string[]>([]);
  const [showHeroPicker, setShowHeroPicker] = useState<boolean>(false);
  const [claimResult, setClaimResult] = useState<ExpeditionClaimResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);

  const ownedHeroesById = useGameStore((state) => state.ownedHeroesById || {});
  const fetchInitialData = useGameStore((state) => state.fetchInitialData);
  const refreshOnboarding = useGameStore((state) => state.refreshOnboarding);
  const refreshExpeditions = useGameStore((state) => state.refreshExpeditions);

  useEffect(() => {
    if (isOpen) {
      loadExpeditionData();
      setClaimResult(null);
      setError(null);
      setSelectedHeroIds([]);
      setShowHeroPicker(false);
      setShowCancelConfirm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const loadExpeditionData = async () => {
    try {
      const [cfg, activeRuns] = await Promise.all([
        expeditionApi.getConfig(),
        expeditionApi.getActiveRuns(),
      ]);
      setConfig(cfg);
      setRuns(activeRuns);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load expeditions');
    }
  };

  const clearAllDispatchKeys = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('wh_exp_dispatch_key_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {}
  };

  const getOrCreateDispatchKey = (heroIds: string[]) => {
    const payloadSig = heroIds.slice().sort().join('_');
    const storageKey = `wh_exp_dispatch_key_s0_${payloadSig}`;
    let key = sessionStorage.getItem(storageKey);
    if (!key) {
      key = `exp-dispatch-s0-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem(storageKey, key);
    }
    return { key, storageKey };
  };

  const getOrCreateClaimKey = (runId: string) => {
    const storageKey = `wh_exp_claim_key_${runId}`;
    let key = sessionStorage.getItem(storageKey);
    if (!key) {
      key = `exp-claim-${runId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem(storageKey, key);
    }
    return { key, storageKey };
  };

  const handleDispatch = async () => {
    if (selectedHeroIds.length === 0) {
      setError('Please select at least 1 hero for expedition');
      return;
    }
    setError(null);
    const { key: idempotencyKey, storageKey } = getOrCreateDispatchKey(selectedHeroIds);
    try {
      await expeditionApi.dispatch({
        slotIndex: 0,
        heroIds: selectedHeroIds,
        idempotencyKey,
      });
      clearAllDispatchKeys();
      setShowHeroPicker(false);
      setSelectedHeroIds([]);
      await loadExpeditionData();
      await Promise.all([fetchInitialData(), refreshOnboarding(), refreshExpeditions()]);
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      if (status === 409 || status === 400 || status === 401 || status === 403) {
        clearAllDispatchKeys();
        await loadExpeditionData();
        await refreshExpeditions();
      }
      setError(err?.response?.data?.message || 'Failed to dispatch expedition');
    }
  };

  const handleClaim = async (runId: string) => {
    setError(null);
    const { key: idempotencyKey, storageKey } = getOrCreateClaimKey(runId);
    try {
      const result = await expeditionApi.claim(runId, idempotencyKey);
      sessionStorage.removeItem(storageKey);
      clearAllDispatchKeys();
      setClaimResult(result);
      await loadExpeditionData();
      await Promise.all([fetchInitialData(), refreshOnboarding(), refreshExpeditions()]);
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      if (status === 409) {
        sessionStorage.removeItem(storageKey);
        clearAllDispatchKeys();
        await loadExpeditionData();
        await refreshExpeditions();
      }
      setError(err?.response?.data?.message || 'Failed to claim expedition');
    }
  };

  const handleCancel = async (runId: string) => {
    setError(null);
    try {
      await expeditionApi.cancel(runId);
      sessionStorage.removeItem(`wh_exp_claim_key_${runId}`);
      clearAllDispatchKeys();
      setShowCancelConfirm(false);
      await loadExpeditionData();
      await Promise.all([fetchInitialData(), refreshOnboarding(), refreshExpeditions()]);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to cancel expedition');
    }
  };

  const activeRun = runs.find((r) => r.slotIndex === 0 && r.status === 'RUNNING');
  const heroesList = Object.values(ownedHeroesById);

  const getRemainingSeconds = (completesAtStr: string) => {
    const end = new Date(completesAtStr).getTime();
    const diff = Math.max(0, Math.floor((end - now) / 1000));
    return diff;
  };

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const toggleHeroSelection = (heroId: string) => {
    if (selectedHeroIds.includes(heroId)) {
      setSelectedHeroIds(selectedHeroIds.filter((id) => id !== heroId));
    } else {
      if (selectedHeroIds.length >= 3) return;
      setSelectedHeroIds([...selectedHeroIds, heroId]);
    }
  };

  const activeDuration = activeRun
    ? activeRun.durationSeconds || (activeRun.isTutorial ? 10 : 28800)
    : 10;
  const activeRemaining = activeRun ? getRemainingSeconds(activeRun.completesAt) : 0;
  const progressPct = activeRun
    ? Math.min(100, Math.max(0, ((activeDuration - activeRemaining) / activeDuration) * 100))
    : 0;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Expedition Dispatch" maxWidth="lg">
      <div className="flex flex-col gap-4 p-2 text-slate-100">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Claim Result Banner */}
        {claimResult && (
          <div className="p-4 bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-xl text-center flex flex-col items-center gap-2">
            <CheckCircle className="w-6 h-6 text-amber-400" />
            <h4 className="text-sm font-bold text-amber-200">Expedition Successfully Completed!</h4>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-300 font-semibold my-1">
              <span>🪙 +{(claimResult.rewardsGranted as any)?.gold || 0} Gold</span>
              <span>🧪 +{(claimResult.rewardsGranted as any)?.essence || 0} Essence</span>
              <span>💎 +{(claimResult.rewardsGranted as any)?.enhanceStones || (claimResult.rewardsGranted as any)?.stones || 0} Stones</span>
              {((claimResult.rewardsGranted as any)?.standardSummonTickets > 0 || (claimResult.rewardsGranted as any)?.tickets > 0) && (
                <span className="text-amber-400">🎫 +{(claimResult.rewardsGranted as any).standardSummonTickets || (claimResult.rewardsGranted as any).tickets} Ticket</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Dispatched heroes are now unlocked and ready for battle.</p>
            <button
              type="button"
              onClick={async () => {
                setClaimResult(null);
                const store = useGameStore.getState();
                await store.refreshOnboarding?.();
                await store.fetchInitialData?.();
                const latestStep = useGameStore.getState().onboardingState?.step;
                if (latestStep === 'THIRD_SUMMON_REQUIRED' || latestStep === 'COMPLETE') {
                  onClose();
                }
              }}
              data-tutorial-target="expedition-done-btn"
              className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs min-h-[44px] cursor-pointer mt-1 shadow-md focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Done & Collect Ticket
            </button>
          </div>
        )}

        {/* Slot 0: Free Slot */}
        <div className="flex flex-col gap-2 p-3.5 bg-slate-900 border border-slate-700 rounded-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Slot 0 — Exploration Patrol</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-semibold">
              Free Slot
            </span>
          </div>

          {/* Running State */}
          {activeRun ? (
            <div className="flex flex-col gap-2.5 mt-2 p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Time Remaining:
                </span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {formatCountdown(activeRemaining)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-[width] duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Heroes Dispatched: {activeRun.heroIds?.length || 0}</span>
                {activeRun.isTutorial && (
                  <span className="text-amber-300 font-semibold">Tutorial Run (10s)</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-1">
                {activeRemaining === 0 ? (
                  <button
                    type="button"
                    onClick={() => handleClaim(activeRun.id)}
                    data-tutorial-target="expedition-claim-btn"
                    className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs min-h-[44px] cursor-pointer flex items-center justify-center gap-1.5 shadow focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <Gift className="w-4 h-4" />
                    Claim Rewards
                  </button>
                ) : showCancelConfirm ? (
                  <div className="flex flex-col gap-2 p-2.5 bg-red-950/80 border border-red-700 rounded-lg text-center">
                    <span className="text-xs text-red-200 font-semibold">Cancel expedition? Heroes return with 0 rewards.</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCancel(activeRun.id)}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded min-h-[38px] cursor-pointer"
                      >
                        Confirm Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded min-h-[38px] cursor-pointer"
                      >
                        Keep Patrol
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full py-2 px-3 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-semibold rounded-lg text-xs min-h-[44px] cursor-pointer flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel (0 Rewards)
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Idle State */
            <div className="flex flex-col gap-2 mt-1">
              <p className="text-xs text-slate-400">
                Dispatch 1–3 heroes on patrol. Dispatched heroes cannot level-up, equip gear, or fight in Tower until return.
              </p>

              {!showHeroPicker ? (
                <button
                  type="button"
                  onClick={() => setShowHeroPicker(true)}
                  data-tutorial-target="expedition-select-heroes"
                  className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs min-h-[44px] cursor-pointer flex items-center justify-center gap-2 mt-1 shadow focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <Users className="w-4 h-4" />
                  Select Heroes to Dispatch
                </button>
              ) : (
                /* Hero Picker inside Slot */
                <div className="flex flex-col gap-2 p-3 bg-slate-950 border border-cyan-800/60 rounded-lg">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-cyan-300">Choose 1–3 Idle Heroes ({selectedHeroIds.length}/3)</span>
                    <button
                      type="button"
                      onClick={() => setShowHeroPicker(false)}
                      className="text-slate-400 hover:text-slate-200 text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
                    {heroesList.map((hero: any) => {
                      const isSelected = selectedHeroIds.includes(hero.id);
                      const isBusy = hero.busyStatus === 'EXPEDITION_BUSY';

                      return (
                        <button
                          key={hero.id}
                          type="button"
                          disabled={isBusy}
                          onClick={() => toggleHeroSelection(hero.id)}
                          data-tutorial-target={`hero-pick-${hero.templateId || hero.id}`}
                          className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 text-xs transition-[background-color,border-color] cursor-pointer ${
                            isBusy
                              ? 'bg-slate-900/40 border-slate-800 opacity-40 cursor-not-allowed'
                              : isSelected
                              ? 'bg-cyan-950/80 border-cyan-400 ring-1 ring-cyan-400'
                              : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <span className="font-semibold text-slate-200 truncate">{hero.name || hero.heroClass || hero.id.substring(0, 6)}</span>
                          <span className="text-[10px] text-slate-400">Lv.{hero.level} ★{hero.stars || 1}</span>
                          {isBusy && <span className="text-[9px] text-red-400 font-bold">BUSY</span>}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={selectedHeroIds.length === 0}
                    onClick={handleDispatch}
                    data-tutorial-target="expedition-confirm-btn"
                    className={`py-2.5 px-4 rounded-lg font-bold text-xs min-h-[44px] cursor-pointer mt-1 focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      selectedHeroIds.length > 0
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Confirm Dispatch ({selectedHeroIds.length} Heroes)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Slot 1 & 2: Paid Slots Locked */}
        <div className="grid grid-cols-2 gap-2.5 opacity-60">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col gap-1 items-center text-center">
            <Lock className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-400">Slot 1</span>
            <span className="text-[10px] text-slate-500">Paid Slots Disabled</span>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col gap-1 items-center text-center">
            <Lock className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-400">Slot 2</span>
            <span className="text-[10px] text-slate-500">Paid Slots Disabled</span>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
