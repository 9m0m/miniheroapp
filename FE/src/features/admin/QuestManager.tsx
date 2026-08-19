'use client';

import React, { useEffect, useState } from 'react';
import { questApi } from '@/services/questApi';
import { QuestTemplateEntity, QuestType, QuestActionType } from '@/types/quest.types';
import { Award, Plus, Edit2, Trash2, CheckCircle, XCircle, Sparkles, RefreshCw, Save, X, Calendar, Flame } from 'lucide-react';

const ACTION_TYPE_LABELS: Record<QuestActionType, string> = {
  CHEST_OPEN: '🎁 Open Loot Chest',
  TRIAL_RUN: '🎯 Arena Trial Run (DPS / Speedrun)',
};

export const QuestManager: React.FC = () => {
  const [templates, setTemplates] = useState<QuestTemplateEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<QuestType | 'ALL'>('ALL');
  const [editingQuest, setEditingQuest] = useState<Partial<QuestTemplateEntity> | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await questApi.getAllTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load quest templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSaveQuest = async () => {
    if (!editingQuest || !editingQuest.title) return;
    try {
      setSaving(true);
      if (editingQuest.id && templates.some((t) => t.id === editingQuest.id)) {
        await questApi.updateTemplate(editingQuest.id, editingQuest);
      } else {
        await questApi.createTemplate(editingQuest);
      }
      setEditingQuest(null);
      await fetchTemplates();
    } catch (err) {
      console.error('Failed to save quest:', err);
      alert('Failed to save quest!');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuest = async (id: string) => {
    if (!confirm(`Are you sure you want to delete quest: ${id}?`)) return;
    try {
      await questApi.deleteTemplate(id);
      await fetchTemplates();
    } catch (err) {
      console.error('Failed to delete quest:', err);
    }
  };

  const handleToggleActive = async (quest: QuestTemplateEntity) => {
    try {
      await questApi.updateTemplate(quest.id, { ...quest, isActive: !quest.isActive });
      await fetchTemplates();
    } catch (err) {
      console.error('Failed to toggle quest:', err);
    }
  };

  const filteredQuests = templates.filter((q) => filterType === 'ALL' || q.questType === filterType);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
              <span>Dynamic Quests & Bounty Configurator</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                LIVEOPS ENGINE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Configure daily & weekly quests, action targets, and activity milestone rewards without code changes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTemplates}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>

          <button
            onClick={() =>
              setEditingQuest({
                title: '',
                description: '',
                icon: '🎁',
                questType: 'DAILY',
                actionType: 'CHEST_OPEN',
                targetCount: 2,
                activityPoints: 20,
                goldReward: 500,
                gemsReward: 10,
                stonesReward: 0,
                isActive: true,
                sortOrder: templates.length + 1,
              })
            }
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Quest</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Quests ({templates.length})
          </button>
          <button
            onClick={() => setFilterType('DAILY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterType === 'DAILY'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Quests ({templates.filter((t) => t.questType === 'DAILY').length})</span>
          </button>
          <button
            onClick={() => setFilterType('WEEKLY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filterType === 'WEEKLY'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Weekly Quests ({templates.filter((t) => t.questType === 'WEEKLY').length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Active: <strong className="text-emerald-400">{templates.filter((t) => t.isActive).length}</strong> / {templates.length}
        </span>
      </div>

      {/* Quests Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuests.map((quest) => (
          <div
            key={quest.id}
            className={`bg-[#0F141E]/90 border rounded-2xl p-4 shadow-lg flex flex-col justify-between gap-3 transition-all ${
              quest.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-red-900/40 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{quest.icon || '⚔️'}</span>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{quest.title}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          quest.questType === 'DAILY'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {quest.questType}
                      </span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {quest.id}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleActive(quest)}
                  className={`p-1.5 rounded-lg border transition ${
                    quest.isActive
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                  }`}
                  title={quest.isActive ? 'Active (Click to disable)' : 'Disabled (Click to enable)'}
                >
                  {quest.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-xs text-slate-300 mb-3">{quest.description}</p>

              <div className="bg-[#141A26] p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Action:</span>
                  <span className="text-cyan-300 font-medium">{ACTION_TYPE_LABELS[quest.actionType] || quest.actionType}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Target Count:</span>
                  <span className="text-white font-mono font-bold">{quest.targetCount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Activity Points:</span>
                  <span className="text-amber-400 font-mono font-bold">+{quest.activityPoints} Pts</span>
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center gap-2 mt-2 text-[10px] font-mono">
                {quest.goldReward > 0 && <span className="text-yellow-400 font-bold">+{quest.goldReward.toLocaleString()}g</span>}
                {quest.gemsReward > 0 && <span className="text-cyan-400 font-bold">+{quest.gemsReward}💎</span>}
                {quest.stonesReward > 0 && <span className="text-purple-400 font-bold">+{quest.stonesReward}🔨</span>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingQuest({ ...quest })}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDeleteQuest(quest.id)}
                className="px-3 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1 transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Quest Modal */}
      {editingQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0F141E] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 bg-[#161C28] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{editingQuest.id ? `Edit Quest (${editingQuest.id})` : 'Create New Quest'}</span>
              </h3>
              <button onClick={() => setEditingQuest(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 max-h-[70vh]">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Quest Title</label>
                  <input
                    type="text"
                    value={editingQuest.title || ''}
                    onChange={(e) => setEditingQuest({ ...editingQuest, title: e.target.value })}
                    className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={editingQuest.icon || '⚔️'}
                    onChange={(e) => setEditingQuest({ ...editingQuest, icon: e.target.value })}
                    className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-center text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingQuest.description || ''}
                  onChange={(e) => setEditingQuest({ ...editingQuest, description: e.target.value })}
                  className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Quest Type</label>
                  <select
                    value={editingQuest.questType || 'DAILY'}
                    onChange={(e) => setEditingQuest({ ...editingQuest, questType: e.target.value as QuestType })}
                    className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="DAILY">DAILY (120 Max Pts)</option>
                    <option value="WEEKLY">WEEKLY (600 Max Pts)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Action Type</label>
                  <select
                    value={editingQuest.actionType || 'CHEST_OPEN'}
                    onChange={(e) => setEditingQuest({ ...editingQuest, actionType: e.target.value as QuestActionType })}
                    className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {Object.entries(ACTION_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Count</label>
                  <input
                    type="number"
                    min="1"
                    value={editingQuest.targetCount || 1}
                    onChange={(e) => setEditingQuest({ ...editingQuest, targetCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Activity Points</label>
                  <input
                    type="number"
                    min="1"
                    value={editingQuest.activityPoints || 20}
                    onChange={(e) => setEditingQuest({ ...editingQuest, activityPoints: parseInt(e.target.value) || 20 })}
                    className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono"
                  />
                </div>
              </div>

              {/* Rewards */}
              <div className="border-t border-slate-800 pt-3">
                <label className="block text-xs font-bold text-slate-300 mb-2">Rewards</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-yellow-400 block mb-1">Gold</label>
                    <input
                      type="number"
                      value={editingQuest.goldReward || 0}
                      onChange={(e) => setEditingQuest({ ...editingQuest, goldReward: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2 py-1 text-xs text-yellow-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-cyan-400 block mb-1">Gems</label>
                    <input
                      type="number"
                      value={editingQuest.gemsReward || 0}
                      onChange={(e) => setEditingQuest({ ...editingQuest, gemsReward: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2 py-1 text-xs text-cyan-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-purple-400 block mb-1">Stones</label>
                    <input
                      type="number"
                      value={editingQuest.stonesReward || 0}
                      onChange={(e) => setEditingQuest({ ...editingQuest, stonesReward: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2 py-1 text-xs text-purple-300 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-800 bg-[#161C28] flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingQuest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuest}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Quest'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
