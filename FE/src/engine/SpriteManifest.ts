export interface SpriteAnimationDef {
  fps: number;
  frames: number[];
  loop: boolean;
}

export interface SpriteManifestEntry {
  id: string;
  src: string;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
  expectedWidth: number; // frameWidth * columns
  expectedHeight: number; // frameHeight * rows
  anchorPx: { x: number; y: number }; // Pixel coordinates of foot contact point within frame
  scale: number;
  animations: Record<string, SpriteAnimationDef>;
}

export const SPRITE_MANIFEST: Record<string, SpriteManifestEntry> = {
  // 1. Warrior Hero (4-frame sheet: 128x32 px)
  HERO_WARRIOR: {
    id: 'HERO_WARRIOR',
    src: '/sprites/warrior_anim.png',
    frameWidth: 32,
    frameHeight: 32,
    columns: 4,
    rows: 1,
    expectedWidth: 128,
    expectedHeight: 32,
    anchorPx: { x: 16, y: 32 }, // Bottom center is foot contact
    scale: 1.0,
    animations: {
      idle: { fps: 6, frames: [0], loop: true },
      walk: { fps: 8, frames: [0, 1], loop: true },
      attack: { fps: 12, frames: [2], loop: false },
      hurt: { fps: 10, frames: [3], loop: false },
      die: { fps: 6, frames: [3], loop: false },
    },
  },

  // 2. Ranger Hero (4-frame sheet: 128x32 px)
  HERO_RANGER: {
    id: 'HERO_RANGER',
    src: '/sprites/ranger_anim.png',
    frameWidth: 32,
    frameHeight: 32,
    columns: 4,
    rows: 1,
    expectedWidth: 128,
    expectedHeight: 32,
    anchorPx: { x: 16, y: 32 },
    scale: 1.0,
    animations: {
      idle: { fps: 6, frames: [0], loop: true },
      walk: { fps: 8, frames: [0, 1], loop: true },
      attack: { fps: 12, frames: [2], loop: false },
      hurt: { fps: 10, frames: [3], loop: false },
      die: { fps: 6, frames: [3], loop: false },
    },
  },

  // 3. Mage Hero (4-frame sheet: 128x32 px)
  HERO_MAGE: {
    id: 'HERO_MAGE',
    src: '/sprites/mage_anim.png',
    frameWidth: 32,
    frameHeight: 32,
    columns: 4,
    rows: 1,
    expectedWidth: 128,
    expectedHeight: 32,
    anchorPx: { x: 16, y: 32 },
    scale: 1.0,
    animations: {
      idle: { fps: 6, frames: [0], loop: true },
      walk: { fps: 8, frames: [0, 1], loop: true },
      attack: { fps: 12, frames: [2], loop: false },
      hurt: { fps: 10, frames: [3], loop: false },
      die: { fps: 6, frames: [3], loop: false },
    },
  },

  // 4. Priest Hero (4-frame sheet: 128x32 px)
  HERO_PRIEST: {
    id: 'HERO_PRIEST',
    src: '/sprites/priest_anim.png',
    frameWidth: 32,
    frameHeight: 32,
    columns: 4,
    rows: 1,
    expectedWidth: 128,
    expectedHeight: 32,
    anchorPx: { x: 16, y: 32 },
    scale: 1.0,
    animations: {
      idle: { fps: 6, frames: [0], loop: true },
      walk: { fps: 8, frames: [0, 1], loop: true },
      attack: { fps: 12, frames: [2], loop: false },
      hurt: { fps: 10, frames: [3], loop: false },
      die: { fps: 6, frames: [3], loop: false },
    },
  },

  // 5. Forest Goblin Monster (2-frame sheet: 64x32 px)
  MONSTER_GOBLIN: {
    id: 'MONSTER_GOBLIN',
    src: '/sprites/goblin_forest_anim.png',
    frameWidth: 32,
    frameHeight: 32,
    columns: 2,
    rows: 1,
    expectedWidth: 64,
    expectedHeight: 32,
    anchorPx: { x: 16, y: 32 },
    scale: 1.0,
    animations: {
      idle: { fps: 6, frames: [0], loop: true },
      walk: { fps: 8, frames: [0], loop: true },
      attack: { fps: 10, frames: [1], loop: false },
      hurt: { fps: 10, frames: [0], loop: false },
      die: { fps: 6, frames: [0], loop: false },
    },
  },

  // 6. Wild Wolf Monster (2-frame sheet: 64x32 px)
  MONSTER_WOLF_WILD: {
    id: 'MONSTER_WOLF_WILD',
    src: '/sprites/wolf_wild_anim.png',
    frameWidth: 32,
    frameHeight: 32,
    columns: 2,
    rows: 1,
    expectedWidth: 64,
    expectedHeight: 32,
    anchorPx: { x: 16, y: 32 },
    scale: 1.0,
    animations: {
      idle: { fps: 6, frames: [0], loop: true },
      walk: { fps: 8, frames: [0], loop: true },
      attack: { fps: 10, frames: [1], loop: false },
      die: { fps: 6, frames: [0], loop: false },
    },
  },

  // 7. Frost Wolf Monster (2-frame sheet: 64x32 px)
  MONSTER_WOLF_FROST: {
    id: 'MONSTER_WOLF_FROST',
    src: '/sprites/wolf_frost_anim.png',
    frameWidth: 32,
    frameHeight: 32,
    columns: 2,
    rows: 1,
    expectedWidth: 64,
    expectedHeight: 32,
    anchorPx: { x: 16, y: 32 },
    scale: 1.0,
    animations: {
      idle: { fps: 6, frames: [0], loop: true },
      walk: { fps: 8, frames: [0], loop: true },
      attack: { fps: 10, frames: [1], loop: false },
      die: { fps: 6, frames: [0], loop: false },
    },
  },

  // 8. Fire Wolf Monster (2-frame sheet: 64x32 px)
  MONSTER_WOLF_FIRE: {
    id: 'MONSTER_WOLF_FIRE',
    src: '/sprites/wolf_fire_anim.png',
    frameWidth: 32,
    frameHeight: 32,
    columns: 2,
    rows: 1,
    expectedWidth: 64,
    expectedHeight: 32,
    anchorPx: { x: 16, y: 32 },
    scale: 1.0,
    animations: {
      idle: { fps: 6, frames: [0], loop: true },
      walk: { fps: 8, frames: [0], loop: true },
      attack: { fps: 10, frames: [1], loop: false },
      die: { fps: 6, frames: [0], loop: false },
    },
  },

  // 9. Thunder Wolf Monster (2-frame sheet: 64x32 px)
  MONSTER_WOLF_THUNDER: {
    id: 'MONSTER_WOLF_THUNDER',
    src: '/sprites/wolf_thunder_anim.png',
    frameWidth: 32,
    frameHeight: 32,
    columns: 2,
    rows: 1,
    expectedWidth: 64,
    expectedHeight: 32,
    anchorPx: { x: 16, y: 32 },
    scale: 1.0,
    animations: {
      idle: { fps: 6, frames: [0], loop: true },
      walk: { fps: 8, frames: [0], loop: true },
      attack: { fps: 10, frames: [1], loop: false },
      die: { fps: 6, frames: [0], loop: false },
    },
  },

  // 10. World 1 Boss (Elder Goblin King: 2-frame sheet 96x48 px)
  MONSTER_BOSS_GOBLIN_KING: {
    id: 'MONSTER_BOSS_GOBLIN_KING',
    src: '/sprites/boss_goblin_king_anim.png',
    frameWidth: 48,
    frameHeight: 48,
    columns: 2,
    rows: 1,
    expectedWidth: 96,
    expectedHeight: 48,
    anchorPx: { x: 24, y: 48 },
    scale: 1.0,
    animations: {
      idle: { fps: 6, frames: [0], loop: true },
      walk: { fps: 6, frames: [0], loop: true },
      attack: { fps: 8, frames: [1], loop: false },
      die: { fps: 6, frames: [0], loop: false },
    },
  },

  // 11. World 2 Boss (Ancient Frost Wyrm: 2-frame sheet 128x64 px)
  MONSTER_BOSS_FROST_DRAGON: {
    id: 'MONSTER_BOSS_FROST_DRAGON',
    src: '/sprites/boss_frost_dragon_anim.png',
    frameWidth: 64,
    frameHeight: 64,
    columns: 2,
    rows: 1,
    expectedWidth: 128,
    expectedHeight: 64,
    anchorPx: { x: 32, y: 64 },
    scale: 1.0,
    animations: {
      idle: { fps: 6, frames: [0], loop: true },
      walk: { fps: 6, frames: [0], loop: true },
      attack: { fps: 8, frames: [1], loop: false },
      die: { fps: 6, frames: [0], loop: false },
    },
  },
};

