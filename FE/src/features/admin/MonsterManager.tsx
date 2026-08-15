'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/services/adminApi';
import { MonsterConfig } from '@/types/admin.types';
import { Plus, Trash2, Save, Skull, Sparkles, CheckCircle2 } from 'lucide-react';
import { ElementalType } from '@/types/game.types';

export default function MonsterManager() {
  const [monsters, setMonsters] = useState<MonsterConfig[]>([]);
  const [selectedMob, setSelectedMob] = useState<MonsterConfig | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMonsters = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllMonsters();
      setMonsters(data);
      if (data.length > 0) setSelectedMob(data[0]);
    } catch (err) {
      console.error('Failed to load monsters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMonsters();
  }, []);

  const handleCreateNew = () => {
    const newMob: MonsterConfig = {
      id: `mob_custom_${Date.now().toString().slice(-4)}`,
      name: 'New Custom Monster',
      category: 'NORMAL',
      elementalType: 'PHYSICAL',
      baseHp: 300,
      baseAtk: 20,
      baseArmor: 25,
      attackSpeed: 1.0,
      iconKey: '👾',
      isBoss: false,
      goldReward: 30,
    };
    setSelectedMob(newMob);
  };

  const handleSave = async () => {
    if (!selectedMob) return;
    try {
      const saved = await adminApi.saveMonster(selectedMob);
      setSaveStatus(`Saved ${saved.name}!`);
      loadMonsters();
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (err) {
      console.error('Failed to save monster:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this monster template?')) return;
    try {
      await adminApi.deleteMonster(id);
      loadMonsters();
    } catch (err) {
      console.error('Failed to delete monster:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
      {/* Monster Pool List */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
            <Skull size={16} className="text-rose-400" />
            <span>Monster Pool ({monsters.length})</span>
          </h3>

          <button
            onClick={handleCreateNew}
            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1 text-[11px] transition"
          >
            <Plus size={13} />
            <span>Add Mob</span>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[600px] space-y-1.5 custom-scrollbar pr-1">
          {monsters.map((mob) => (
            <div
              key={mob.id}
              onClick={() => setSelectedMob(mob)}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                selectedMob?.id === mob.id
                  ? 'bg-rose-600/20 border-rose-500 ring-1 ring-rose-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{mob.iconKey}</span>
                <div>
                  <div className="font-bold text-slate-200">{mob.name}</div>
                  <div className="text-[10px] text-slate-500">
                    HP: {mob.baseHp} • ATK: {mob.baseAtk} • {mob.elementalType}
                  </div>
                </div>
              </div>

              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  mob.isBoss
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {mob.isBoss ? 'BOSS 👑' : mob.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monster Details Editor */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
            <Sparkles size={16} className="text-rose-400" />
            <span>Monster Template Editor</span>
          </h3>

          <div className="flex items-center gap-2">
            {saveStatus && (
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 size={13} />
                <span>{saveStatus}</span>
              </span>
            )}

            {selectedMob && (
              <button
                onClick={() => handleDelete(selectedMob.id)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition flex items-center gap-1"
                title="Delete template"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {selectedMob ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">ID Key:</label>
                <input
                  type="text"
                  value={selectedMob.id}
                  onChange={(e) => setSelectedMob({ ...selectedMob, id: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Display Name:</label>
                <input
                  type="text"
                  value={selectedMob.name}
                  onChange={(e) => setSelectedMob({ ...selectedMob, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Icon (Emoji):</label>
                <input
                  type="text"
                  value={selectedMob.iconKey}
                  onChange={(e) => setSelectedMob({ ...selectedMob, iconKey: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Category:</label>
                <select
                  value={selectedMob.category}
                  onChange={(e) => setSelectedMob({ ...selectedMob, category: e.target.value })}
                  className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="ELITE">ELITE</option>
                  <option value="BOSS">BOSS</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Elemental Type:</label>
                <select
                  value={selectedMob.elementalType}
                  onChange={(e) => setSelectedMob({ ...selectedMob, elementalType: e.target.value as ElementalType })}
                  className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="PHYSICAL">PHYSICAL</option>
                  <option value="FIRE">FIRE</option>
                  <option value="COLD">COLD</option>
                  <option value="LIGHTNING">LIGHTNING</option>
                  <option value="CHAOS">CHAOS</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Is Stage Boss?</label>
                <select
                  value={selectedMob.isBoss ? 'true' : 'false'}
                  onChange={(e) => setSelectedMob({ ...selectedMob, isBoss: e.target.value === 'true' })}
                  className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  <option value="false">No (Normal Mob)</option>
                  <option value="true">Yes (Stage Boss 👑)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Gold Reward:</label>
                <input
                  type="number"
                  value={selectedMob.goldReward}
                  onChange={(e) => setSelectedMob({ ...selectedMob, goldReward: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Base HP:</label>
                <input
                  type="number"
                  value={selectedMob.baseHp}
                  onChange={(e) => setSelectedMob({ ...selectedMob, baseHp: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Base ATK:</label>
                <input
                  type="number"
                  value={selectedMob.baseAtk}
                  onChange={(e) => setSelectedMob({ ...selectedMob, baseAtk: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Base Armor:</label>
                <input
                  type="number"
                  value={selectedMob.baseArmor}
                  onChange={(e) => setSelectedMob({ ...selectedMob, baseArmor: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Attack Speed:</label>
                <input
                  type="number"
                  step={0.1}
                  value={selectedMob.attackSpeed}
                  onChange={(e) => setSelectedMob({ ...selectedMob, attackSpeed: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 mt-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white font-bold hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/25"
            >
              <Save size={15} />
              <span>SAVE MONSTER TEMPLATE</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
