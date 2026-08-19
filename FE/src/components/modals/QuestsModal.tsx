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
      description="Complete bounties and claim milestone rewards"
    >
      <div className="space-y-3">
        {/* Tab Navigation */}
        <div role="tablist" aria-label="Quest categories" className="flex items-center gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'DAILY'}
            onClick={() => setActiveTab('DAILY')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border min-h-[44px] ${
              activeTab === 'DAILY'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
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
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border min-h-[44px] ${
              activeTab === 'WEEKLY'
                ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Flame size={14} aria-hidden="true" />
            <span>Weekly (600 Pts)</span>
          </button>
        </div>

        {/* Milestone Track Card */}
        <Card variant="base" padding="md" className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Gift size={14} className="text-amber-400" aria-hidden="true" />
              <span>{activeTab === 'DAILY' ? 'Daily Progress' : 'Weekly Season Progress'}</span>
            </span>
            <span className="font-mono font-bold text-amber-300 text-xs tabular-nums">
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
            className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800"
          >
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Milestone Chest Buttons */}
          <div className="grid grid-cols-6 gap-1 pt-1">
            {currentMilestones.map((m) => {
              const isReady = m.canClaim;
              const isClaimed = m.isClaimed;

              return (
                <button
                  type="button"
                  key={m.milestoneIndex}
                  onClick={() => handleClaimMilestone(m)}
                  disabled={!isReady || isClaimed}
                  className={`py-1.5 px-1 rounded-lg border flex flex-col items-center justify-center transition min-h-[44px] ${
                    isClaimed
                      ? 'bg-slate-900 border-emerald-500/40 text-emerald-400 opacity-70'
                      : isReady
                      ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                  title={`${m.pointsRequired} Pts: +${m.goldReward} Gold, +${m.gemsReward} Gems`}
                >
                  <Gift size={14} aria-hidden="true" />
                  <span className="text-xs font-mono font-bold tabular-nums mt-0.5">{m.pointsRequired}p</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Quests List */}
        <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-0.5">
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading quests...</span>
            </div>
          ) : currentQuests.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No quests active. Check back tomorrow!
            </div>
          ) : (
            currentQuests.map((quest) => {
              const progressRatio = Math.min(1, quest.currentCount / Math.max(1, quest.targetCount));
              const isReady = quest.isCompleted && !quest.isClaimed;

              return (
                <Card
                  key={quest.id}
                  variant="raised"
                  padding="sm"
                  className={`flex flex-col gap-2 ${quest.isClaimed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Swords size={15} className="text-cyan-400 shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 truncate">{quest.title}</h4>
                        <p className="text-xs text-slate-400 truncate">{quest.description}</p>
                      </div>
                    </div>

                    {/* Claim Button / Status Badge */}
                    {quest.isClaimed ? (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 size={11} aria-hidden="true" />
                        <span>Claimed</span>
                      </Badge>
                    ) : isReady ? (
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => handleClaimQuest(quest)}
                        isLoading={claimingId === quest.id}
                      >
                        Claim +{quest.activityPoints}p
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono tabular-nums shrink-0">
                        {quest.currentCount}/{quest.targetCount}
                      </span>
                    )}
                  </div>

                  {/* Rewards Row */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-300 font-bold tabular-nums">+{quest.activityPoints} Pts</span>
                      {quest.goldReward > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400 font-mono tabular-nums">
                          <Coins size={11} aria-hidden="true" />
                          <span>+{quest.goldReward.toLocaleString()}</span>
                        </span>
                      )}
                      {quest.gemsReward > 0 && (
                        <span className="flex items-center gap-1 text-cyan-400 font-mono tabular-nums">
                          <Gem size={11} aria-hidden="true" />
                          <span>+{quest.gemsReward}</span>
                        </span>
                      )}
                      {quest.stonesReward > 0 && (
                        <span className="flex items-center gap-1 text-purple-400 font-mono tabular-nums">
                          <Hammer size={11} aria-hidden="true" />
                          <span>+{quest.stonesReward}</span>
                        </span>
                      )}
                    </div>

                    {!quest.isClaimed && (
                      <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all duration-200"
                          style={{ width: `${Math.round(progressRatio * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </ModalShell>
  );
};
