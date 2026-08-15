'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Filter,
  Edit3,
  Save,
  RefreshCw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Coins,
  TrendingUp,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { ItemRarity, ItemSlot, ItemTemplate, Stats } from '@/types/game.types';

const RARITY_COLORS: Record<ItemRarity, { bg: string; text: string; border: string }> = {
  COMMON: { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/30' },
  UNCOMMON: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  RARE: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  EPIC: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  LEGENDARY: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
};

export default function ItemBalancer() {
  const [items, setItems] = useState<ItemTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSlot, setSelectedSlot] = useState<string>('ALL');
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');

  const [editingItem, setEditingItem] = useState<ItemTemplate | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const list = await adminApi.getAllItemTemplates();
      setItems(list);
    } catch (err: any) {
      showToast(err.message || 'Failed to load item templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateItemTemplate(editingItem.id, editingItem);
      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditingItem(null);
      showToast(`Updated attributes for: ${updated.name}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save item template', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      selectedClass === 'ALL' ||
      (selectedClass === 'UNIVERSAL' ? !item.requiredClass : item.requiredClass === selectedClass);
    const matchesSlot = selectedSlot === 'ALL' || item.slot === selectedSlot;
    const matchesRarity = selectedRarity === 'ALL' || item.baseRarity === selectedRarity;

    return matchesSearch && matchesClass && matchesSlot && matchesRarity;
  });

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

      {/* Header & Controls */}
      <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-black tracking-wide text-white">MASTER ITEM & DROP BALANCER</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage base stats for 30+ Master Item Templates, iLvl growth scaling, and drop rates.
          </p>
        </div>

        <button
          onClick={fetchItems}
          disabled={loading}
          className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload ({items.length} items)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, ID..."
            className="w-full bg-[#161C28] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Classes</option>
            <option value="WARRIOR">Warrior</option>
            <option value="RANGER">Archer</option>
            <option value="MAGE">Wizard</option>
            <option value="PRIEST">Priest</option>
            <option value="UNIVERSAL">Universal Accessory</option>
          </select>
        </div>

        {/* Slot Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Slot:</span>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Slots</option>
            <option value="MAIN_HAND">Main Weapon</option>
            <option value="OFF_HAND">Off-Hand</option>
            <option value="HELMET">Helmet</option>
            <option value="ARMOR">Armor</option>
            <option value="BOOTS">Boots</option>
            <option value="RING">Ring</option>
            <option value="AMULET">Amulet / Necklace</option>
            <option value="CHARM">Talisman / Charm</option>
          </select>
        </div>

        {/* Rarity Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Rarity:</span>
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Rarities</option>
            <option value="COMMON">Common</option>
            <option value="UNCOMMON">Uncommon</option>
            <option value="RARE">Rare</option>
            <option value="EPIC">Epic</option>
            <option value="LEGENDARY">Legendary</option>
          </select>
        </div>
      </div>

      {/* Item Data Table */}
      <div className="bg-[#0F141E]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto max-h-[550px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#161C28] text-slate-400 border-b border-slate-700/80 z-10 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-3">Class / Slot</th>
                <th className="py-3 px-3">Rarity</th>
                <th className="py-3 px-3">Base ATK</th>
                <th className="py-3 px-3">Base Defense / HP</th>
                <th className="py-3 px-3">Crit / Speed</th>
                <th className="py-3 px-3">iLvl Growth</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => {
                const rarityStyle = RARITY_COLORS[item.baseRarity] || RARITY_COLORS.COMMON;
                const stats = item.baseStats || {};

                return (
                  <tr key={item.id} className="hover:bg-[#151C2A] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{item.iconUrl || item.icon || '🗡️'}</span>
                        <div>
                          <div className="font-bold text-slate-100">{item.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{item.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-300 font-medium">{item.requiredClass || 'Universal'}</div>
                      <div className="text-[10px] text-slate-500">{item.slot}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${rarityStyle.bg} ${rarityStyle.text} ${rarityStyle.border}`}>
                        {item.baseRarity}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      {stats.physAtk ? <div className="text-red-400 font-semibold">+{stats.physAtk} Phys ATK</div> : null}
                      {stats.magicAtk ? <div className="text-blue-400 font-semibold">+{stats.magicAtk} Magic ATK</div> : null}
                      {stats.atkPercent ? <div className="text-orange-400 font-semibold">+{stats.atkPercent}% ATK</div> : null}
                      {!stats.physAtk && !stats.magicAtk && !stats.atkPercent && <span className="text-slate-600">—</span>}
                    </td>

                    <td className="py-3 px-3 font-mono">
                      {stats.armor ? <div className="text-cyan-400 font-semibold">+{stats.armor} Armor</div> : null}
                      {stats.maxHp ? <div className="text-emerald-400 font-semibold">+{stats.maxHp} HP</div> : null}
                      {stats.dmgReduction ? <div className="text-teal-400 font-semibold">+{stats.dmgReduction}% DR</div> : null}
                      {!stats.armor && !stats.maxHp && !stats.dmgReduction && <span className="text-slate-600">—</span>}
                    </td>

                    <td className="py-3 px-3 font-mono">
                      {stats.critRate ? <div className="text-yellow-400 font-semibold">+{stats.critRate}% Crit</div> : null}
                      {stats.critDmg ? <div className="text-amber-400 font-semibold">+{stats.critDmg}% Crit DMG</div> : null}
                      {stats.atkSpeed ? <div className="text-purple-400 font-semibold">+{stats.atkSpeed} AS</div> : null}
                      {!stats.critRate && !stats.critDmg && !stats.atkSpeed && <span className="text-slate-600">—</span>}
                    </td>

                    <td className="py-3 px-3 font-mono text-purple-300 font-bold">
                      +{((item.iLvlScalingFactor || 0.08) * 100).toFixed(0)}%/lvl
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingItem(JSON.parse(JSON.stringify(item)))}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1 ml-auto transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F141E] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#161C28]">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{editingItem.iconUrl || editingItem.icon || '🗡️'}</span>
                <div>
                  <h3 className="text-sm font-black text-white">Edit Attributes: {editingItem.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">{editingItem.id}</span>
                </div>
              </div>

              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={editingItem.icon || editingItem.iconUrl || '⚔️'}
                    onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value, iconUrl: e.target.value })}
                    className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Rarity</label>
                  <select
                    value={editingItem.baseRarity}
                    onChange={(e) => setEditingItem({ ...editingItem, baseRarity: e.target.value as ItemRarity })}
                    className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="COMMON">COMMON</option>
                    <option value="UNCOMMON">UNCOMMON</option>
                    <option value="RARE">RARE</option>
                    <option value="EPIC">EPIC</option>
                    <option value="LEGENDARY">LEGENDARY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">iLvl Scaling Factor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="0.5"
                    value={editingItem.iLvlScalingFactor || 0.08}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, iLvlScalingFactor: parseFloat(e.target.value) || 0.08 })
                    }
                    className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-purple-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Elemental Type</label>
                  <select
                    value={editingItem.elementalType || 'PHYSICAL'}
                    onChange={(e) => setEditingItem({ ...editingItem, elementalType: e.target.value as any })}
                    className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="PHYSICAL">PHYSICAL</option>
                    <option value="FIRE">FIRE</option>
                    <option value="COLD">COLD</option>
                    <option value="LIGHTNING">LIGHTNING</option>
                    <option value="CHAOS">CHAOS</option>
                  </select>
                </div>
              </div>

              {/* Base Stats Matrix */}
              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                  Base Stats
                </h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Base Phys ATK</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingItem.baseStats?.physAtk || 0}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          baseStats: { ...(editingItem.baseStats || ({} as Stats)), physAtk: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Base Magic ATK</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingItem.baseStats?.magicAtk || 0}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          baseStats: { ...(editingItem.baseStats || ({} as Stats)), magicAtk: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Base Armor</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingItem.baseStats?.armor || 0}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          baseStats: { ...(editingItem.baseStats || ({} as Stats)), armor: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Base Max HP</label>
                    <input
                      type="number"
                      step="1"
                      value={editingItem.baseStats?.maxHp || 0}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          baseStats: { ...(editingItem.baseStats || ({} as Stats)), maxHp: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Crit Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingItem.baseStats?.critRate || 0}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          baseStats: { ...(editingItem.baseStats || ({} as Stats)), critRate: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Crit DMG (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingItem.baseStats?.critDmg || 0}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          baseStats: { ...(editingItem.baseStats || ({} as Stats)), critDmg: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ATK Speed Bonus</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingItem.baseStats?.atkSpeed || 0}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          baseStats: { ...(editingItem.baseStats || ({} as Stats)), atkSpeed: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Damage Reduction (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingItem.baseStats?.dmgReduction || 0}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          baseStats: { ...(editingItem.baseStats || ({} as Stats)), dmgReduction: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">All ATK (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingItem.baseStats?.atkPercent || 0}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          baseStats: { ...(editingItem.baseStats || ({} as Stats)), atkPercent: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full bg-[#161C28] border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-800 bg-[#161C28] flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
              >
                {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
