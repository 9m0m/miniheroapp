'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ModalShell } from '@/components/ui/ModalShell';
import { recruitmentApi } from '@/services/recruitmentApi';
import { RecruitmentBanner, RecruitmentPullResponse } from '@/types/recruitment.types';
import { Sparkles, History, AlertCircle, CheckCircle, Users, Compass, Shield, ArrowRight } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';

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

  const fetchInitialData = useGameStore((state) => state.fetchInitialData);
  const openModal        = useGameStore((state) => state.openModal);
  const onboardingState  = useGameStore((state) => state.onboardingState);

  const ticketBalance = onboardingState?.standardSummonTickets ?? 0;
  const currentStep   = onboardingState?.step;
  const isExpeditionNext = currentStep === 'FIRST_EXPEDITION_REQUIRED' || currentStep === 'FIRST_EXPEDITION_RUNNING';

  // In-memory guard — sessionStorage is the durable source of truth.
  const inFlightKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBanners();
      loadHistory();
      setLastPull(null);
      setError(null);
      inFlightKeyRef.current = getPendingKey();
    }
  }, [isOpen]);

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

    try {
      const result = await recruitmentApi.pull({ bannerId, ticketType: 'STANDARD_TICKET', idempotencyKey });

      // Authoritative success → clear key
      clearPendingKey();
      inFlightKeyRef.current = null;

      setLastPull(result);
      loadBanners();
      loadHistory();
      fetchInitialData();
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
        fetchInitialData();
      } else {
        setError(serverMsg || 'Network error. Tap Summon to retry.');
      }
    } finally {
      setPulling(false);
    }
  };

  const banner = banners.find((b) => b.bannerId === 'STANDARD' || b.bannerId === 'banner-standard') || banners[0];

  const handleDismissResult = async () => {
    setLastPull(null);
    const store = useGameStore.getState();
    await store.refreshOnboarding?.();
    await store.fetchInitialData?.();
    const latestStep = useGameStore.getState().onboardingState?.step;

    if (latestStep === 'FIRST_EXPEDITION_REQUIRED' || latestStep === 'FIRST_EXPEDITION_RUNNING' || latestStep === 'COMPLETE') {
      onClose();
    }
  };

  const handleGoToExpedition = () => {
    onClose();
    openModal('EXPEDITION' as any);
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Altar of Heroes" maxWidth="lg">
      <div className="flex flex-col gap-4 p-2 text-slate-100">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* ─── 1. Main Banner Card ─────────────────────────────────────── */}
        {banner && !lastPull && !showHistory && (
          <div className="flex flex-col gap-3 p-4 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 rounded-xl relative overflow-hidden shadow-lg">
            {/* Header with Title and Ticket Counter */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-amber-200">{banner.name}</h3>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                ticketBalance > 0
                  ? 'bg-amber-900/60 border-amber-500/60 text-amber-300 shadow-sm'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}>
                <span>🎫 Tickets:</span>
                <span className={ticketBalance > 0 ? 'text-amber-300 font-extrabold' : 'text-slate-500'}>
                  {ticketBalance}
                </span>
              </div>
            </div>

            {/* Banner Feature Art Box */}
            <div className="w-full h-32 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 p-4 text-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/20 via-transparent to-transparent pointer-events-none" />
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Celestial Hero Summon</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  18 Launch Champions · Fair Duplicate Protection (1 Shard/Dupe)
                </div>
              </div>
            </div>

            {/* Dynamic Pull / Out-of-Tickets Actions */}
            <div className="flex flex-col gap-2 mt-1">
              {ticketBalance >= 1 ? (
                <button
                  type="button"
                  disabled={pulling}
                  onClick={() => handlePull(banner.bannerId)}
                  data-tutorial-target="summon-btn"
                  className="w-full py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-[background-color,transform] min-h-[44px] cursor-pointer shadow-md bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{pulling ? 'Summoning…' : 'Summon 1x (1 Ticket)'}</span>
                </button>
              ) : isExpeditionNext ? (
                /* Guided CTA when user needs to run Expedition for ticket 3 */
                <div className="flex flex-col gap-2 p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-300 font-semibold">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>Next: 10s Patrol for 3rd Summon Ticket</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Dispatch your 2 recruited champions on patrol to claim your final starter ticket!
                  </p>
                  <button
                    type="button"
                    onClick={handleGoToExpedition}
                    className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-bold rounded-lg text-xs min-h-[40px] cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-[background-color,transform]"
                  >
                    <span>Launch Expedition Airship</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Standard Out-of-Tickets Disabled State */
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 bg-slate-850 border border-slate-700/80 text-slate-500 cursor-not-allowed opacity-60 min-h-[44px]"
                  >
                    <span>No Summon Tickets Available</span>
                  </button>
                  <span className="text-[10px] text-slate-500 text-center">
                    Earn tickets via Airship Expeditions, Tower Floors, and Quest Milestones.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 2. Summoning In-Flight Celestial Gate Animation ─────────── */}
        {pulling && (
          <div className="flex flex-col items-center justify-center gap-3 p-8 bg-slate-950/90 border border-amber-500/30 rounded-xl text-center shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center relative shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Summoning Astral Champion…</h4>
              <p className="text-xs text-amber-400/90 mt-0.5 animate-pulse font-mono">Opening Celestial Gate</p>
            </div>
          </div>
        )}

        {/* ─── 3. Pull Result Card ─────────────────────────────────────── */}
        {lastPull && !pulling && (
          <div className="flex flex-col items-center gap-3 p-5 bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 border-2 border-indigo-500/60 rounded-xl text-center shadow-2xl animate-fade-in">
            <div className="text-xs font-semibold text-indigo-300 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-indigo-400" />
              {!lastPull.isNew ? 'Duplicate Hero Summoned' : 'New Champion Recruited!'}
            </div>

            <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-indigo-500/50 flex flex-col items-center justify-center shadow-lg relative my-1">
              <Shield className="w-8 h-8 text-amber-400" />
              <div className="absolute -bottom-2 px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow">
                ★ 1
              </div>
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-100">{lastPull.heroName}</h4>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                {lastPull.role} · {lastPull.heroTemplateId}
              </p>
            </div>

            {!lastPull.isNew ? (
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 w-full">
                Converted to <span className="font-bold text-amber-400">+{lastPull.shardsGranted} Hero Shard</span> for Star-up Ascension.
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 w-full">
                Champion added to your roster at Level 1, 1★.
              </div>
            )}

            <button
              type="button"
              onClick={handleDismissResult}
              data-tutorial-target="summon-continue-btn"
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs min-h-[44px] cursor-pointer mt-2 shadow-lg focus-visible:ring-2 focus-visible:ring-amber-400 transition-[background-color,transform] active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─── 4. History Toggle & List ─────────────────────────────────── */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>{showHistory ? 'Back to Banner' : 'View Summon History'}</span>
          </button>
          <span className="text-[11px] text-slate-500">Fair Pity Guarantee: Active</span>
        </div>

        {showHistory && (
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto p-1 bg-slate-950/60 border border-slate-800 rounded-lg animate-fade-in">
            {history.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">No summon records yet</div>
            ) : (
              history.map((record, idx) => (
                <div
                  key={record.id || idx}
                  className="flex justify-between items-center p-2 bg-slate-900/60 border border-slate-800/80 rounded text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{record.heroName || record.heroTemplateId}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {record.role || 'HERO'}
                    </span>
                    {record.isDuplicate && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded">
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
