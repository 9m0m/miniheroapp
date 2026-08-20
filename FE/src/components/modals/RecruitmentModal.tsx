'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ModalShell } from '@/components/ui/ModalShell';
import { recruitmentApi } from '@/services/recruitmentApi';
import { RecruitmentBanner, RecruitmentPullResponse } from '@/types/recruitment.types';
import { useGameStore } from '@/store/useGameStore';
import { TOWER_HERO_SPRITES, ROLE_COLOR_CONFIG } from '@/engine/tower/TowerSpriteManifest';
import { HeroRole } from '@/domain/heroes/hero.types';
import { Sparkles, Ticket, ShieldAlert, History, ArrowRight, Star } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface RecruitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Mirrors SummonHistoryDto from the backend; no `any` leakage. */
interface SummonHistoryItem {
  id: string;
  heroTemplateId: string;
  heroName: string;
  role: string;
  stars: number;
  isDuplicate: boolean;
  shardsGranted: number;
  ticketType: string;
  createdAt: string;
}

// ── Idempotency helpers ──────────────────────────────────────────────────────
const SESSION_KEY = 'pendingPullKey';

function storePendingKey(key: string) {
  try { sessionStorage.setItem(SESSION_KEY, key); } catch { /* ignore */ }
}
function clearPendingKey() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}
function getPendingKey(): string | null {
  try { return sessionStorage.getItem(SESSION_KEY); } catch { return null; }
}

