'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { HeroClass, ItemSlot, ItemRarity, RARITY_COLORS } from '../../types/enums';
import { ItemInstance, ItemTemplate } from '../../types/item.types';
import { StashTabSelector } from './components/StashTabSelector';
import { ItemInspectionDrawer } from './components/ItemInspectionDrawer';
import { InventoryFiltersSheet } from './components/InventoryFiltersSheet';
import { ArrowUpDown, Filter, PackageOpen, Sparkles, Shield } from 'lucide-react';

export default function InventoryManager() {
  const inventory = useGameStore((state) => state.inventory);
  const maxInventorySlots = useGameStore((state) => state.maxInventorySlots);
  const stashItems = useGameStore((state) => state.stashItems);
  const activeStashTab = useGameStore((state) => state.activeStashTab);
  const unlockedStashTabs = useGameStore((state) => state.unlockedStashTabs);
  const selectedHero = useGameStore((state) => state.selectedHero);
  const templates = useGameStore((state) => state.templates);
  const unlockStashTab = useGameStore((state) => state.unlockStashTab);
  const setActiveStashTab = useGameStore((state) => state.setActiveStashTab);
  const equipItem = useGameStore((state) => state.equipItem);
  const unequipItem = useGameStore((state) => state.unequipItem);
  const moveToStash = useGameStore((state) => state.moveToStash);
  const moveToInventory = useGameStore((state) => state.moveToInventory);
  const salvageItem = useGameStore((state) => state.salvageItem);
  const sortInventory = useGameStore((state) => state.sortInventory);

  const [activeTab, setActiveTab] = useState<'BACKPACK' | 'STASH'>('BACKPACK');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'GEAR' | 'MATERIALS' | 'KEYS'>('ALL');
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<ItemSlot | null>(null);
  const [classFilter, setClassFilter] = useState<'ALL' | HeroClass>('ALL');
  const [rarityFilter, setRarityFilter] = useState<'ALL' | ItemRarity>('ALL');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const [inspectingItem, setInspectingItem] = useState<{
    item: ItemInstance;
    isEquipped: boolean;
    isInStash: boolean;
  } | null>(null);

  const rawItems = activeTab === 'BACKPACK' ? inventory : stashItems[activeStashTab] || [];

  // Filter items based on active category, slot, class, and rarity
  const filteredItems = rawItems.filter((item) => {
    const tpl: ItemTemplate = templates[item.templateId] || {
      id: item.templateId,
      name: item.templateId.replace(/_/g, ' ').toUpperCase(),
      description: '',
      itemType: item.templateId.startsWith('key_') ? 'KEY' : item.templateId.startsWith('mat_') ? 'MATERIAL' : 'EQUIPMENT',
      slot: 'MAIN_HAND',
      baseRarity: item.rarity,
      elementalType: 'PHYSICAL',
      requiredClass: null,
      iLvlScalingFactor: 1.0,
      baseStats: { physAtk: 10, magicAtk: 10, armor: 5, maxHp: 20 },
    };

    // Category Filter
    if (categoryFilter === 'GEAR') {
      if (tpl.itemType !== 'EQUIPMENT' && tpl.itemType !== 'ACCESSORY') return false;
    } else if (categoryFilter === 'MATERIALS') {
      if (tpl.itemType !== 'MATERIAL' && !item.templateId.startsWith('mat_') && !item.templateId.startsWith('gem_')) return false;
    } else if (categoryFilter === 'KEYS') {
      if (tpl.itemType !== 'KEY' && !item.templateId.startsWith('key_')) return false;
    }

    // Advanced Slot Filter
    if (selectedSlotFilter && tpl.slot !== selectedSlotFilter) return false;

    // Advanced Class Filter
    if (classFilter !== 'ALL' && tpl.requiredClass && tpl.requiredClass !== classFilter) return false;

    // Advanced Rarity Filter
    if (rarityFilter !== 'ALL' && item.rarity !== rarityFilter) return false;

    return true;
  });

  const activeFilterCount =
    (selectedSlotFilter ? 1 : 0) +
    (classFilter !== 'ALL' ? 1 : 0) +
    (rarityFilter !== 'ALL' ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedSlotFilter(null);
    setClassFilter('ALL');
    setRarityFilter('ALL');
    setIsFilterSheetOpen(false);
  };

  const backpackCount = inventory.length;

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 overflow-y-auto p-3 max-w-lg mx-auto select-none text-white text-xs">
      {/* 1. Context Switcher: Backpack vs Stash & Sort/Filter Controls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('BACKPACK')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer min-h-[36px] ${
              activeTab === 'BACKPACK'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Backpack ({backpackCount}/{maxInventorySlots})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STASH')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer min-h-[36px] ${
              activeTab === 'STASH'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stash
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sort Button */}
          <button
            type="button"
            onClick={sortInventory}
            aria-label="Sort Inventory"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition active:scale-95 flex items-center justify-center min-w-[38px] min-h-[38px] cursor-pointer"
            title="Sort Items"
          >
            <ArrowUpDown size={15} />
          </button>

          {/* Advanced Filter Button */}
          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            aria-label="Open Inventory Filters"
            className={`p-2 rounded-lg border transition active:scale-95 flex items-center justify-center gap-1 min-w-[38px] min-h-[38px] cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="Filters"
          >
            <Filter size={15} />
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stash Tab Selector (Only shown in STASH context) */}
      {activeTab === 'STASH' && (
        <div className="mb-3">
          <StashTabSelector
            activeTab={activeStashTab}
            unlockedTabs={unlockedStashTabs}
            stashItems={stashItems}
            onSelectTab={setActiveStashTab}
            onUnlockTab={unlockStashTab}
          />
        </div>
      )}

      {/* 2. Category Filter Ribbon */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {(['ALL', 'GEAR', 'MATERIALS', 'KEYS'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`py-1.5 px-2 rounded-lg border text-center font-semibold text-xs transition cursor-pointer min-h-[36px] ${
              categoryFilter === cat
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat === 'ALL' ? 'All' : cat === 'GEAR' ? 'Gear' : cat === 'MATERIALS' ? 'Materials' : 'Keys'}
          </button>
        ))}
      </div>

      {/* 3. Items Grid (4 Columns, No Empty Slot Walls) */}
      {filteredItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center gap-2 mt-2">
          <PackageOpen className="w-10 h-10 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-300">No items found</h4>
          <p className="text-xs text-slate-500 max-w-xs">
            {activeFilterCount > 0
              ? 'No items match your active filter criteria. Try resetting filters.'
              : activeTab === 'BACKPACK'
              ? 'Your backpack is empty. Open chests or clear stages to obtain equipment!'
              : 'This stash tab is currently empty.'}
          </p>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {filteredItems.map((item) => {
            const tpl = templates[item.templateId] || {
              id: item.templateId,
              name: item.templateId.replace(/_/g, ' '),
              description: '',
              itemType: 'EQUIPMENT',
              slot: 'MAIN_HAND',
              baseRarity: item.rarity,
            };

            const rarityColor = RARITY_COLORS[item.rarity] || '#94A3B8';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setInspectingItem({
                    item,
                    isEquipped: false,
                    isInStash: activeTab === 'STASH',
                  })
                }
                className="relative flex flex-col items-center justify-between p-2 rounded-xl bg-slate-900 border hover:brightness-110 active:scale-95 transition min-h-[64px] cursor-pointer"
                style={{ borderColor: `${rarityColor}66` }}
              >
                {/* Rarity Indicator Strip */}
                <div
                  className="w-full h-1 rounded-full mb-1"
                  style={{ backgroundColor: rarityColor }}
                />

                {/* Item Icon Placeholder / Graphic */}
                <div className="w-8 h-8 flex items-center justify-center text-slate-300">
                  {tpl.itemType === 'ACCESSORY' ? (
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  ) : tpl.itemType === 'KEY' ? (
                    <Shield className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Shield className="w-5 h-5 text-cyan-400" />
                  )}
                </div>

                {/* Enhancement Level Badge */}
                {item.enhanceLevel > 0 && (
                  <span className="absolute top-1.5 right-1.5 text-[10px] font-bold text-amber-300 bg-slate-950/80 px-1 rounded border border-amber-500/40">
                    +{item.enhanceLevel}
                  </span>
                )}

                {/* Item Name */}
                <span className="text-[11px] font-medium text-slate-200 truncate w-full text-center mt-1">
                  {tpl.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Item Detail / Inspection Bottom Sheet */}
      {inspectingItem && (
        <ItemInspectionDrawer
          item={inspectingItem.item}
          template={templates[inspectingItem.item.templateId] || null}
          selectedHeroClass={selectedHero}
          isEquippedOnHero={inspectingItem.isEquipped}
          isInStash={inspectingItem.isInStash}
          onClose={() => setInspectingItem(null)}
          onEquip={(heroClass, it) => {
            equipItem(heroClass, it);
            setInspectingItem(null);
          }}
          onUnequip={(heroClass, slot) => {
            unequipItem(heroClass, slot);
            setInspectingItem(null);
          }}
          onMoveToStash={(it) => {
            moveToStash(it);
            setInspectingItem(null);
          }}
          onMoveToBackpack={(it) => {
            moveToInventory(it);
            setInspectingItem(null);
          }}
          onSalvage={(it) => {
            salvageItem(it);
            setInspectingItem(null);
          }}
        />
      )}

      {/* 5. Advanced Filters Bottom Sheet */}
      <InventoryFiltersSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        selectedSlot={selectedSlotFilter}
        onSelectSlot={setSelectedSlotFilter}
        selectedClass={classFilter}
        onSelectClass={setClassFilter}
        selectedRarity={rarityFilter}
        onSelectRarity={setRarityFilter}
        onReset={handleResetFilters}
      />
    </div>
  );
}
