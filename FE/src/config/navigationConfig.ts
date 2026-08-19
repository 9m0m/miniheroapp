import { Compass, Users, Package, Hammer, LucideIcon } from 'lucide-react';

export type TabType = 'TOWN' | 'HEROES' | 'INVENTORY' | 'WORKSHOP';

export type ProductMode = 'unavailable' | 'core';

export interface TabDefinition {
  id: TabType;
  label: string;
  icon: LucideIcon;
  description: string;
}

export interface NavigationConfig {
  mode: ProductMode;
  availableTabs: TabDefinition[];
  defaultTab: TabType;
  /** The canonical home tab used for tutorial lock logic. */
  canonicalTownTab: TabType;
}

const CORE_TABS: TabDefinition[] = [
  { id: 'TOWN',      label: 'Sanctuary', icon: Compass,  description: 'Sky island hub' },
  { id: 'HEROES',    label: 'Heroes',    icon: Users,    description: 'Hero roster' },
  { id: 'INVENTORY', label: 'Inventory', icon: Package,  description: 'Item storage' },
  { id: 'WORKSHOP',  label: 'Workshop',  icon: Hammer,   description: 'Craft & forge' },
];

export function resolveNavigationConfig(flags?: { coreV2Enabled?: boolean }): NavigationConfig {
  if (flags?.coreV2Enabled === true) {
    return { mode: 'core', availableTabs: CORE_TABS, defaultTab: 'TOWN', canonicalTownTab: 'TOWN' };
  }

  return {
    mode: 'unavailable',
    availableTabs: [],
    defaultTab: 'TOWN',
    canonicalTownTab: 'TOWN',
  };
}

/**
 * Normalizes a tab selection to a tab supported by Core v2.
 */
export function normalizeTab(tab: TabType, config: NavigationConfig): TabType {
  if (config.availableTabs.some((t) => t.id === tab)) {
    return tab;
  }
  return config.defaultTab;
}
