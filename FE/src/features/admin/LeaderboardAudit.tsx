'use client';

import React, { useEffect, useState } from 'react';
import { trialApi } from '@/services/trialApi';
import { TrialLeaderboardEntry, BuildInspectResponse } from '@/types/trial.types';
import { InspectBuildModal } from '@/components/modals/InspectBuildModal';
import { ShieldAlert, RefreshCw, Sparkles, CheckCircle2, Lock, Eye, Search, AlertTriangle } from 'lucide-react';

export const LeaderboardAudit: React.FC = () => {
  const [records, setRecords] = useState<TrialLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inspectData, setInspectData] = useState<BuildInspectResponse | null>(null);
  const [inspectOpen, setInspectOpen] = useState<boolean>(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await trialApi.getAdminAuditList();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load audit records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSuperInspect = async (targetUserId: string) => {
    try {
      const data = await trialApi.inspectBuild(targetUserId);
      setInspectData(data);
      setInspectOpen(true);
    } catch (err) {
      console.error('Failed to super inspect player:', err);
    }
  };

  const filtered = records.filter(
    (r) =>
      r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
              <span>Trial Arena Anti-Cheat & LiveOps Audit</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold">
                SUPERADMIN ACCESS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Audit leaderboard scores, inspect private champion builds, and verify combat legitimacy.
            </p>
          </div>
        </div>

        <button
          onClick={fetchRecords}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Audit Records</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Player Name or User UUID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0F141E]/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141B28] border-b border-slate-800 text-slate-400 font-mono">
            <tr>
              <th className="py-3 px-4">Player</th>
              <th className="py-3 px-4">Score (DPS / TTK)</th>
              <th className="py-3 px-4">Peak DPS</th>
              <th className="py-3 px-4">Total Damage</th>
              <th className="py-3 px-4">Privacy Setting</th>
              <th className="py-3 px-4">Recorded Date</th>
              <th className="py-3 px-4 text-right">Anti-Cheat Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Loading audit records...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No trial audit records found.
                </td>
              </tr>
            ) : (
              filtered.map((record) => (
                <tr key={record.userId + '-' + record.recordedAt} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <div className="font-sans font-bold text-white text-xs">{record.username}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{record.userId}</div>
                  </td>
                  <td className="py-3 px-4 text-amber-400 font-black">
                    {record.score.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-cyan-300 font-bold">
                    {record.dpsPeak.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-purple-300">
                    {record.totalDamage.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    {record.isBuildPublic ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-sans font-bold">
                        <Eye className="w-3 h-3" />
                        <span>Public</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-sans font-bold">
                        <Lock className="w-3 h-3" />
                        <span>Private</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[10px]">
                    {new Date(record.recordedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSuperInspect(record.userId)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-sans text-xs font-bold shadow-md shadow-red-500/20 flex items-center gap-1 ml-auto active:scale-95 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Super-Inspect Build</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inspect Modal */}
      <InspectBuildModal
        isOpen={inspectOpen}
        onClose={() => setInspectOpen(false)}
        data={inspectData}
      />
    </div>
  );
};
