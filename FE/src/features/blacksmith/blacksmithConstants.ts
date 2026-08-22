export interface CraftRecipe {
  id: string;
  name: string;
  slot: string;
  targetTemplateId: string;
  requiredMaterialId: string;
  requiredMaterialName: string;
  description: string;
  statsPreview: string;
  goldCost: number;
  stonesCost: number;
  classTag: string;
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  // ─── Rings (Universal) ──────────────────────────────────────────────────
  {
    id: 'craft_ruby_ring',
    name: 'Molten Ruby Ring',
    slot: 'RING',
    targetTemplateId: 'acc_ruby_ring',
    requiredMaterialId: 'mat_ring_frame',
    requiredMaterialName: 'Ring Frame',
    description: 'Empowers physical and magic damage. Universal for all heroes.',
    statsPreview: '+15 Phys ATK • +15 Magic ATK',
    goldCost: 300,
    stonesCost: 2,
    classTag: 'All Classes',
  },
  {
    id: 'craft_falcon_ring',
    name: 'Falcon Eye Ring',
    slot: 'RING',
    targetTemplateId: 'acc_ruby_ring',
    requiredMaterialId: 'mat_ring_frame',
    requiredMaterialName: 'Ring Frame',
    description: 'Precision alloy band tuning critical strike accuracy.',
    statsPreview: '+6% Crit Rate • +15% Crit DMG',
    goldCost: 500,
    stonesCost: 3,
    classTag: 'All Classes',
  },
  // ─── Talismans (Universal) ──────────────────────────────────────────────
  {
    id: 'craft_heart_talisman',
    name: 'Dragonheart Talisman',
    slot: 'TALISMAN',
    targetTemplateId: 'acc_heart_amulet',
    requiredMaterialId: 'mat_talisman_frame',
    requiredMaterialName: 'Talisman Frame',
    description: 'Ancient etched relic restoring vitality. Universal for all heroes.',
    statsPreview: '+120 Max HP • +5 Armor',
    goldCost: 400,
    stonesCost: 2,
    classTag: 'All Classes',
  },
  {
    id: 'craft_aegis_talisman',
    name: 'Aegis Guardian Talisman',
    slot: 'TALISMAN',
    targetTemplateId: 'acc_dragon_talisman',
    requiredMaterialId: 'mat_talisman_frame',
    requiredMaterialName: 'Talisman Frame',
    description: 'Imbued with warding runes that absorb incoming trauma.',
    statsPreview: '+25 ATK • +8% DmgReduction',
    goldCost: 800,
    stonesCost: 4,
    classTag: 'All Classes',
  },
  // ─── Weapons (Class-Restricted) ─────────────────────────────────────────
  {
    id: 'craft_iron_sword',
    name: 'Novice Vanguard Sword',
    slot: 'MAIN_HAND',
    targetTemplateId: 'wpn_iron_sword',
    requiredMaterialId: 'mat_iron_ingot',
    requiredMaterialName: 'Refined Iron Ingot',
    description: 'Tempered steel blade for frontline Knights and Warriors.',
    statsPreview: '+20 Phys ATK • +2% Crit Rate',
    goldCost: 200,
    stonesCost: 1,
    classTag: 'Knight / Warrior',
  },
  {
    id: 'craft_hunting_bow',
    name: 'Hunting Composite Bow',
    slot: 'MAIN_HAND',
    targetTemplateId: 'wpn_hunting_bow',
    requiredMaterialId: 'mat_leather_strip',
    requiredMaterialName: 'Tanned Leather',
    description: 'Flexible composite bow designed for Marksman Rangers.',
    statsPreview: '+22 Phys ATK • +4% Attack Speed',
    goldCost: 200,
    stonesCost: 1,
    classTag: 'Ranger / Marksman',
  },
  {
    id: 'craft_iron_shield',
    name: 'Iron Vanguard Shield',
    slot: 'OFF_HAND',
    targetTemplateId: 'shd_iron_shield',
    requiredMaterialId: 'mat_iron_ingot',
    requiredMaterialName: 'Refined Iron Ingot',
    description: 'Heavy plate shield providing robust armor deflection.',
    statsPreview: '+18 Armor • +50 Max HP',
    goldCost: 250,
    stonesCost: 1,
    classTag: 'Knight / Tank',
  },
];

export const ENHANCE_GOLD_COSTS = [
  100, 200, 300, 500, 800, 1200, 1700, 2300, 3000, 4000, 5500, 7500, 10000, 14000, 20000
];

export const ENHANCE_STONE_COSTS = [
  1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 18, 25
];
