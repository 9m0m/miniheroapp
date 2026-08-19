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
    iconBg: 'bg-amber-500/10 border-amber-500/25',
    title: 'group-hover:text-amber-300',
    card: 'border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950',
    primaryCard: 'border-amber-500/70 bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-950',
  },
  indigo: {
    icon: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10 border-indigo-500/25',
    title: 'group-hover:text-indigo-300',
    card: 'border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-slate-900 to-slate-950',
    primaryCard: 'border-indigo-500/60 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950',
  },
  cyan: {
    icon: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/25',
    title: 'group-hover:text-cyan-300',
    card: 'border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-slate-900 to-slate-950',
    primaryCard: 'border-cyan-500/60 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950',
  },
  emerald: {
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/25',
    title: 'group-hover:text-emerald-300',
    card: 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-950',
    primaryCard: 'border-emerald-500/60 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950',
  },
  rose: {
    icon: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border-rose-500/25',
    title: 'group-hover:text-rose-300',
    card: 'border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-950',
    primaryCard: 'border-rose-500/60 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950',
  },
};

const DOT_STATUS = {
  active: 'bg-emerald-400 motion-safe:animate-pulse',
  idle: 'bg-slate-600',
  ready: 'bg-amber-400 motion-safe:animate-pulse',
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
    ? 'border-slate-800 bg-slate-900/50 opacity-60 cursor-not-allowed'
    : isPrimary
    ? `${a.primaryCard} hover:brightness-110 active:scale-[0.985] cursor-pointer`
    : `${a.card} hover:brightness-110 active:scale-[0.985] cursor-pointer`;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      data-tutorial-target={dataTutorialTarget}
      className={`group w-full min-h-[52px] relative flex items-center gap-3.5 px-4 py-3 rounded-xl border transition-[background-color,border-color,transform,filter] duration-150 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none shadow-sm ${cardStyle}`}
    >
      {/* Icon Column */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
          disabled ? 'bg-slate-800/80 border-slate-700 text-slate-500' : a.iconBg
        }`}
      >
        {disabled ? (
          <Lock className="w-5 h-5 text-slate-500" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Icon className={`w-5 h-5 ${a.icon}`} strokeWidth={1.75} aria-hidden="true" />
        )}
      </div>

      {/* Text Column */}
      <div className="flex-1 min-w-0 text-left">
        <p
          className={`text-[13px] font-semibold text-slate-100 leading-snug truncate transition-colors ${
            disabled ? 'text-slate-400' : a.title
          }`}
        >
          {title}
        </p>
        <p className="text-[11px] text-slate-500 leading-snug truncate mt-0.5">{subtitle}</p>
        {statusText && (
          <div className="flex items-center gap-1.5 mt-1">
            {statusDot && !disabled && (
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_STATUS[statusDot]}`}
                aria-hidden="true"
              />
            )}
            <span className="text-[11px] text-slate-400 truncate">{statusText}</span>
          </div>
        )}
      </div>

      {/* Trailing Indicator */}
      {disabled ? (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 shrink-0 px-2 py-0.5 bg-slate-800 rounded">
          Locked
        </span>
      ) : (
        <ChevronRight
          className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      )}
    </button>
  );
};
