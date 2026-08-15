'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Save,
  RefreshCw,
  Coins,
  Shield,
  Target,
  Flame,
  Heart,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { HeroClass, SkillConfig } from '@/types/game.types';

const HERO_CLASSES: { key: HeroClass; name: string; icon: string; theme: string }[] = [
  { key: 'WARRIOR', name: 'Warrior', icon: '⚔️', theme: 'border-red-500/40 text-red-400' },
  { key: 'RANGER', name: 'Archer', icon: '🏹', theme: 'border-emerald-500/40 text-emerald-400' },
  { key: 'MAGE', name: 'Wizard', icon: '🔮', theme: 'border-blue-500/40 text-blue-400' },
  { key: 'PRIEST', name: 'Priest', icon: '✨', theme: 'border-amber-500/40 text-amber-400' },
];

export default function SkillBalancer() {
  const [selectedClass, setSelectedClass] = useState<HeroClass>('WARRIOR');
  const [skills, setSkills] = useState<SkillConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [previewLevels, setPreviewLevels] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const list = await adminApi.getAllSkillConfigs();
      setSkills(list);
      const initialPrev: Record<string, number> = {};
      list.forEach((s) => {
        initialPrev[s.skillId] = 3;
      });
      setPreviewLevels(initialPrev);
    } catch (err: any) {
      showToast(err.message || 'Failed to load skill configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateSkill = async (skill: SkillConfig) => {
    setSavingId(skill.skillId);
    try {
      const updated = await adminApi.updateSkillConfig(skill.skillId, skill);
      setSkills((prev) => prev.map((s) => (s.skillId === updated.skillId ? updated : s)));
      showToast(`Saved skill config for: ${updated.name}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save skill', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleFieldChange = (skillId: string, field: keyof SkillConfig, value: any) => {
    setSkills((prev) =>
      prev.map((s) => {
        if (s.skillId === skillId) {
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  const classSkills = skills.filter((s) => s.heroClass === selectedClass);

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-lg border transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 shadow-emerald-950/50'
              : 'bg-red-950/90 border-red-500/50 text-red-300 shadow-red-950/50'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black tracking-wide text-white">HERO & SKILL TREE BALANCER</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Fine-tune gold upgrade curves and passive stat bonuses across 4 hero classes.
          </p>
        </div>

        <button
          onClick={fetchSkills}
          disabled={loading}
          className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Skills</span>
        </button>
      </div>

      {/* Hero Class Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {HERO_CLASSES.map((c) => {
          const isActive = selectedClass === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setSelectedClass(c.key)}
              className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/80 text-white shadow-lg shadow-amber-950/40'
                  : 'bg-[#0F141E]/60 border-slate-800 hover:bg-[#151C2A] text-slate-400'
              }`}
            >
              <span className="text-2xl">{c.icon}</span>
              <div>
                <div className="text-xs font-bold">{c.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">({c.key})</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Skill Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {classSkills.map((skill) => {
          const previewLvl = previewLevels[skill.skillId] || 1;
          const totalCostToLevel = Array.from({ length: previewLvl }, (_, i) => skill.baseGoldCost + skill.goldCostPerLevel * i).reduce(
            (acc, curr) => acc + curr,
            0
          );

          return (
            <div
              key={skill.skillId}
              className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between gap-4"
            >
              {/* Skill Card Header */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{skill.icon || '✨'}</span>
                    <div>
                      <h4 className="text-sm font-black text-white">{skill.name}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{skill.skillId}</span>
                    </div>
                  </div>

                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                    Max Lv.{skill.maxLevel}
                  </span>
                </div>

                {/* Description Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Skill Description</label>
                    <textarea
                      rows={2}
                      value={skill.description || ''}
                      onChange={(e) => handleFieldChange(skill.skillId, 'description', e.target.value)}
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bonus Description</label>
                    <input
                      type="text"
                      value={skill.bonusDescription || ''}
                      onChange={(e) => handleFieldChange(skill.skillId, 'bonusDescription', e.target.value)}
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Gold Cost Formulas */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Base Gold Cost</label>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={skill.baseGoldCost}
                        onChange={(e) => handleFieldChange(skill.skillId, 'baseGoldCost', parseInt(e.target.value) || 500)}
                        className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Cost Per Level (+Gold)</label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={skill.goldCostPerLevel}
                        onChange={(e) => handleFieldChange(skill.skillId, 'goldCostPerLevel', parseInt(e.target.value) || 500)}
                        className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Preview Box */}
              <div className="bg-[#141A26] border border-slate-700/60 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    Level Preview:
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: skill.maxLevel }, (_, i) => i + 1).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setPreviewLevels({ ...previewLevels, [skill.skillId]: lvl })}
                        className={`w-5 h-5 rounded text-[10px] font-mono font-bold transition-all ${
                          previewLvl === lvl
                            ? 'bg-amber-500 text-black shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 flex justify-between border-t border-slate-800 pt-1.5 font-mono">
                  <span>Cumulative Gold to Lv.{previewLvl}:</span>
                  <span className="text-amber-400 font-bold">{totalCostToLevel.toLocaleString()} Gold</span>
                </div>
              </div>

              {/* Action Save */}
              <button
                onClick={() => handleUpdateSkill(skill)}
                disabled={savingId === skill.skillId}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-xs font-bold text-white shadow-md shadow-orange-600/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {savingId === skill.skillId ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Skill ({skill.skillId})</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
