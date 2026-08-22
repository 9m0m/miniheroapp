/**
 * Centralized API Gateway for World Hero Frontend
 * Aggregates all domain-driven API modules with backwards-compatibility.
 */

import { userApi } from './userApi';
import { heroApi } from './heroApi';
import { inventoryApi } from './inventoryApi';
import { upgradeApi } from './upgradeApi';
import { cubeApi } from './cubeApi';
import { craftingApi } from './craftingApi';
import { monetizationApi } from './monetizationApi';
import { adminApi } from './adminApi';
import { chestVaultApi } from './chestVaultApi';

export { adminApi, chestVaultApi };

export const gameApi = {
  // User Profile
  getProfile: userApi.getProfile,

  // Heroes & Party
  getHeroes: heroApi.getHeroes,

  // Inventory
  getInventory: inventoryApi.getInventory,
  equipItem: inventoryApi.equipItem,
  unequipItem: inventoryApi.unequipItem,

  // Chest Vault
  getChestVault: chestVaultApi.getChestVault,
  openVaultChest: chestVaultApi.openChest,

  // Enhancement (+1 to +15)
  enhanceItem: upgradeApi.enhanceItem,

  // The Magic Cube
  smartFusion: cubeApi.smartFusion,
  gemFusion: cubeApi.gemFusion,

  // Blessings & Crafting
  blessItem: craftingApi.blessItem,
  craftAccessory: craftingApi.craftAccessory,
  brewAlchemy: craftingApi.brewAlchemy,

  // Monetization & Earning Hooks
  getMonetizationStatus: monetizationApi.getStatus,
  smashPiggyBank: monetizationApi.smashPiggyBank,
  claimDailyPass: monetizationApi.claimDailyPass,
  mockWldPay: monetizationApi.mockWldPay,
};

export {
  userApi,
  heroApi,
  inventoryApi,
  upgradeApi,
  cubeApi,
  craftingApi,
  monetizationApi,
};
