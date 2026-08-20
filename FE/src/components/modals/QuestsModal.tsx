'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { questApi } from '@/services/questApi';
import { QuestOverviewResponse, QuestType, QuestDto, MilestoneRewardDto } from '@/types/quest.types';
import { ModalShell } from '../ui/ModalShell';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Award,
  CheckCircle2,
  Coins,
  Gem,
  Hammer,
  Calendar,
  Flame,
  Gift,
  Swords,
} from 'lucide-react';

interface QuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({ isOpen, onClose }) => {
  const userId = useGameStore((state) => state.userId);
  const addGold = useGameStore((state) => state.addGold);
  const addGems = useGameStore((state) => state.addGems);
  const addFloatingText = useGameStore((state) => state.addFloatingText);

  const [activeTab, setActiveTab] = useState<QuestType>('DAILY');
  const [overview, setOverview] = useState<QuestOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimingMilestone, setClaimingMilestone] = useState<number | null>(null);

  const fetchQuests = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await questApi.getQuestOverview(userId);
      setOverview(data);
    } catch (err) {
      console.error('Failed to load quests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQuests();
    }
  }, [isOpen, userId]);

  const currentQuests: QuestDto[] = activeTab === 'DAILY' ? (overview?.dailyQuests || []) : (overview?.weeklyQuests || []);
  const currentPoints = activeTab === 'DAILY' ? (overview?.dailyActivityPoints || 0) : (overview?.weeklyActivityPoints || 0);
  const maxPoints = activeTab === 'DAILY' ? 120 : 600;
  const currentMilestones: MilestoneRewardDto[] = activeTab === 'DAILY' ? (overview?.dailyMilestones || []) : (overview?.weeklyMilestones || []);
  const progressPercent = Math.min(100, Math.round((currentPoints / maxPoints) * 100));

  const handleClaimQuest = async (quest: QuestDto) => {
    if (!userId || quest.isClaimed || !quest.isCompleted || claimingId) return;
    try {
      setClaimingId(quest.id);
      const updated = await questApi.claimQuest(userId, quest.id);
      setOverview(updated);
      if (quest.goldReward > 0) addGold(quest.goldReward);
      if (quest.gemsReward > 0) addGems(quest.gemsReward);
      addFloatingText(`+${quest.activityPoints} Activity Points!`, 180, 100, '#38BDF8', true);
    } catch (err) {
      console.error('Failed to claim quest:', err);
    } finally {
      setClaimingId(null);
    }
  };

  const handleClaimMilestone = async (milestone: MilestoneRewardDto) => {
    if (!userId || milestone.isClaimed || !milestone.canClaim || claimingMilestone !== null) return;
    try {
      setClaimingMilestone(milestone.milestoneIndex);
      const updated = await questApi.claimMilestone(userId, activeTab, milestone.milestoneIndex);
      setOverview(updated);
      if (milestone.goldReward > 0) addGold(milestone.goldReward);
      if (milestone.gemsReward > 0) addGems(milestone.gemsReward);
      addFloatingText(`Milestone ${milestone.milestoneIndex} Claimed!`, 180, 80, '#F59E0B', true);
    } catch (err) {
      console.error('Failed to claim milestone:', err);
    } finally {
      setClaimingMilestone(null);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={<Award size={18} className="text-amber-400" />}
      title="Quest Chronicles"
      description="Complete tactical bounties and claim milestone chests"
    >
      <div className="space-y-3">
        {/* Tab Navigation */}
        <div role="tablist" aria-label="Quest categories" className="flex items-center gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'DAILY'}
            onClick={() => setActiveTab('DAILY')}
            className={`flex-1 py-2 rounded-md text-xs font-black transition flex items-center justify-center gap-1.5 border min-h-[40px] cursor-pointer ${
              activeTab === 'DAILY'
                ? 'btn-game-cyan shadow-sm'
                : 'bg-[#080b12] text-slate-400 border-[#1e293b] hover:text-slate-200'
            }`}
          >
            <Calendar size={14} aria-hidden="true" />
            <span>Daily (120 Pts)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'WEEKLY'}
            onClick={() => setActiveTab('WEEKLY')}
            className={`flex-1 py-2 rounded-md text-xs font-black transition flex items-center justify-center gap-1.5 border min-h-[40px] cursor-pointer ${
              activeTab === 'WEEKLY'
                ? 'btn-game-amber shadow-sm'
                : 'bg-[#080b12] text-slate-400 border-[#1e293b] hover:text-slate-200'
            }`}
          >
            <Flame size={14} aria-hidden="true" />
            <span>Weekly (600 Pts)</span>
          </button>
        </div>

        {/* Milestone Track Card */}
        <div className="space-y-2 p-3 bg-[#0e131d] border border-[#1e293b] rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Gift size={14} className="text-amber-400" aria-hidden="true" />
              <span>{activeTab === 'DAILY' ? 'Daily Milestone Track' : 'Weekly Season Track'}</span>
            </span>
            <span className="font-mono font-black text-amber-300 text-xs tabular-nums">
              {currentPoints} / {maxPoints} Pts ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Milestone progression"
            className="w-full bg-[#080b12] h-2 rounded-full overflow-hidden border border-[#1e293b]"
          >
            <div
              className="bg-gradient-to-r from-cyan-500 to-amber-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Milestone Chest Buttons */}
          <div className="grid grid-cols-6 gap-1 pt-0.5">
            {currentMilestones.map((m) => {
              const isReady = m.canClaim;
              const isClaimed = m.isClaimed;

              return (
                <button
                  type="button"
                  key={m.milestoneIndex}
                  onClick={() => handleClaimMilestone(m)}
                  disabled={!isReady || isClaimed}
                  className={`py-1.5 px-1 rounded-md border flex flex-col items-center justify-center transition min-h-[44px] cursor-pointer ${
                    isClaimed
                      ? 'bg-[#080b12] border-emerald-500/40 text-emerald-400 opacity-60'
                      : isReady
                      ? 'btn-game-amber shadow-sm font-black'
                      : 'bg-[#080b12] border-[#1e293b] text-slate-600'
                  }`}
                  title={`${m.pointsRequired} Pts: +${m.goldReward} Gold, +${m.gemsReward} Gems`}
                >
                  <Gift size={13} aria-hidden="true" />
                  <span className="text-[10px] font-mono font-bold tabular-nums mt-0.5">{m.pointsRequired}p</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quests List */}
        <div className="space-y-1.5 max-h-[38vh] overflow-y-auto pr-0.5">
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading bounties...</span>
            </div>
          ) : currentQuests.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs bg-[#0e131d] rounded-lg border border-[#1e293b]">
              No active bounties. Check back at daily reset!
            </div>
          ) : (
            currentQuests.map((quest) => {
              const progressRatio = Math.min(1, quest.currentCount / Math.max(1, quest.targetCount));
              const isReady = quest.isCompleted && !quest.isClaimed;

              return (
                <div
                  key={quest.id}
                  className={`flex flex-col gap-1.5 p-2.5 bg-[#0e131d] border border-[#1e293b] rounded-lg shadow-sm ${quest.isClaimed ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Swords size={14} className="text-cyan-400 shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 truncate">{quest.title}</h4>
                        <p className="text-[11px] text-slate-400 truncate">{quest.description}</p>
                      </div>
                    </div>

                    {/* Claim Button / Status Badge */}
                    {quest.isClaimed ? (
                      <Badge variant="success" size="xs">
                        <CheckCircle2 size={10} aria-hidden="true" />
                        <span>Claimed</span>
                      </Badge>
                    ) : isReady ? (
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => handleClaimQuest(quest)}
                        isLoading={claimingId === quest.id}
                        className="text-xs font-black uppercase tracking-wider"
                      >
                        Claim +{quest.activityPoints}p
                      </Button>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-[#080b12] px-2 py-0.5 rounded border border-[#1e293b] font-mono tabular-nums shrink-0">
                        {quest.currentCount}/{quest.targetCount}
                      </span>
                    )}
                  </div>

                  {/* Rewards Row */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1e293b]">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-amber-300 font-bold tabular-nums font-sans">+{quest.activityPoints} Pts</span>
                      {quest.goldReward > 0 && (
                        <span className="flex items-center gap-0.5 text-amber-400 font-bold tabular-nums">
                          <Coins size={11} aria-hidden="true" />
                          <span>+{quest.goldReward.toLocaleString()}</span>
                        </span>
                      )}
                      {quest.gemsReward > 0 && (
                        <span className="flex items-center gap-0.5 text-cyan-400 font-bold tabular-nums">
                          <Gem size={11} aria-hidden="true" />
                          <span>+{quest.gemsReward}</span>
                        </span>
                      )}
                      {quest.stonesReward > 0 && (
                        <span className="flex items-center gap-0.5 text-purple-400 font-bold tabular-nums">
                          <Hammer size={11} aria-hidden="true" />
                          <span>+{quest.stonesReward}</span>
                        </span>
                      )}
                    </div>

                    {!quest.isClaimed && (
                      <div className="w-16 bg-[#080b12] h-1.5 rounded-full overflow-hidden border border-[#1e293b]">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all duration-200"
                          style={{ width: `${Math.round(progressRatio * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </ModalShell>
  );
};

export default QuestsModal;