/**
 * Validates the sprite manifest schema at development time
 */
export function validateSpriteManifest(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  Object.entries(SPRITE_MANIFEST).forEach(([key, entry]) => {
    if (!entry.id || entry.id !== key) {
      errors.push(`Manifest key mismatch: key="${key}" id="${entry.id}"`);
    }
    if (!entry.src || !entry.src.startsWith('/sprites/')) {
      errors.push(`Invalid asset src path for ${key}: "${entry.src}"`);
    }
    if (entry.frameWidth <= 0 || entry.frameHeight <= 0) {
      errors.push(`Invalid frame dimensions for ${key}: ${entry.frameWidth}x${entry.frameHeight}`);
    }
    if (entry.columns <= 0 || entry.rows <= 0) {
      errors.push(`Invalid grid layout for ${key}: cols=${entry.columns}, rows=${entry.rows}`);
    }
    if (entry.expectedWidth !== entry.frameWidth * entry.columns || entry.expectedHeight !== entry.frameHeight * entry.rows) {
      errors.push(`Expected dimension mismatch for ${key}`);
    }
    if (entry.anchorPx.x < 0 || entry.anchorPx.y < 0 || entry.anchorPx.x > entry.frameWidth || entry.anchorPx.y > entry.frameHeight) {
      errors.push(`Anchor out of frame bounds for ${key}: (${entry.anchorPx.x}, ${entry.anchorPx.y})`);
    }
    if (!entry.animations || Object.keys(entry.animations).length === 0) {
      errors.push(`Missing animations for ${key}`);
    } else {
      const maxFrameIndex = entry.columns * entry.rows - 1;
      Object.entries(entry.animations).forEach(([animName, anim]) => {
        if (!anim.frames || anim.frames.length === 0) {
          errors.push(`Empty frame list for animation "${animName}" in ${key}`);
        } else {
          anim.frames.forEach((frameIdx) => {
            if (frameIdx < 0 || frameIdx > maxFrameIndex) {
              errors.push(`Frame index ${frameIdx} out of bounds (max ${maxFrameIndex}) for "${animName}" in ${key}`);
            }
          });
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates sprite source rect from manifest animation definition
 */
export function getSpriteFrameRect(
  entry: SpriteManifestEntry,
  animationName: string,
  timeSec: number
): { sx: number; sy: number; sw: number; sh: number } {
  const anim =
    entry.animations[animationName] ||
    entry.animations.idle || { fps: 6, frames: [0], loop: true };
  const frameCount = anim.frames.length || 1;
  const frameIdx = anim.loop
    ? anim.frames[Math.floor(timeSec * anim.fps) % frameCount]
    : anim.frames[Math.min(frameCount - 1, Math.floor(timeSec * anim.fps))];

  const col = frameIdx % entry.columns;
  const row = Math.floor(frameIdx / entry.columns);

  return {
    sx: col * entry.frameWidth,
    sy: row * entry.frameHeight,
    sw: entry.frameWidth,
    sh: entry.frameHeight,
  };
}
