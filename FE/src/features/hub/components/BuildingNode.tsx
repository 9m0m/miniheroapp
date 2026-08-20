'use client';

import React from 'react';
import { LucideIcon, ChevronRight, Lock } from 'lucide-react';

export interface BuildingNodeProps {
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  accentColor: 'amber' | 'indigo' | 'cyan' | 'emerald' | 'rose';
  statusText?: string;
  statusDot?: 'active' | 'idle' | 'ready';
  isPrimary?: boolean;
  disabled?: boolean;
  dataTutorialTarget?: string;
  onClick: () => void;
}

const ACCENT = {
  amber: {
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/15 border-amber-400/40 shadow-inner',
    title: 'group-hover:text-amber-300',
    card: 'border-amber-500/35 bg-gradient-to-r from-[#1b150c] via-[#101623] to-[#0d121c] shadow-[0_2px_8px_-2px_rgba(245,158,11,0.15)]',
    primaryCard: 'border-amber-400/70 bg-gradient-to-r from-[#2a1d0d] via-[#141b2b] to-[#0e1422] shadow-[0_4px_16px_rgba(245,158,11,0.2)]',
    tagBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  indigo: {
    icon: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15 border-indigo-400/40 shadow-inner',
    title: 'group-hover:text-indigo-300',
    card: 'border-indigo-500/35 bg-gradient-to-r from-[#121226] via-[#101623] to-[#0d121c] shadow-[0_2px_8px_-2px_rgba(99,102,241,0.15)]',
    primaryCard: 'border-indigo-400/70 bg-gradient-to-r from-[#1c1d3b] via-[#141b2b] to-[#0e1422] shadow-[0_4px_16px_rgba(99,102,241,0.2)]',
    tagBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  cyan: {
    icon: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15 border-cyan-400/40 shadow-inner',
    title: 'group-hover:text-cyan-300',
    card: 'border-cyan-500/35 bg-gradient-to-r from-[#0a1824] via-[#101623] to-[#0d121c] shadow-[0_2px_8px_-2px_rgba(6,182,212,0.15)]',
    primaryCard: 'border-cyan-400/70 bg-gradient-to-r from-[#0f273b] via-[#141b2b] to-[#0e1422] shadow-[0_4px_16px_rgba(6,182,212,0.2)]',
    tagBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  emerald: {
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-400/40 shadow-inner',
    title: 'group-hover:text-emerald-300',
    card: 'border-emerald-500/35 bg-gradient-to-r from-[#0b1c16] via-[#101623] to-[#0d121c] shadow-[0_2px_8px_-2px_rgba(16,185,129,0.15)]',
    primaryCard: 'border-emerald-400/70 bg-gradient-to-r from-[#112d22] via-[#141b2b] to-[#0e1422] shadow-[0_4px_16px_rgba(16,185,129,0.2)]',
    tagBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  rose: {
    icon: 'text-rose-400',
    iconBg: 'bg-rose-500/15 border-rose-400/40 shadow-inner',
    title: 'group-hover:text-rose-300',
    card: 'border-rose-500/35 bg-gradient-to-r from-[#1f0f15] via-[#101623] to-[#0d121c] shadow-[0_2px_8px_-2px_rgba(244,63,94,0.15)]',
    primaryCard: 'border-rose-400/70 bg-gradient-to-r from-[#311721] via-[#141b2b] to-[#0e1422] shadow-[0_4px_16px_rgba(244,63,94,0.2)]',
    tagBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
};

const DOT_STATUS = {
  active: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] motion-safe:animate-pulse',
  idle: 'bg-slate-600',
  ready: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] motion-safe:animate-pulse',
};

export const BuildingNode: React.FC<BuildingNodeProps> = ({
  title,
  subtitle,
  Icon,
  accentColor,
  statusText,
  statusDot,
  isPrimary = false,
  disabled = false,
  dataTutorialTarget,
  onClick,
}) => {
  const a = ACCENT[accentColor];
  const cardStyle = disabled
    ? 'border-[#1e293b] bg-[#0a0e17] opacity-50 cursor-not-allowed'
    : isPrimary
    ? `${a.primaryCard} hover:brightness-110 active:scale-[0.985] cursor-pointer ring-1 ring-amber-500/30`
    : `${a.card} hover:brightness-110 active:scale-[0.985] cursor-pointer`;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      data-tutorial-target={dataTutorialTarget}
      className={`group w-full min-h-[56px] relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-[background,border-color,transform,filter] duration-150 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${cardStyle}`}
    >
      {/* Icon Capsule */}
      <div
        className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 border ${
          disabled ? 'bg-slate-900 border-slate-800 text-slate-600' : a.iconBg
        }`}
      >
        {disabled ? (
          <Lock className="w-4 h-4 text-slate-600" strokeWidth={2} aria-hidden="true" />
        ) : (
          <Icon className={`w-5 h-5 ${a.icon}`} strokeWidth={2} aria-hidden="true" />
        )}
      </div>

      {/* Text Column */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <p
            className={`text-xs font-bold text-slate-100 leading-snug truncate transition-colors ${
              disabled ? 'text-slate-500' : a.title
            }`}
          >
            {title}
          </p>
          {isPrimary && (
            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 shrink-0">
              Core
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 leading-snug truncate mt-0.5">{subtitle}</p>
        {statusText && (
          <div className="flex items-center gap-1.5 mt-1">
            {statusDot && !disabled && (
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_STATUS[statusDot]}`}
                aria-hidden="true"
              />
            )}
            <span className="text-[10px] font-mono text-slate-400 truncate">{statusText}</span>
          </div>
        )}
      </div>

      {/* Trailing Indicator */}
      {disabled ? (
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 shrink-0 px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">
          Locked
        </span>
      ) : (
        <ChevronRight
          className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0"
          strokeWidth={2}
          aria-hidden="true"
        />
      )}
    </button>
  );
};

export default BuildingNode;
