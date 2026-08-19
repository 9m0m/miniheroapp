import { HeroClass } from '@/types/game.types';
import { SPRITE_MANIFEST, validateSpriteManifest } from './SpriteManifest';

export class AssetManager {
  private isInitialized = false;
  private manifestSprites: Map<string, HTMLImageElement> = new Map();

  private heroPortraits: Record<HeroClass, HTMLImageElement | null> = {
    WARRIOR: null,
    RANGER: null,
    MAGE: null,
    PRIEST: null,
  };

  private monsterPortraits: Record<string, HTMLImageElement> = {};

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Validate manifest schema in development
    if (process.env.NODE_ENV !== 'production') {
      const validation = validateSpriteManifest();
      if (!validation.valid) {
        console.warn('[SpriteManifest] Validation warnings:', validation.errors);
      }
    }

    this.preloadManifestSprites();
    this.preloadHeroPortraits();
    this.preloadMonsterPortraits();
  }

  /**
   * Preload transparent sprite sheets defined in SpriteManifest
   */
  private preloadManifestSprites() {
    Object.values(SPRITE_MANIFEST).forEach((entry) => {
      const img = new Image();
      img.src = entry.src;
      img.onload = () => {
        if (img.naturalWidth === entry.expectedWidth && img.naturalHeight === entry.expectedHeight) {
          this.manifestSprites.set(entry.id, img);
        }
      };
      img.onerror = () => {
        // Optional asset during early dev
      };
    });
  }

  /**
   * Preload static portrait fallbacks for heroes
   */
  private preloadHeroPortraits() {
    const portraitSources: Record<HeroClass, string[]> = {
      WARRIOR: ['/knightclass.jpg', '/warrior.png'],
      RANGER: ['/archer.jpg', '/ranger.png', '/archer.png'],
      MAGE: ['/wizard.jpg', '/mage.png', '/wizard.png'],
      PRIEST: ['/priest.png', '/healer.png'],
    };

    (Object.keys(portraitSources) as HeroClass[]).forEach((heroClass) => {
      const sources = portraitSources[heroClass];
      const tryLoad = (idx: number) => {
        if (idx >= sources.length) return;
        const img = new Image();
        img.src = sources[idx];
        img.onload = () => {
          this.heroPortraits[heroClass] = img;
        };
        img.onerror = () => {
          tryLoad(idx + 1);
        };
      };
      tryLoad(0);
    });
  }

  /**
   * Preload static monster portraits
   */
  private preloadMonsterPortraits() {
    const monsterMap: Record<string, string[]> = {
      normalwolf: ['/normalwolf.png'],
    };

    Object.entries(monsterMap).forEach(([key, urls]) => {
      const tryLoad = (idx: number) => {
        if (idx >= urls.length) return;
        const img = new Image();
        img.src = urls[idx];
        img.onload = () => {
          this.monsterPortraits[key] = img;
        };
        img.onerror = () => {
          tryLoad(idx + 1);
        };
      };
      tryLoad(0);
    });
  }

  public getSprite(id: string): HTMLImageElement | undefined {
    return this.manifestSprites.get(id);
  }

  public getHeroPortrait(heroClass: HeroClass): HTMLImageElement | null {
    return this.heroPortraits[heroClass];
  }

  public getMonsterPortrait(monsterId: string): HTMLImageElement | undefined {
    return this.monsterPortraits[monsterId];
  }
}

export const assetManager = new AssetManager();
