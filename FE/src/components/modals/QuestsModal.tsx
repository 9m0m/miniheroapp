'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { questApi } from '@/services/questApi';
import { QuestOverviewResponse, QuestType, QuestDto, MilestoneRewardDto } from '@/types/quest.types';
import { X, Award, CheckCircle2, Sparkles, Coins, Gem, Hammer, Gift, Calendar, Flame } from 'lucide-react';

interface QuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({ isOpen, onClose }) => {
  const { userId, addGold, addGems, addFloatingText } = useGameStore();
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

  if (!isOpen) return null;

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
      addFloatingText(`+${quest.activityPoints} Activity Pts!`, 180, 100, '#38BDF8', true);
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
      addFloatingText(`🎉 Milestone ${milestone.milestoneIndex} Claimed!`, 180, 80, '#F59E0B', true);
    } catch (err) {
      console.error('Failed to claim milestone:', err);
    } finally {
      setClaimingMilestone(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[390px] bg-[#0D111A] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-[#131B2A] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Quest Chronicles</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold">
                  6 MILESTONES
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Complete bounties & claim continuous milestone chests</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pt-3 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('DAILY')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              activeTab === 'DAILY'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Quests (120 Pts)</span>
          </button>

          <button
            onClick={() => setActiveTab('WEEKLY')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              activeTab === 'WEEKLY'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-md shadow-purple-500/20'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Weekly Quests (600 Pts)</span>
          </button>
        </div>

        {/* 6 Milestone Track Card */}
        <div className="p-4">
          <div className="bg-[#121824] border border-slate-800/90 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeTab === 'DAILY' ? 'Daily Progress Track' : 'Weekly Season Track'}</span>
              </span>
              <span className="font-mono font-black text-amber-400 text-xs">
                {currentPoints} / {maxPoints} Pts ({progressPercent}%)
              </span>
            </div>

            {/* Progress Bar with 6 Milestones */}
            <div className="relative w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700 p-[1px]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeTab === 'DAILY'
                    ? 'bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500'
                    : 'bg-gradient-to-r from-purple-500 via-pink-400 to-amber-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* 6 Milestone Chest Buttons */}
            <div className="grid grid-cols-6 gap-1 pt-1">
              {currentMilestones.map((m) => {
                const isReady = m.canClaim;
                const isClaimed = m.isClaimed;

                return (
                  <button
                    key={m.milestoneIndex}
                    onClick={() => handleClaimMilestone(m)}
                    disabled={!isReady || isClaimed}
                    className={`relative py-1.5 px-0.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isClaimed
                        ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-400 opacity-80'
                        : isReady
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30 animate-bounce'
                        : 'bg-[#151C2A] border-slate-800 text-slate-500'
                    }`}
                    title={`${m.pointsRequired} Pts: +${m.goldReward} Gold, +${m.gemsReward} Gems${m.itemRewardName ? ', ' + m.itemRewardName : ''}`}
                  >
                    <span className="text-base">{isClaimed ? '✓' : m.icon}</span>
                    <span className="text-[9px] font-mono font-bold mt-0.5">{m.pointsRequired}p</span>
                    {isReady && !isClaimed && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quests List */}
        <div className="px-4 pb-4 overflow-y-auto space-y-2.5 flex-1 max-h-[46vh]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading quests...</span>
            </div>
          ) : currentQuests.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No quests found. Check back tomorrow!
            </div>
          ) : (
            currentQuests.map((quest) => {
              const progressRatio = Math.min(1, quest.currentCount / Math.max(1, quest.targetCount));
              const isReady = quest.isCompleted && !quest.isClaimed;

              return (
                <div
                  key={quest.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                    quest.isClaimed
                      ? 'bg-[#111622]/60 border-slate-800/60 opacity-60'
                      : isReady
                      ? 'bg-gradient-to-r from-[#172033] to-[#1F1833] border-blue-500/50 shadow-md shadow-blue-500/10'
                      : 'bg-[#141B28] border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-xl flex-shrink-0">{quest.icon || '⚔️'}</span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 truncate">{quest.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{quest.description}</p>
                      </div>
                    </div>

                    {/* Claim Button / Status Badge */}
                    {quest.isClaimed ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30 font-bold flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Claimed</span>
                      </span>
                    ) : isReady ? (
                      <button
                        onClick={() => handleClaimQuest(quest)}
                        disabled={claimingId === quest.id}
                        className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs shadow-md shadow-yellow-500/20 active:scale-95 transition flex-shrink-0"
                      >
                        {claimingId === quest.id ? 'Claiming...' : `Claim +${quest.activityPoints}p`}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-lg font-mono flex-shrink-0">
                        {quest.currentCount}/{quest.targetCount}
                      </span>
                    )}
                  </div>

                  {/* Rewards & Progress Track */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">+{quest.activityPoints} Pts</span>
                      {quest.goldReward > 0 && (
                        <span className="flex items-center gap-0.5 text-yellow-400 font-mono">
                          <Coins className="w-3 h-3" />
                          <span>+{quest.goldReward.toLocaleString()}</span>
                        </span>
                      )}
                      {quest.gemsReward > 0 && (
                        <span className="flex items-center gap-0.5 text-cyan-400 font-mono">
                          <Gem className="w-3 h-3" />
                          <span>+{quest.gemsReward}</span>
                        </span>
                      )}
                      {quest.stonesReward > 0 && (
                        <span className="flex items-center gap-0.5 text-purple-400 font-mono">
                          <Hammer className="w-3 h-3" />
                          <span>+{quest.stonesReward}</span>
                        </span>
                      )}
                    </div>

                    {!quest.isClaimed && (
                      <div className="w-20 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all"
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
    </div>
  );
};
