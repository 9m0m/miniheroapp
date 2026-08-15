'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { trialApi } from '@/services/trialApi';
import { TrialLeaderboardEntry, TrialType, BuildInspectResponse } from '@/types/trial.types';
import { InspectBuildModal } from './InspectBuildModal';
import { X, Trophy, Swords, Timer, Zap, Sparkles, RefreshCw, Eye, EyeOff, Play, Crown } from 'lucide-react';
import { HeroClass } from '@/types/game.types';

interface TrialArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrialArenaModal: React.FC<TrialArenaModalProps> = ({ isOpen, onClose }) => {
  const { userId, heroes, getHeroTotalStats, addFloatingText } = useGameStore();

  const [activeTab, setActiveTab] = useState<TrialType>('DPS_30S');
  const [leaderboard, setLeaderboard] = useState<TrialLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBuildPublic, setIsBuildPublic] = useState<boolean>(true);
  const [inspectData, setInspectData] = useState<BuildInspectResponse | null>(null);
  const [inspectOpen, setInspectOpen] = useState<boolean>(false);

  // Minigame Combat Simulation State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trialTimeLeft, setTrialTimeLeft] = useState<number>(30);
  const [liveDps, setLiveDps] = useState<number>(0);
  const [peakDps, setPeakDps] = useState<number>(0);
  const [totalDamage, setTotalDamage] = useState<number>(0);
  const [bossHp, setBossHp] = useState<number>(50000);
  const [bossMaxHp, setBossMaxHp] = useState<number>(50000);
  const [speedrunTimer, setSpeedrunTimer] = useState<number>(0);

  const animationFrameRef = useRef<number>(0);
  const trialStateRef = useRef({
    totalDmg: 0,
    peakDps: 0,
    elapsed: 0,
    running: false,
    bossHp: 50000,
  });

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await trialApi.getLeaderboard(activeTab);
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load trial leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, activeTab]);

  const handleTogglePrivacy = async () => {
    if (!userId) return;
    const nextVal = !isBuildPublic;
    setIsBuildPublic(nextVal);
    try {
      await trialApi.togglePrivacy(userId, nextVal);
      addFloatingText(nextVal ? '👁️ Build: PUBLIC' : '🔒 Build: PRIVATE', 180, 100, '#38BDF8', true);
    } catch (err) {
      console.error('Failed to toggle privacy:', err);
    }
  };

  const handleInspectPlayer = async (targetUserId: string) => {
    try {
      const data = await trialApi.inspectBuild(targetUserId, false);
      setInspectData(data);
      setInspectOpen(true);
    } catch (err) {
      console.error('Failed to inspect player:', err);
    }
  };

  // Start 30s DPS Trial or Boss Speedrun
  const startTrial = () => {
    setIsPlaying(true);
    setTrialTimeLeft(30);
    setLiveDps(0);
    setPeakDps(0);
    setTotalDamage(0);
    setSpeedrunTimer(0);
    setBossHp(50000);
    setBossMaxHp(50000);

    trialStateRef.current = {
      totalDmg: 0,
      peakDps: 0,
      elapsed: 0,
      running: true,
      bossHp: 50000,
    };

    const startTime = performance.now();
    let lastTime = startTime;

    // Calculate total squad base DPS
    let squadBaseDps = 0;
    const activeHeroClasses: HeroClass[] = ['WARRIOR', 'RANGER', 'MAGE', 'PRIEST'];
    activeHeroClasses.forEach((hc: HeroClass) => {
      const stats = getHeroTotalStats(hc);
      squadBaseDps += (stats.physAtk + stats.magicAtk) * (1 + (stats.critRate / 100) * (stats.critDmg / 100));
    });
    squadBaseDps = Math.max(150, squadBaseDps * 1.5);

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (!trialStateRef.current.running) return;

      trialStateRef.current.elapsed += dt;
      const elapsed = trialStateRef.current.elapsed;

      const variance = 0.85 + Math.random() * 0.35;
      const tickDmg = squadBaseDps * variance * dt;
      trialStateRef.current.totalDmg += tickDmg;
      const currentCalculatedDps = trialStateRef.current.totalDmg / Math.max(0.1, elapsed);
      if (currentCalculatedDps > trialStateRef.current.peakDps) {
        trialStateRef.current.peakDps = currentCalculatedDps;
      }

      setTotalDamage(Math.round(trialStateRef.current.totalDmg));
      setLiveDps(Math.round(currentCalculatedDps));
      setPeakDps(Math.round(trialStateRef.current.peakDps));

      if (activeTab === 'DPS_30S') {
        const left = Math.max(0, 30 - elapsed);
        setTrialTimeLeft(Math.ceil(left));

        if (left <= 0) {
          endTrial(trialStateRef.current.peakDps, trialStateRef.current.totalDmg, 30.0);
          return;
        }
      } else {
        // Boss Speedrun
        trialStateRef.current.bossHp = Math.max(0, 50000 - trialStateRef.current.totalDmg);
        setBossHp(Math.round(trialStateRef.current.bossHp));
        setSpeedrunTimer(Math.round(elapsed * 100) / 100);

        if (trialStateRef.current.bossHp <= 0) {
          endTrial(trialStateRef.current.peakDps, trialStateRef.current.totalDmg, Math.round(elapsed * 100) / 100);
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const endTrial = async (finalPeakDps: number, finalTotalDmg: number, timeSec: number) => {
    trialStateRef.current.running = false;
    cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(false);

    if (userId) {
      try {
        const payload = {
          userId,
          trialType: activeTab,
          dpsPeak: finalPeakDps,
          totalDamage: finalTotalDmg,
          timeTakenSec: timeSec,
          heroesSnapshotJson: JSON.stringify({
            heroes,
            totalDps: finalPeakDps,
            timestamp: Date.now(),
          }),
        };
        await trialApi.submitRecord(payload);
        addFloatingText(`🏆 Score: ${activeTab === 'DPS_30S' ? `${Math.round(finalPeakDps)} DPS` : `${timeSec}s`}!`, 180, 80, '#F59E0B', true);
        await fetchLeaderboard();
      } catch (err) {
        console.error('Failed to submit trial record:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[390px] bg-[#0D111A] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-3.5 py-2.5 bg-gradient-to-r from-slate-900 via-[#141C2B] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Weekly Arena</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  S1
                </span>
              </h3>
              <p className="text-[9px] text-slate-400">Real combat DPS & Speedrun rankings</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTogglePrivacy}
              className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-lg border transition ${
                isBuildPublic
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
              title="Toggle public showcase of your build"
            >
              {isBuildPublic ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
              <span>{isBuildPublic ? 'Public' : 'Secret'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="px-3 pt-2.5 flex items-center gap-1.5">
          <button
            onClick={() => { setActiveTab('DPS_30S'); setIsPlaying(false); }}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 border ${
              activeTab === 'DPS_30S'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-black border-amber-400 font-black shadow-md shadow-yellow-500/20'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>🎯 30s Burst DPS</span>
          </button>

          <button
            onClick={() => { setActiveTab('BOSS_SPEEDRUN'); setIsPlaying(false); }}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 border ${
              activeTab === 'BOSS_SPEEDRUN'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-red-400 shadow-md shadow-red-500/20'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
            }`}
          >
            <Timer className="w-3 h-3" />
            <span>⏱️ Boss Speedrun</span>
          </button>
        </div>

        {/* Live Combat Trial Arena Stage */}
        <div className="p-3">
          <div className="bg-[#121824] border border-slate-800 rounded-2xl p-3 flex flex-col gap-2.5 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{activeTab === 'DPS_30S' ? '🎯' : '🐲'}</span>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    {activeTab === 'DPS_30S' ? 'Training Dummy' : 'Wyrm Overlord'}
                  </h4>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {activeTab === 'DPS_30S' ? '30s Live Burst Test' : 'Time-to-kill Challenge'}
                  </span>
                </div>
              </div>

              {!isPlaying ? (
                <button
                  onClick={startTrial}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1 active:scale-95 transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start</span>
                </button>
              ) : (
                <span className="text-xs font-mono font-black text-amber-400 animate-pulse">
                  {activeTab === 'DPS_30S' ? `⏳ ${trialTimeLeft}s` : `⏱️ ${speedrunTimer}s`}
                </span>
              )}
            </div>

            {/* Combat Metrics Bar */}
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
              <div className="bg-[#161D2B] py-1.5 px-1 rounded-xl border border-slate-800">
                <span className="text-[8px] text-slate-400 block uppercase">Live DPS</span>
                <span className="text-amber-400 font-black text-xs">{liveDps.toLocaleString()}</span>
              </div>
              <div className="bg-[#161D2B] py-1.5 px-1 rounded-xl border border-slate-800">
                <span className="text-[8px] text-slate-400 block uppercase">Peak DPS</span>
                <span className="text-cyan-300 font-black text-xs">{peakDps.toLocaleString()}</span>
              </div>
              <div className="bg-[#161D2B] py-1.5 px-1 rounded-xl border border-slate-800">
                <span className="text-[8px] text-slate-400 block uppercase">Total Dmg</span>
                <span className="text-purple-300 font-black text-xs">{totalDamage.toLocaleString()}</span>
              </div>
            </div>

            {/* Boss HP Bar for Speedrun */}
            {activeTab === 'BOSS_SPEEDRUN' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>Boss HP:</span>
                  <span className="text-red-400 font-bold">{bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="px-3 pb-3 overflow-y-auto space-y-1.5 flex-1 max-h-[38vh]">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
            <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              <span>Realm Leaderboard</span>
            </span>
            <button onClick={fetchLeaderboard} className="hover:text-white transition">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px]">Loading rankings...</span>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-[10px]">
              No records submitted yet this season. Be the first to claim Top 1!
            </div>
          ) : (
            leaderboard.map((entry, idx) => {
              const isTop1 = idx === 0;
              const isTop2 = idx === 1;
              const isTop3 = idx === 2;

              return (
                <div
                  key={entry.userId + '-' + idx}
                  className={`p-2 rounded-xl border transition flex items-center justify-between gap-2 ${
                    isTop1
                      ? 'bg-gradient-to-r from-amber-950/40 via-[#1C182B] to-[#121824] border-amber-500/50'
                      : isTop2
                      ? 'bg-gradient-to-r from-slate-800/40 to-[#121824] border-slate-600/50'
                      : isTop3
                      ? 'bg-gradient-to-r from-amber-900/20 to-[#121824] border-amber-700/40'
                      : 'bg-[#141B28] border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 text-center font-black font-mono text-[11px] flex-shrink-0 ${
                        isTop1 ? 'text-amber-400' : isTop2 ? 'text-slate-300' : isTop3 ? 'text-amber-600' : 'text-slate-500'
                      }`}
                    >
                      {isTop1 ? '👑' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${entry.rank || idx + 1}`}
                    </span>

                    <div className="min-w-0">
                      <h5 className="text-[11px] font-bold text-white truncate">{entry.username}</h5>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {activeTab === 'DPS_30S'
                          ? `${entry.totalDamage.toLocaleString()} dmg`
                          : `${entry.timeTakenSec}s TTK`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[11px] font-mono font-black text-amber-400">
                      {activeTab === 'DPS_30S' ? `${entry.score.toLocaleString()} DPS` : `${entry.score}s`}
                    </span>

                    <button
                      onClick={() => handleInspectPlayer(entry.userId)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-purple-300 border border-purple-500/30 flex items-center gap-0.5 transition active:scale-95"
                      title="Inspect Build"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Inspect Build Modal Component */}
      <InspectBuildModal
        isOpen={inspectOpen}
        onClose={() => setInspectOpen(false)}
        data={inspectData}
      />
    </div>
  );
};
