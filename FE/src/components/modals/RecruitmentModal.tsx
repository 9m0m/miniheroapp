'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ModalShell } from '@/components/ui/ModalShell';
import { recruitmentApi } from '@/services/recruitmentApi';
import { RecruitmentBanner, RecruitmentPullResponse } from '@/types/recruitment.types';
import { Sparkles, History, AlertCircle, CheckCircle, Users } from 'lucide-react';
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

  // In-memory guard — sessionStorage is the durable source of truth.
  const inFlightKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBanners();
      loadHistory();
      setLastPull(null);
      setError(null);
      // Recover any key that survived a crash/reload
      inFlightKeyRef.current = getPendingKey();
    }
  }, [isOpen]);

  const loadBanners = async () => {
    try {
      const data = await recruitmentApi.getBanners();
      setBanners(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load recruitment banners');
    }
  };

  const loadHistory = async () => {
    try {
      const data = await recruitmentApi.getHistory();
      setHistory(Array.isArray(data) ? (data as SummonHistoryItem[]) : []);
    } catch {
      // Non-blocking; history is optional
    }
  };

  const handlePull = async (bannerId: string) => {
    if (pulling) return;
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

      if (status === 400 || status === 403 || status === 404) {
        // Terminal client error → clear key; no point retrying
        clearPendingKey();
        inFlightKeyRef.current = null;
        setError(err?.response?.data?.message || 'Summon failed. Check your tickets.');
      } else if (status === 409) {
        // Conflict: key already processed → clear key, reconcile state
        clearPendingKey();
        inFlightKeyRef.current = null;
        setError('Summon already processed. Refreshing your roster…');
        loadBanners();
        loadHistory();
        fetchInitialData();
      } else {
        // Transient error (5xx / network) → keep key in sessionStorage for retry
        setError(err?.response?.data?.message || 'Network error. Tap Summon to retry.');
      }
    } finally {
      setPulling(false);
    }
  };

  const banner = banners.find((b) => b.bannerId === 'banner-standard') || banners[0];

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Altar of Heroes" maxWidth="lg">
      <div className="flex flex-col gap-4 p-2 text-slate-100">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Banner Card */}
        {banner && !lastPull && !showHistory && (
          <div className="flex flex-col gap-3 p-4 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 rounded-xl relative overflow-hidden shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-amber-200">{banner.name}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{banner.description}</p>
              </div>
              <div className="px-2.5 py-1 bg-amber-900/60 border border-amber-600/60 rounded-full text-[11px] font-semibold text-amber-300">
                🎫 Cost: {banner.ticketCost} Ticket
              </div>
            </div>

            {/* Banner Feature Art Box */}
            <div className="w-full h-36 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 p-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/20 via-transparent to-transparent pointer-events-none" />
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Celestial Hero Summon</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Standard Roster · 18 Launch Champions · Fair Duplicate Protection
                </div>
              </div>
            </div>

            {/* Pull Actions */}
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                disabled={pulling}
                onClick={() => handlePull(banner.bannerId)}
                data-tutorial-target="summon-btn"
                className="flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-[background-color,transform] min-h-[44px] cursor-pointer shadow-md bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Sparkles className="w-4 h-4" />
                {pulling ? 'Summoning…' : 'Summon 1x (1 Ticket)'}
              </button>
            </div>
          </div>
        )}

        {/* Summoning In-Flight Animation */}
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

        {/* Pull Result Card */}
        {lastPull && !pulling && (
          <div className="flex flex-col items-center gap-3 p-5 bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 border-2 border-indigo-500/60 rounded-xl text-center shadow-2xl animate-fade-in">
            <div className="text-xs font-semibold text-indigo-300 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-indigo-400" />
              {!lastPull.isNew ? 'Duplicate Hero Summoned' : 'New Hero Acquired!'}
            </div>

            <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-indigo-500/50 flex flex-col items-center justify-center shadow-lg relative my-1">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <div className="absolute -bottom-2 px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow">
                ★ 1
              </div>
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-100">{lastPull.heroName}</h4>
              <p className="text-xs text-amber-400 font-medium uppercase tracking-wide">
                {lastPull.role} · {lastPull.heroTemplateId}
              </p>
            </div>

            {!lastPull.isNew ? (
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 w-full">
                Converted to <span className="font-bold text-amber-400">+{lastPull.shardsGranted} Hero Shard</span> for Star-up Ascension.
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-300 w-full">
                Hero added to your roster at Level 1, 1★.
              </div>
            )}

            <button
              type="button"
              onClick={async () => {
                setLastPull(null);
                const store = useGameStore.getState();
                await store.refreshOnboarding?.();
                await store.fetchInitialData?.();
                const latestStep = useGameStore.getState().onboardingState?.step;
                if (latestStep === 'FIRST_EXPEDITION_REQUIRED' || latestStep === 'COMPLETE') {
                  onClose();
                }
              }}
              data-tutorial-target="summon-continue-btn"
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs min-h-[44px] cursor-pointer mt-2 shadow-lg focus-visible:ring-2 focus-visible:ring-amber-400 transition-[background-color,transform] active:scale-95"
            >
              Continue
            </button>
          </div>
        )}

        {/* History Toggle */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>{showHistory ? 'Back to Banner' : 'View Summon History'}</span>
          </button>
          <span className="text-[11px] text-slate-500">Paid Gacha: Disabled</span>
        </div>

        {/* History List */}
        {showHistory && (
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto p-1 bg-slate-950/60 border border-slate-800 rounded-lg">
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
                    {record.isDuplicate && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded">
                        +{record.shardsGranted} Shard
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">
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
