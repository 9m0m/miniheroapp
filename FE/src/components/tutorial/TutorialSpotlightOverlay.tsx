'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { onboardingApi } from '@/services/onboardingApi';
import { TypewriterText } from './TypewriterText';
import { Sparkles, ChevronRight, Swords, Compass, Shield } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TutorialStepConfig {
  targetSelector: string;
  title: string;
  message: string;
}

// ── Step config resolver ─────────────────────────────────────────────────────
function resolveTutorialConfig(
  step: string | undefined,
  activeModal: string | null,
): TutorialStepConfig | null {
  switch (step) {
    case 'SUMMON_KNIGHT_REQUIRED':
      return {
        targetSelector:
          activeModal === 'RECRUITMENT'
            ? '[data-tutorial-target="summon-btn"]'
            : '[data-tutorial-target="building-recruitment"]',
        title: 'Mission 1: Summon Champion',
        message:
          activeModal === 'RECRUITMENT'
            ? 'Tap the Summon button to recruit your frontline champion.'
            : 'Tap the Altar of Heroes to recruit your frontline guardian.',
      };

    case 'SUMMON_RANGER_REQUIRED':
      return {
        targetSelector:
          activeModal === 'RECRUITMENT'
            ? '[data-tutorial-target="summon-btn"]'
            : '[data-tutorial-target="building-recruitment"]',
        title: 'Mission 2: Recruit Ranger',
        message:
          activeModal === 'RECRUITMENT'
            ? 'Tap Summon to recruit a Ranger for ranged firepower.'
            : 'Recruit a ranged Ranger to reinforce your backline firepower.',
      };

    case 'FIRST_EXPEDITION_REQUIRED':
      return {
        targetSelector:
          activeModal === 'EXPEDITION'
            ? '[data-tutorial-target="expedition-select-heroes"]'
            : '[data-tutorial-target="building-expedition"]',
        title: 'Mission 3: Airship Patrol',
        message:
          activeModal === 'EXPEDITION'
            ? 'Select your champions to dispatch them on patrol.'
            : 'Tap the Expedition Airship to dispatch heroes on a quick 10-second patrol.',
      };

    case 'FIRST_EXPEDITION_RUNNING':
      return {
        targetSelector:
          activeModal === 'EXPEDITION'
            ? '[data-tutorial-target="expedition-claim-btn"]'
            : '[data-tutorial-target="building-expedition"]',
        title: 'Patrol in Progress…',
        message: 'Heroes are on patrol. Wait for the 10-second timer to collect loot.',
      };

    case 'FIRST_EXPEDITION_CLAIM_REQUIRED':
      return {
        targetSelector:
          activeModal === 'EXPEDITION'
            ? '[data-tutorial-target="expedition-claim-btn"]'
            : '[data-tutorial-target="building-expedition"]',
        title: 'Claim Patrol Rewards',
        message: 'Tap Claim Rewards to receive your 3rd Summon Ticket.',
      };

    case 'THIRD_SUMMON_REQUIRED':
      return {
        targetSelector:
          activeModal === 'RECRUITMENT'
            ? '[data-tutorial-target="summon-btn"]'
            : '[data-tutorial-target="building-recruitment"]',
        title: 'Mission 4: Complete Squad',
        message:
          activeModal === 'RECRUITMENT'
            ? 'Use your earned ticket to summon your 3rd champion.'
            : 'Visit the Altar of Heroes to complete your starting 3-hero squad.',
      };

    default:
      return null;
  }
}