// ── Component ────────────────────────────────────────────────────────────────
export const RecruitmentModal: React.FC<RecruitmentModalProps> = ({ isOpen, onClose }) => {
  const [banners, setBanners]         = useState<RecruitmentBanner[]>([]);
  const [pulling, setPulling]         = useState<boolean>(false);
  const [lastPull, setLastPull]       = useState<RecruitmentPullResponse | null>(null);
  const [history, setHistory]         = useState<SummonHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [error, setError]             = useState<string | null>(null);

  const [canContinue, setCanContinue]   = useState(false);

  const openModal        = useGameStore((state) => state.openModal);
  const onboardingState  = useGameStore((state) => state.onboardingState);

  const ticketBalance = onboardingState?.standardSummonTickets ?? 0;
  const currentStep   = onboardingState?.step;
  const isExpeditionNext = currentStep === 'FIRST_EXPEDITION_REQUIRED' || currentStep === 'FIRST_EXPEDITION_RUNNING';

  // In-memory guard — sessionStorage is the durable source of truth.
  const inFlightKeyRef = useRef<string | null>(null);
  const inFlightPullPromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBanners();
      loadHistory();
      setLastPull(null);
      setCanContinue(false);
      setError(null);
      inFlightKeyRef.current = getPendingKey();
    }
  }, [isOpen]);

  useEffect(() => {
    if (lastPull && !pulling) {
      setCanContinue(false);
      const timer = setTimeout(() => {
        setCanContinue(true);
      }, 2200); // 2.2s champion showcase before revealing Continue button & tutorial lock
      return () => clearTimeout(timer);
    } else {
      setCanContinue(false);
    }
  }, [lastPull, pulling]);

  const loadBanners = async () => {
    try {
      const data = await recruitmentApi.getBanners();
      setBanners(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load recruitment banners');
    }
  };

  const loadHistory = async () => {
    try {
      const data = await recruitmentApi.getHistory();
      setHistory(Array.isArray(data) ? (data as SummonHistoryItem[]) : []);
    } catch {
      // Non-blocking
    }
  };

  const handlePull = async (bannerId: string) => {
    if (pulling) return;
    if (ticketBalance < 1) {
      setError('You do not have enough Summon Tickets.');
      return;
    }
    setPulling(true);
    setError(null);

    // Reuse any key already in sessionStorage (crash-recovery path) or create a new one.
    if (!inFlightKeyRef.current) {
      const newKey = `pull-${bannerId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      inFlightKeyRef.current = newKey;
      storePendingKey(newKey);
    }
    const idempotencyKey = inFlightKeyRef.current;

    const pullPromise = Promise.all([
      recruitmentApi.pull({ bannerId, ticketType: 'STANDARD_TICKET', idempotencyKey }),
      new Promise((resolve) => setTimeout(resolve, 1400)), // Cinematic Celestial Gate reveal duration
    ]);
    inFlightPullPromiseRef.current = pullPromise;

    try {
      const [result] = await pullPromise;

      // Authoritative success → clear key
      clearPendingKey();
      inFlightKeyRef.current = null;

      setLastPull(result);
      loadBanners();
      loadHistory();
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.message;

      if (status === 400 || status === 403 || status === 404) {
        clearPendingKey();
        inFlightKeyRef.current = null;
        setError(serverMsg || 'Not enough Standard Summon Tickets.');
      } else if (status === 409) {
        clearPendingKey();
        inFlightKeyRef.current = null;
        setError('Summon already processed. Refreshing your roster…');
        loadBanners();
        loadHistory();
      } else {
        setError(serverMsg || 'Network error. Tap Summon to retry.');
      }
    } finally {
      inFlightPullPromiseRef.current = null;
      setPulling(false);
    }
  };

  const banner = banners.find((b) => b.bannerId === 'STANDARD' || b.bannerId === 'banner-standard') || banners[0];

  const handleDismissResult = async () => {
    if (!canContinue) return;

    // Refresh store state first
    const store = useGameStore.getState();
    await Promise.all([
      store.refreshOnboarding?.(),
      store.fetchInitialData?.(),
    ]);

    const latestStep = useGameStore.getState().onboardingState?.step;
    const latestTickets = useGameStore.getState().onboardingState?.standardSummonTickets ?? 0;

    const shouldCloseModal =
      currentStep === 'SUMMON_RANGER_REQUIRED' ||
      currentStep === 'THIRD_SUMMON_REQUIRED' ||
      latestStep === 'FIRST_EXPEDITION_REQUIRED' ||
      latestStep === 'COMPLETE' ||
      latestTickets <= 0;

    if (shouldCloseModal) {
      onClose();
      setLastPull(null);
      setCanContinue(false);
      return;
    }

    setLastPull(null);
    setCanContinue(false);
    await loadBanners();
    await loadHistory();
  };

  const handleModalClose = async () => {
    // If a pull request is currently in-flight, await completion so server state commits before syncing
    if (inFlightPullPromiseRef.current) {
      await inFlightPullPromiseRef.current.catch(() => null);
    }
    const store = useGameStore.getState();
    await Promise.all([
      store.refreshOnboarding?.(),
      store.fetchInitialData?.(),
    ]);
    setLastPull(null);
    setCanContinue(false);
    onClose();
  };

  const handleGoToExpedition = () => {
    onClose();
    openModal('EXPEDITION' as any);
  };

  // Helper for clean result presentation
  const isNewChampion = lastPull ? Boolean(lastPull.isNew ?? (lastPull as any).new ?? (lastPull.shardsGranted === 0)) : true;
  const spriteConfig = lastPull ? TOWER_HERO_SPRITES[lastPull.heroTemplateId] : null;
  const roleConfig = lastPull && lastPull.role && (lastPull.role as string) in ROLE_COLOR_CONFIG ? ROLE_COLOR_CONFIG[lastPull.role as HeroRole] : null;
  const championSubtitle = lastPull
    ? lastPull.title
      ? `${lastPull.role} · ${lastPull.title}`
      : lastPull.heroTemplateId === 'hero.knight'
      ? 'TANK · Aegis Guardian'
      : lastPull.heroTemplateId === 'hero.ranger'
      ? 'MARKSMAN · Falcon Marksman'
      : `${lastPull.role} · ★ 1 Champion`
    : '';

  return (
    <ModalShell isOpen={isOpen} onClose={handleModalClose} title="Altar of Heroes" maxWidth="lg">
      <div className="flex flex-col gap-3 p-1 text-slate-100 select-none">
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-md text-red-200 text-xs animate-fade-in text-center font-semibold flex items-center justify-center gap-2">
            <ShieldAlert size={14} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── 1. Main Banner Card ─────────────────────────────────────── */}
        {banner && !lastPull && !pulling && !showHistory && (
          <div className="flex flex-col gap-3 p-3.5 bg-gradient-to-b from-[#1b150c] via-[#101623] to-[#0d121c] border border-amber-500/40 rounded-lg relative overflow-hidden shadow-lg">
            {/* Header with Title and Ticket Counter */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="text-sm font-black tracking-tight text-amber-200">{banner.name}</h3>
              </div>
              <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 border ${
                ticketBalance > 0
                  ? 'bg-amber-500/15 border-amber-400/50 text-amber-300 shadow-inner'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}>
                <Ticket size={12} className={ticketBalance > 0 ? 'text-amber-400' : 'text-slate-500'} />
                <span className="font-mono">{ticketBalance} Available</span>
              </div>
            </div>

            {/* Banner Artwork & Summoning Chamber Frame */}
            <div className="w-full h-32 bg-[#06080e] rounded-md border border-[#1e293b] flex flex-col items-center justify-center p-3 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px] opacity-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06080e] via-transparent to-transparent z-10" />
              <div className="relative z-20 flex flex-col items-center">
                <span className="text-xs font-black text-slate-100 tracking-wider uppercase">
                  Celestial Operative Summon
                </span>
                <span className="text-[11px] text-slate-400 mt-1 max-w-[220px] leading-relaxed">
                  18 Launch Champions · Fair Duplicate Protection (1 Shard per Dupe)
                </span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col gap-2 pt-0.5">
              {ticketBalance > 0 ? (
                /* Primary Active CTA */
                <button
                  type="button"
                  onClick={() => handlePull(banner.bannerId)}
                  disabled={pulling}
                  data-tutorial-target="summon-btn"
                  className="w-full py-3 px-4 btn-game-amber text-xs font-black uppercase tracking-wider rounded-md flex items-center justify-center gap-2 min-h-[44px] cursor-pointer active:scale-95 shadow-md"
                >
                  <Sparkles size={14} className="text-slate-950" />
                  <span>{pulling ? 'Summoning…' : 'Summon Champion (1 Ticket)'}</span>
                </button>
              ) : isExpeditionNext ? (
                /* Guided CTA when user needs to run Expedition for ticket 3 */
                <div className="flex flex-col gap-2 p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-md text-center">
                  <div className="text-xs text-cyan-300 font-bold">
                    Next Mission: Dispatch Heroes on Patrol for 3rd Ticket
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Dispatch your 2 recruited champions on patrol to claim your final starter ticket!
                  </p>
                  <button
                    type="button"
                    onClick={handleGoToExpedition}
                    className="w-full py-2.5 px-4 btn-game-cyan font-black uppercase tracking-wider rounded-md text-xs min-h-[42px] cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <span>Launch Expedition</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                /* Standard Out-of-Tickets Disabled State */
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 px-4 rounded-md font-bold text-xs flex items-center justify-center bg-[#111724] border border-[#1e293b] text-slate-500 cursor-not-allowed opacity-50 min-h-[44px]"
                  >
                    <span>No Summon Tickets Available</span>
                  </button>
                  <span className="text-[10px] text-slate-400 text-center font-mono">
                    Earn tickets via Expeditions, Tower Floors, and Quest Milestones.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 2. Summoning In-Flight Celestial Gate Animation ─────────── */}
        {pulling && (
          <div className="flex flex-col items-center justify-center gap-4 p-8 bg-[#0a0e17] border border-amber-500/40 rounded-lg text-center shadow-2xl animate-fade-in my-2">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/50 bg-amber-500/10 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.25)]" />
              <div className="w-10 h-10 rounded-full bg-[#101623] border border-amber-400/80 flex items-center justify-center shadow-inner">
                <Sparkles size={18} className="text-amber-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-300">Opening Celestial Gate…</h4>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">Channeling Astral Energy</p>
            </div>
          </div>
        )}

        {/* ─── 3. Pull Result Card (Champion Showcase) ─────────────────── */}
        {lastPull && !pulling && (
          <div
            data-tutorial-target="summon-result-showcase"
            className="flex flex-col items-center gap-3 p-4 bg-gradient-to-b from-[#1b150c] via-[#101623] to-[#0a0e17] border-2 border-amber-400/60 rounded-lg text-center shadow-2xl animate-fade-in"
          >
            <div className="text-[10px] font-black text-amber-300 uppercase tracking-widest px-3 py-0.5 bg-amber-500/15 border border-amber-400/40 rounded-full shadow-sm">
              {!isNewChampion ? 'Duplicate Converted' : 'New Champion Recruited!'}
            </div>

            {/* Hero Emblem & Vector Avatar */}
            <div className="relative my-1">
              <div className="w-20 h-20 rounded-lg bg-[#080b12] border-2 border-amber-400/70 flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.25)] overflow-hidden">
                {spriteConfig?.imageSrc ? (
                  <img
                    src={spriteConfig.imageSrc}
                    alt={lastPull.heroName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black">{roleConfig?.icon}</span>
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow uppercase">
                ★ 1-Star Champion
              </div>
            </div>

            <div className="mt-1">
              <h3 className="text-base font-black text-slate-100">{lastPull.heroName}</h3>
              <div
                className={`text-[10px] font-black uppercase tracking-wider ${roleConfig?.text} mt-0.5`}
              >
                {championSubtitle}
              </div>
            </div>

            {!isNewChampion ? (
              <div className="p-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-md text-xs text-slate-300 w-full flex flex-col gap-0.5">
                <span className="font-bold text-cyan-400">Shards Transferred</span>
                <span className="text-[11px] text-slate-400">
                  +{lastPull.shardsGranted || 1} Hero Shard for Star Ascension
                </span>
              </div>
            ) : (
              <div className="p-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-md text-xs text-slate-300 w-full flex flex-col gap-0.5">
                <span className="font-bold text-emerald-400">Added to Tactical Roster</span>
                <span className="text-[11px] text-slate-400">
                  Level 1 · Ready for Squad Formation & Patrols
                </span>
              </div>
            )}

            {canContinue ? (
              <button
                type="button"
                onClick={handleDismissResult}
                data-tutorial-target="summon-continue-btn"
                className="w-full py-3 px-4 btn-game-amber text-slate-950 font-black rounded-md text-xs min-h-[44px] cursor-pointer mt-1 shadow-lg focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95 text-center uppercase tracking-wider animate-fade-in"
              >
                Continue
              </button>
            ) : (
              <div className="w-full py-2.5 px-4 bg-[#0a0e17] border border-amber-500/30 rounded-md text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 mt-1 shadow-inner font-mono">
                <Sparkles size={14} className="text-amber-400" />
                <span>✦ Champion Recruited ✦</span>
              </div>
            )}
          </div>
        )}

        {/* ─── 4. History Toggle & List ─────────────────────────────────── */}
        <div className="flex justify-between items-center pt-2 border-t border-[#1e293b]">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-slate-400 hover:text-amber-300 transition-colors py-1 cursor-pointer flex items-center gap-1 font-semibold"
          >
            <History size={13} />
            <span>{showHistory ? 'Back to Banner' : 'View Summon History'}</span>
          </button>
          <span className="text-[10px] text-slate-500 font-mono">Fair Pity Guarantee: Active</span>
        </div>

        {showHistory && (
          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto p-1 bg-[#06080e] border border-[#1e293b] rounded-md animate-fade-in">
            {history.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">No summon records yet</div>
            ) : (
              history.map((record, idx) => (
                <div
                  key={record.id || idx}
                  className="flex justify-between items-center p-2 bg-[#0e131d] border border-[#1e293b] rounded text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{record.heroName || record.heroTemplateId}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-mono border border-slate-800">
                      {record.role || 'HERO'}
                    </span>
                    {record.isDuplicate && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded font-semibold">
                        +{record.shardsGranted} Shard
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {record.createdAt ? new Date(record.createdAt).toLocaleTimeString() : 'Recent'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </ModalShell>
  );
};

export default RecruitmentModal;
