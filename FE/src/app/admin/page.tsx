'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Swords,
  Layers,
  Sparkles,
  Activity,
  Coins,
  Users,
  Database,
  RefreshCw,
  Sliders,
  Cpu,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { AdminDashboardStats } from '@/types/game.types';
import StageWaveEditor from '@/features/admin/StageWaveEditor';
import ItemBalancer from '@/features/admin/ItemBalancer';
import SkillBalancer from '@/features/admin/SkillBalancer';
import BattleSimulator from '@/features/admin/BattleSimulator';
import { QuestManager } from '@/features/admin/QuestManager';
import { LeaderboardAudit } from '@/features/admin/LeaderboardAudit';

type AdminTab = 'STAGES' | 'ITEMS' | 'SKILLS' | 'QUESTS' | 'AUDIT' | 'SIMULATOR';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('STAGES');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Users */}
        <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Players</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              {stats ? stats.totalUsers : '1'}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">● 1 Active Demo Account</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Master Item Templates */}
        <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Master Items</span>
            <div className="text-2xl font-black text-purple-400 font-mono mt-0.5">
              {stats ? stats.totalItemTemplates : '30+'}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">4 Classes + Universal</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Monster Templates */}
        <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monster Roster</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
              {stats ? stats.totalMonsterTemplates : '20'}
            </div>
            <span className="text-[10px] text-amber-400/80 font-medium">4 Worlds + 4 Bosses</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Swords className="w-5 h-5" />
          </div>
        </div>

        {/* Total Stages & Waves */}
        <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage Configuration</span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
              40 Stages
            </div>
            <span className="text-[10px] text-cyan-400/80 font-medium">1,240 Waves Live (31 waves/stage)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0F141E]/90 border border-slate-800 shadow-md overflow-x-auto">
        <button
          onClick={() => setActiveTab('STAGES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'STAGES'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>Stage & Wave Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('ITEMS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ITEMS'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Item & Drop Balancer</span>
        </button>

        <button
          onClick={() => setActiveTab('SKILLS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'SKILLS'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hero & Skill Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('QUESTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'QUESTS'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Quests & Bounties</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'AUDIT'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-4 h-4 text-rose-300" />
          <span>Anti-Cheat Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('SIMULATOR')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'SIMULATOR'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Battle Simulator</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="transition-all">
        {activeTab === 'STAGES' && <StageWaveEditor />}
        {activeTab === 'ITEMS' && <ItemBalancer />}
        {activeTab === 'SKILLS' && <SkillBalancer />}
        {activeTab === 'QUESTS' && <QuestManager />}
        {activeTab === 'AUDIT' && <LeaderboardAudit />}
        {activeTab === 'SIMULATOR' && <BattleSimulator />}
      </div>
    </div>
  );
}