// ── Component ────────────────────────────────────────────────────────────────
export const TutorialSpotlightOverlay: React.FC = () => {
  const onboardingState  = useGameStore((s) => s.onboardingState);
  const refreshOnboarding = useGameStore((s) => s.refreshOnboarding);
  const activeModal      = useGameStore((s) => s.activeModal);
  const featureFlags     = useGameStore((s) => s.featureFlags);

  const [targetRect, setTargetRect]           = useState<TargetRect | null>(null);
  const [isTypewriterSkipped, setTypewriterSkipped] = useState(false);
  const [isTypewriterDone, setTypewriterDone]       = useState(false);
  const [liveAnnouncement, setLiveAnnouncement]     = useState('');
  const [isAdvancingWelcome, setAdvancingWelcome]   = useState(false);
  const [hasContinueBtn, setHasContinueBtn]         = useState(false);

  const beginJourneyRef   = useRef<HTMLButtonElement>(null);
  const previousFocusRef  = useRef<Element | null>(null);

  const step          = onboardingState?.step;
  const isCoreV2      = featureFlags?.coreV2Enabled === true;
  const isWelcomeStep = step === 'WELCOME';
  const currentStepKey = `${step ?? 'none'}_${activeModal ?? 'none'}`;

  const config = useMemo(() => resolveTutorialConfig(step, activeModal), [step, activeModal]);

  // ── 1. Reset typewriter on step/modal change ─────────────────────────────
  useEffect(() => {
    setTypewriterSkipped(false);
    setTypewriterDone(false);
    setLiveAnnouncement('');
  }, [currentStepKey]);

  // ── 2. Focus management on Welcome dialog ───────────────────────────────
  useEffect(() => {
    if (!isCoreV2 || !isWelcomeStep) return;

    // Save currently focused element; restore when welcome dialog is dismissed
    previousFocusRef.current = document.activeElement;

    // Delay to let the dialog mount before focusing
    const id = setTimeout(() => beginJourneyRef.current?.focus(), 50);
    return () => {
      clearTimeout(id);
      (previousFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, [isCoreV2, isWelcomeStep]);


  // ── 4. Target rect measurement — scoped observers ───────────────────────
  useEffect(() => {
    if (!config || isWelcomeStep) {
      setTargetRect(null);
      return;
    }

    let rafId: number | null = null;

    const measurePositions = () => {
      const continueBtn =
        document.querySelector('[data-tutorial-target="summon-continue-btn"]') ||
        document.querySelector('[data-tutorial-target="expedition-done-btn"]');
      setHasContinueBtn(Boolean(continueBtn));

      const selector = continueBtn
        ? `[data-tutorial-target="${continueBtn.getAttribute('data-tutorial-target')}"]`
        : config.targetSelector;

      const el = document.querySelector(selector);
      if (el) {
        const r = el.getBoundingClientRect();
        const next: TargetRect = {
          top:    Math.max(0, r.top - 4),
          left:   Math.max(0, r.left - 4),
          width:  r.width + 8,
          height: r.height + 8,
        };
        setTargetRect((prev) => {
          if (
            prev &&
            Math.abs(prev.top    - next.top)    < 1 &&
            Math.abs(prev.left   - next.left)   < 1 &&
            Math.abs(prev.width  - next.width)  < 1 &&
            Math.abs(prev.height - next.height) < 1
          ) {
            return prev;
          }
          return next;
        });
      } else {
        setTargetRect(null);
      }
    };

    const schedule = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measurePositions);
    };

    schedule();

    // ResizeObserver scoped to #game-main-container (not document.body)
    const container = document.getElementById('game-main-container') ?? document.body;
    const resizeObs = new ResizeObserver(schedule);
    resizeObs.observe(container);

    // MutationObserver: childList only on container (no attributes: true)
    const mutationObs = new MutationObserver(schedule);
    mutationObs.observe(container, { childList: true, subtree: true });

    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true, capture: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      mutationObs.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
    };
  }, [config, isWelcomeStep]);

  // ── 5. Keyboard shortcuts ────────────────────────────────────────────────
  useEffect(() => {
    if (!isCoreV2 || !step || step === 'COMPLETE') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setTypewriterSkipped(true);
        setTypewriterDone(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCoreV2, step]);

  // ── 6. Announce completed dialogue to screen reader (deferred) ──────────
  const handleTypewriterComplete = (finalText: string) => {
    setTypewriterDone(true);
    setLiveAnnouncement(finalText);
  };

  // ── Guard ────────────────────────────────────────────────────────────────
  if (!isCoreV2 || !step || step === 'COMPLETE') return null;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStartJourney = async () => {
    if (isAdvancingWelcome) return;
    setAdvancingWelcome(true);
    try {
      await onboardingApi.advance({ targetStep: 'SUMMON_KNIGHT_REQUIRED' });
      await refreshOnboarding();
    } catch (err) {
      console.warn('Welcome advance failed:', err);
    } finally {
      setAdvancingWelcome(false);
    }
  };

  const skipTypewriter = () => {
    setTypewriterSkipped(true);
    setTypewriterDone(true);
  };

  // ── 0. Welcome: Centered Story Dialog with Focus Trap ────────────────────
  if (isWelcomeStep) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-story-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in select-none"
        // Trap focus within by catching blur to last focusable and cycling back to first
      >
        <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3 ring-1 ring-amber-500/20">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Sparkles className="w-7 h-7" aria-hidden="true" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Guide Lucy</span>
            <h2 id="welcome-story-title" className="text-base font-black text-slate-100 mt-0.5">
              Welcome to Sky Sanctuary!
            </h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Sanctuary is your aerial tactical fortress. Assemble an elite 3-hero squad to explore the realm and conquer The Infinite Tower.
          </p>

          <div className="w-full grid grid-cols-3 gap-2 py-2 border-y border-slate-800 text-[11px] text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <Shield className="w-4 h-4 text-blue-400" aria-hidden="true" />
              <span>Summon</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Compass className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>Patrol</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Swords className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>3v3 Tower</span>
            </div>
          </div>

          <button
            ref={beginJourneyRef}
            type="button"
            disabled={isAdvancingWelcome}
            onClick={handleStartJourney}
            onKeyDown={(e) => {
              // Cycle focus back to self on Tab (only focusable element)
              if (e.key === 'Tab') e.preventDefault();
            }}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs min-h-[44px] cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-[background-color,transform] focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span>{isAdvancingWelcome ? 'Initializing…' : 'Begin Journey'}</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  if (!config) return null;

  const displayTitle   = hasContinueBtn ? 'Champion Acquired!' : config.title;
  const displayMessage = hasContinueBtn ? 'Tap Continue to proceed with your squad building.' : config.message;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"   // Whole overlay is aria-hidden; Lucy box has its own role="region"
    >
      {/* ── Visually-hidden deferred live region — fires once typewriter completes ── */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

      {/* ── Four-Panel Backdrop ───────────────────────────────────────────── */}
      {targetRect ? (
        <>
          {/* Top */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={skipTypewriter}
            style={{ top: 0, left: 0, right: 0, height: `${targetRect.top}px` }}
            className="absolute bg-[rgba(4,6,12,0.82)] pointer-events-auto cursor-default"
          />
          {/* Bottom */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={skipTypewriter}
            style={{
              top: `${targetRect.top + targetRect.height}px`,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            className="absolute bg-[rgba(4,6,12,0.82)] pointer-events-auto cursor-default"
          />
          {/* Left */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={skipTypewriter}
            style={{
              top: `${targetRect.top}px`,
              left: 0,
              width: `${targetRect.left}px`,
              height: `${targetRect.height}px`,
            }}
            className="absolute bg-[rgba(4,6,12,0.82)] pointer-events-auto cursor-default"
          />
          {/* Right */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={skipTypewriter}
            style={{
              top: `${targetRect.top}px`,
              left: `${targetRect.left + targetRect.width}px`,
              right: 0,
              height: `${targetRect.height}px`,
            }}
            className="absolute bg-[rgba(4,6,12,0.82)] pointer-events-auto cursor-default"
          />

          {/* Golden Highlight Outline */}
          <div
            style={{
              top:    `${targetRect.top}px`,
              left:   `${targetRect.left}px`,
              width:  `${targetRect.width}px`,
              height: `${targetRect.height}px`,
            }}
            className="absolute rounded-xl border-2 border-amber-400 ring-2 ring-amber-400/30 pointer-events-none shadow-[0_0_20px_rgba(245,158,11,0.35)]"
          />
        </>
      ) : (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={skipTypewriter}
          className="absolute inset-0 bg-[rgba(4,6,12,0.82)] pointer-events-auto cursor-default"
        />
      )}

      {/* ── Lucy Speech Box ──────────────────────────────────────────────── */}
      <div
        role="region"
        aria-label="Tutorial guidance"
        aria-hidden="false"
        className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-3 right-3 max-w-sm mx-auto pointer-events-auto"
      >
        <div className="bg-slate-900/95 border border-amber-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-1.5 ring-1 ring-amber-500/20">
          {/* Header */}
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-3 h-3 text-amber-400" aria-hidden="true" />
              </div>
              <span className="text-[11px] font-bold text-amber-300 truncate">Lucy</span>
              <span className="text-[9px] text-slate-500 font-medium px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 shrink-0">
                {displayTitle}
              </span>
            </div>

            <button
              type="button"
              onClick={skipTypewriter}
              aria-label="Skip typewriter dialogue"
              className="text-[10px] text-slate-400 hover:text-amber-300 font-mono shrink-0 ml-1 py-0.5 px-1.5 rounded hover:bg-slate-800 cursor-pointer transition-[color,background-color]"
            >
              {isTypewriterDone || isTypewriterSkipped ? 'Tap target' : 'Skip (Esc)'}
            </button>
          </div>

          {/* Typewriter — aria-hidden; live region fires on completion instead */}
          <div
            aria-hidden="true"
            className="text-xs text-slate-200 leading-snug font-medium min-h-[28px]"
          >
            <TypewriterText
              text={displayMessage}
              speedMs={18}
              isComplete={isTypewriterSkipped}
              onComplete={() => handleTypewriterComplete(displayMessage)}
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
            <span className="text-amber-400/90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
              Tap the highlighted area above
            </span>
            <div className="flex items-center gap-0.5 text-slate-400">
              <span>{isTypewriterDone || isTypewriterSkipped ? 'Action' : 'Skip'}</span>
              <ChevronRight className="w-3 h-3 text-amber-400" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
