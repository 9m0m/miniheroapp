import { HeroRole } from '@/domain/heroes/hero.types';

export interface TowerSpriteConfig {
  templateId: string;
  name: string;
  role: HeroRole;
  imageSrc: string;
  silhouetteColor: string;
  roleBadgeColor: string;
}

export const ROLE_COLOR_CONFIG: Record<
  HeroRole,
  { primary: string; border: string; bg: string; badge: string; text: string; icon: string }
> = {
  TANK: {
    primary: '#3B82F6',
    border: 'border-blue-500/50',
    bg: 'bg-blue-950/40',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    text: 'text-blue-400',
    icon: 'T',
  },
  BRUISER: {
    primary: '#EF4444',
    border: 'border-red-500/50',
    bg: 'bg-red-950/40',
    badge: 'bg-red-500/20 text-red-300 border-red-400/40',
    text: 'text-red-400',
    icon: 'B',
  },
  ASSASSIN: {
    primary: '#A855F7',
    border: 'border-purple-500/50',
    bg: 'bg-purple-950/40',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    text: 'text-purple-400',
    icon: 'A',
  },
  MARKSMAN: {
    primary: '#22C55E',
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-950/40',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    text: 'text-emerald-400',
    icon: 'M',
  },
  MAGE: {
    primary: '#06B6D4',
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-950/40',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    text: 'text-cyan-400',
    icon: 'M',
  },
  SUPPORT: {
    primary: '#F59E0B',
    border: 'border-amber-500/50',
    bg: 'bg-amber-950/40',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    text: 'text-amber-400',
    icon: 'S',
  },
};

const ROLE_SVG_ICONS: Record<HeroRole, string> = {
  TANK: `<path d="M32 16 L44 21 V32 C44 40 32 46 32 46 C32 46 20 40 20 32 V21 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>`,
  BRUISER: `<path d="M22 42 L42 22 M22 22 L42 42 M19 19 L25 25 M39 19 L45 25 M19 45 L25 39 M39 45 L45 39" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`,
  ASSASSIN: `<path d="M32 16 L38 28 L32 46 L26 28 Z M32 46 V50 M26 30 H38" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`,
  MARKSMAN: `<circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M32 14 V24 M32 40 V50 M14 32 H24 M40 32 H50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="32" cy="32" r="3" fill="currentColor"/>`,
  MAGE: `<path d="M32 14 L36 28 L50 32 L36 36 L32 50 L28 36 L14 32 L28 28 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>`,
  SUPPORT: `<path d="M32 16 V48 M16 32 H48" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><circle cx="32" cy="32" r="15" fill="none" stroke="currentColor" stroke-width="2"/>`,
};

