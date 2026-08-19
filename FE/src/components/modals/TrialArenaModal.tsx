'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { trialApi } from '@/services/trialApi';
import { TrialLeaderboardEntry, TrialType, BuildInspectResponse } from '@/types/trial.types';
import { InspectBuildModal } from './InspectBuildModal';
import { ModalShell } from '../ui/ModalShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Trophy,
  Swords,
  Timer,
  Zap,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Play,
  Crown,
} from 'lucide-react';
import { HeroClass } from '@/types/game.types';

interface TrialArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrialArenaModal: React.FC<TrialArenaModalProps> = ({ isOpen, onClose }) => {
  const userId = useGameStore((state) => state.userId);
  const heroes = useGameStore((state) => state.heroes);
  const getHeroTotalStats = useGameStore((state) => state.getHeroTotalStats);
  const addFloatingText = useGameStore((state) => state.addFloatingText);

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
  const [bossMaxHp] = useState<number>(50000);
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
      addFloatingText(nextVal ? 'Build: PUBLIC' : 'Build: PRIVATE', 180, 100, '#38BDF8', true);
    } catch (err) {
      console.error('Failed to toggle privacy:', err);
    }
  };

  const handleInspectPlayer = async (targetUserId: string) => {
    try {
      const data = await trialApi.inspectBuild(targetUserId);
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
        addFloatingText(`Trial Record: ${activeTab === 'DPS_30S' ? `${Math.round(finalPeakDps)} DPS` : `${timeSec}s`}!`, 180, 80, '#F59E0B', true);
        await fetchLeaderboard();
      } catch (err) {
        console.error('Failed to submit trial record:', err);
      }
    }
  };

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={onClose}
        icon={<Trophy size={18} className="text-amber-400" />}
        title="Weekly Trial Arena"
        description="Real combat DPS and speedrun leaderboard"
      >
        <div className="space-y-3">
          {/* Mode Navigation Tabs & Privacy Toggle */}
          <div className="flex items-center justify-between gap-2">
            <div role="tablist" aria-label="Trial types" className="flex items-center gap-1.5 flex-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'DPS_30S'}
                onClick={() => { setActiveTab('DPS_30S'); setIsPlaying(false); }}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1 min-h-[36px] ${
                  activeTab === 'DPS_30S'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap size={13} aria-hidden="true" />
                <span>30s Burst DPS</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'BOSS_SPEEDRUN'}
                onClick={() => { setActiveTab('BOSS_SPEEDRUN'); setIsPlaying(false); }}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1 min-h-[36px] ${
                  activeTab === 'BOSS_SPEEDRUN'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Timer size={13} aria-hidden="true" />
                <span>Boss Speedrun</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleTogglePrivacy}
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white transition min-h-[44px]"
              title="Toggle public showcase of your build"
            >
              {isBuildPublic ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} className="text-amber-400" />}
              <span>{isBuildPublic ? 'Public' : 'Private'}</span>
            </button>
          </div>

          {/* Live Combat Trial Arena Stage */}
          <Card variant="base" padding="md" className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Swords size={16} className="text-amber-400" aria-hidden="true" />
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    {activeTab === 'DPS_30S' ? 'Training Target Dummy' : 'Boss Speedrun Trial'}
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeTab === 'DPS_30S' ? '30s DPS Burst Benchmark' : 'Time-to-kill Challenge'}
                  </span>
                </div>
              </div>

              {!isPlaying ? (
                <Button size="sm" variant="accent" onClick={startTrial}>
                  <Play size={12} className="mr-1 fill-current" aria-hidden="true" />
                  <span>Start</span>
                </Button>
              ) : (
                <span className="text-xs font-mono font-bold text-amber-400">
                  {activeTab === 'DPS_30S' ? `${trialTimeLeft}s remaining` : `${speedrunTimer}s`}
                </span>
              )}
            </div>

            {/* Combat Metrics Bar */}
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
              <div className="bg-slate-900 py-1.5 px-1 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block uppercase">Live DPS</span>
                <span className="text-amber-400 font-bold text-xs tabular-nums">{liveDps.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900 py-1.5 px-1 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block uppercase">Peak DPS</span>
                <span className="text-cyan-300 font-bold text-xs tabular-nums">{peakDps.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900 py-1.5 px-1 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block uppercase">Total Dmg</span>
                <span className="text-purple-300 font-bold text-xs tabular-nums">{totalDamage.toLocaleString()}</span>
              </div>
            </div>

            {/* Boss HP Bar for Speedrun */}
            {activeTab === 'BOSS_SPEEDRUN' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Target HP:</span>
                  <span className="text-rose-400 font-bold tabular-nums">
                    {bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Leaderboard Section */}
          <div className="space-y-1.5 max-h-[32vh] overflow-y-auto pr-0.5">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-1.5">
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <Crown size={14} className="text-amber-400" aria-hidden="true" />
                <span>Realm Leaderboard</span>
              </span>
              <button
                type="button"
                onClick={fetchLeaderboard}
                aria-label="Refresh leaderboard"
                className="hover:text-white transition p-1"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
              </button>
            </div>

            {loading ? (
              <div className="py-6 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading rankings...</span>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No records submitted yet this season.
              </div>
            ) : (
              leaderboard.map((entry, idx) => {
                const rank = entry.rank || idx + 1;

                return (
                  <Card
                    key={entry.userId + '-' + idx}
                    variant="raised"
                    padding="sm"
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 text-center font-mono font-bold text-xs text-amber-400 shrink-0">
                        #{rank}
                      </span>

                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-100 truncate">{entry.username}</h5>
                        <span className="text-xs text-slate-400 font-mono tabular-nums">
                          {activeTab === 'DPS_30S'
                            ? `${entry.totalDamage.toLocaleString()} total damage`
                            : `${entry.timeTakenSec}s clear time`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-300 tabular-nums">
                        {activeTab === 'DPS_30S' ? `${entry.score.toLocaleString()} DPS` : `${entry.score}s`}
                      </span>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleInspectPlayer(entry.userId)}
                      >
                        <Sparkles size={12} className="mr-1 text-purple-400" aria-hidden="true" />
                        <span>Inspect</span>
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </ModalShell>

      {/* Inspect Build Modal */}
      <InspectBuildModal
        isOpen={inspectOpen}
        onClose={() => setInspectOpen(false)}
        data={inspectData}
      />
    </>
  );
};
