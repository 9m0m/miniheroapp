import { ItemInstance } from './item.types';

export type ChestTier = 'chest_normal';

export interface ChestItemDetail {
  id: string;
  templateId: string;
  itemLevel: number;
  createdAt?: string;
}

export interface ChestVaultDto {
  normalChests: number;
  totalChests: number;
  chests?: ChestItemDetail[];
}

export interface OpenVaultChestResponse {
  openedItem: ItemInstance;
  chestVault: ChestVaultDto;
  message?: string;
}