// Generates an inline SVG data URI for crisp vector rendering across all viewports
function createSvgAvatar(role: HeroRole, color1: string, color2: string): string {
  const iconPath = ROLE_SVG_ICONS[role] || ROLE_SVG_ICONS.BRUISER;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <defs>
      <linearGradient id="g_${role}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="#0b0f19"/>
    <rect x="2" y="2" width="60" height="60" rx="12" fill="url(#g_${role})" fill-opacity="0.15" stroke="${color1}" stroke-opacity="0.5" stroke-width="2"/>
    <circle cx="32" cy="32" r="18" fill="#111726" stroke="${color1}" stroke-opacity="0.35" stroke-width="1.5"/>
    <g color="${color1}">
      ${iconPath}
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const TOWER_HERO_SPRITES: Record<string, TowerSpriteConfig> = {
  // --- TANK (4) ---
  'hero.knight': {
    templateId: 'hero.knight',
    name: 'Ironclad Knight',
    role: 'TANK',
    imageSrc: createSvgAvatar('TANK', '#3B82F6', '#1E3A8A'),
    silhouetteColor: '#3B82F6',
    roleBadgeColor: 'bg-blue-600',
  },
  'hero.guardian': {
    templateId: 'hero.guardian',
    name: 'Stone Guardian',
    role: 'TANK',
    imageSrc: createSvgAvatar('TANK', '#3B82F6', '#1D4ED8'),
    silhouetteColor: '#3B82F6',
    roleBadgeColor: 'bg-blue-600',
  },
  'hero.paladin': {
    templateId: 'hero.paladin',
    name: 'Sun Paladin',
    role: 'TANK',
    imageSrc: createSvgAvatar('TANK', '#60A5FA', '#1E40AF'),
    silhouetteColor: '#60A5FA',
    roleBadgeColor: 'bg-blue-500',
  },
  'hero.warden': {
    templateId: 'hero.warden',
    name: 'Grove Warden',
    role: 'TANK',
    imageSrc: createSvgAvatar('TANK', '#2563EB', '#1E3A8A'),
    silhouetteColor: '#2563EB',
    roleBadgeColor: 'bg-blue-700',
  },

  // --- BRUISER (4) ---
  'hero.warrior': {
    templateId: 'hero.warrior',
    name: 'Berserk Warrior',
    role: 'BRUISER',
    imageSrc: createSvgAvatar('BRUISER', '#EF4444', '#7F1D1D'),
    silhouetteColor: '#EF4444',
    roleBadgeColor: 'bg-red-600',
  },
  'hero.fighter': {
    templateId: 'hero.fighter',
    name: 'Martial Fighter',
    role: 'BRUISER',
    imageSrc: createSvgAvatar('BRUISER', '#EF4444', '#991B1B'),
    silhouetteColor: '#EF4444',
    roleBadgeColor: 'bg-red-600',
  },
  'hero.berserker': {
    templateId: 'hero.berserker',
    name: 'Blood Berserker',
    role: 'BRUISER',
    imageSrc: createSvgAvatar('BRUISER', '#F87171', '#7F1D1D'),
    silhouetteColor: '#F87171',
    roleBadgeColor: 'bg-red-500',
  },
  'hero.lancer': {
    templateId: 'hero.lancer',
    name: 'Imperial Lancer',
    role: 'BRUISER',
    imageSrc: createSvgAvatar('BRUISER', '#DC2626', '#991B1B'),
    silhouetteColor: '#DC2626',
    roleBadgeColor: 'bg-red-700',
  },

  // --- ASSASSIN (4) ---
  'hero.slayer': {
    templateId: 'hero.slayer',
    name: 'Night Slayer',
    role: 'ASSASSIN',
    imageSrc: createSvgAvatar('ASSASSIN', '#A855F7', '#581C87'),
    silhouetteColor: '#A855F7',
    roleBadgeColor: 'bg-purple-600',
  },
  'hero.shadow_monk': {
    templateId: 'hero.shadow_monk',
    name: 'Shadow Monk',
    role: 'ASSASSIN',
    imageSrc: createSvgAvatar('ASSASSIN', '#C084FC', '#6B21A8'),
    silhouetteColor: '#C084FC',
    roleBadgeColor: 'bg-purple-500',
  },
  'hero.rogue': {
    templateId: 'hero.rogue',
    name: 'Phantom Rogue',
    role: 'ASSASSIN',
    imageSrc: createSvgAvatar('ASSASSIN', '#9333EA', '#581C87'),
    silhouetteColor: '#9333EA',
    roleBadgeColor: 'bg-purple-700',
  },
  'hero.reaper': {
    templateId: 'hero.reaper',
    name: 'Soul Reaper',
    role: 'ASSASSIN',
    imageSrc: createSvgAvatar('ASSASSIN', '#7E22CE', '#3B0764'),
    silhouetteColor: '#7E22CE',
    roleBadgeColor: 'bg-purple-800',
  },

  // --- MARKSMAN (4) ---
  'hero.ranger': {
    templateId: 'hero.ranger',
    name: 'Elven Ranger',
    role: 'MARKSMAN',
    imageSrc: createSvgAvatar('MARKSMAN', '#22C55E', '#14532D'),
    silhouetteColor: '#22C55E',
    roleBadgeColor: 'bg-emerald-600',
  },
  'hero.hunter': {
    templateId: 'hero.hunter',
    name: 'Tracker Hunter',
    role: 'MARKSMAN',
    imageSrc: createSvgAvatar('MARKSMAN', '#22C55E', '#14532D'),
    silhouetteColor: '#22C55E',
    roleBadgeColor: 'bg-emerald-600',
  },
  'hero.gunner': {
    templateId: 'hero.gunner',
    name: 'Heavy Gunner',
    role: 'MARKSMAN',
    imageSrc: createSvgAvatar('MARKSMAN', '#4ADE80', '#166534'),
    silhouetteColor: '#4ADE80',
    roleBadgeColor: 'bg-emerald-500',
  },
  'hero.beastmaster': {
    templateId: 'hero.beastmaster',
    name: 'Primal Beastmaster',
    role: 'MARKSMAN',
    imageSrc: createSvgAvatar('MARKSMAN', '#16A34A', '#14532D'),
    silhouetteColor: '#16A34A',
    roleBadgeColor: 'bg-emerald-700',
  },

  // --- MAGE (4) ---
  'hero.wizard': {
    templateId: 'hero.wizard',
    name: 'Arcane Wizard',
    role: 'MAGE',
    imageSrc: createSvgAvatar('MAGE', '#06B6D4', '#155E75'),
    silhouetteColor: '#06B6D4',
    roleBadgeColor: 'bg-cyan-600',
  },
  'hero.sorcerer': {
    templateId: 'hero.sorcerer',
    name: 'Flame Sorcerer',
    role: 'MAGE',
    imageSrc: createSvgAvatar('MAGE', '#06B6D4', '#155E75'),
    silhouetteColor: '#06B6D4',
    roleBadgeColor: 'bg-cyan-600',
  },
  'hero.elementalist': {
    templateId: 'hero.elementalist',
    name: 'Storm Elementalist',
    role: 'MAGE',
    imageSrc: createSvgAvatar('MAGE', '#22D3EE', '#0E7490'),
    silhouetteColor: '#22D3EE',
    roleBadgeColor: 'bg-cyan-500',
  },
  'hero.warlock': {
    templateId: 'hero.warlock',
    name: 'Void Warlock',
    role: 'MAGE',
    imageSrc: createSvgAvatar('MAGE', '#0891B2', '#164E63'),
    silhouetteColor: '#0891B2',
    roleBadgeColor: 'bg-cyan-700',
  },

  // --- SUPPORT (4) ---
  'hero.priest': {
    templateId: 'hero.priest',
    name: 'High Priest',
    role: 'SUPPORT',
    imageSrc: createSvgAvatar('SUPPORT', '#F59E0B', '#78350F'),
    silhouetteColor: '#F59E0B',
    roleBadgeColor: 'bg-amber-600',
  },
  'hero.bard': {
    templateId: 'hero.bard',
    name: 'Minstrel Bard',
    role: 'SUPPORT',
    imageSrc: createSvgAvatar('SUPPORT', '#F59E0B', '#78350F'),
    silhouetteColor: '#F59E0B',
    roleBadgeColor: 'bg-amber-600',
  },
  'hero.shaman': {
    templateId: 'hero.shaman',
    name: 'Totem Shaman',
    role: 'SUPPORT',
    imageSrc: createSvgAvatar('SUPPORT', '#FBBF24', '#B45309'),
    silhouetteColor: '#FBBF24',
    roleBadgeColor: 'bg-amber-500',
  },
  'hero.alchemist': {
    templateId: 'hero.alchemist',
    name: 'Grand Alchemist',
    role: 'SUPPORT',
    imageSrc: createSvgAvatar('SUPPORT', '#D97706', '#78350F'),
    silhouetteColor: '#D97706',
    roleBadgeColor: 'bg-amber-700',
  },
};

export function getTowerSpriteConfig(templateId: string, role?: HeroRole): TowerSpriteConfig {
  if (TOWER_HERO_SPRITES[templateId]) {
    return TOWER_HERO_SPRITES[templateId];
  }

  const safeRole: HeroRole = role || 'BRUISER';
  const roleCfg = ROLE_COLOR_CONFIG[safeRole] || ROLE_COLOR_CONFIG.BRUISER;

  return {
    templateId: templateId || 'unknown',
    name: templateId ? templateId.replace('hero.', '').toUpperCase() : 'Hero',
    role: safeRole,
    imageSrc: createSvgAvatar(safeRole, roleCfg.primary, '#0f172a'),
    silhouetteColor: roleCfg.primary,
    roleBadgeColor: 'bg-slate-700',
  };
}
