/**
 * Centralized API Gateway for World Hero Frontend
 * Aggregates all domain-driven API modules with backwards-compatibility.
 */

import { userApi } from './userApi';
import { heroApi } from './heroApi';
import { inventoryApi } from './inventoryApi';
import { battleApi } from './battleApi';
import { upgradeApi } from './upgradeApi';
import { cubeApi } from './cubeApi';
import { craftingApi } from './craftingApi';
import { monetizationApi } from './monetizationApi';
import { skillApi } from './skillApi';
import { worldApi } from './worldApi';
import { adminApi } from './adminApi';

export { adminApi };

export const gameApi = {
  // User Profile
  getProfile: userApi.getProfile,

  // Heroes & Party
  getHeroes: heroApi.getHeroes,

  // Inventory
  getInventory: inventoryApi.getInventory,
  equipItem: inventoryApi.equipItem,
  unequipItem: inventoryApi.unequipItem,

  // Battle Progression
  clearWave: battleApi.clearWave,

  // Enhancement (+1 to +15)
  enhanceItem: upgradeApi.enhanceItem,

  // The Magic Cube
  smartFusion: cubeApi.smartFusion,
  gemFusion: cubeApi.gemFusion,

  // Sockets, Blessings & Crafting
  inlayGem: craftingApi.inlayGem,
  removeGem: craftingApi.removeGem,
  blessItem: craftingApi.blessItem,
  craftAccessory: craftingApi.craftAccessory,
  brewAlchemy: craftingApi.brewAlchemy,

  // Monetization & Earning Hooks
  getMonetizationStatus: monetizationApi.getStatus,
  smashPiggyBank: monetizationApi.smashPiggyBank,
  claimDailyPass: monetizationApi.claimDailyPass,
  claimGrowthFund: monetizationApi.claimGrowthFund,
  mockWldPay: monetizationApi.mockWldPay,

  // Phase 4: Skill Tree & Worlds
  getSkillTree: skillApi.getSkillTree,
  upgradeSkill: skillApi.upgradeSkill,
  getAllWorlds: worldApi.getAllWorlds,
};

export {
  userApi,
  heroApi,
  inventoryApi,
  battleApi,
  upgradeApi,
  cubeApi,
  craftingApi,
  monetizationApi,
  skillApi,
  worldApi,
};
