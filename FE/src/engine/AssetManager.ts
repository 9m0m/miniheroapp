import { HeroClass, ElementalType } from '@/types/game.types';

export class AssetManager {
  private heroImages: Record<HeroClass, HTMLImageElement | null> = {
    WARRIOR: null,
    RANGER: null,
    MAGE: null,
    PRIEST: null,
  };

  private monsterImages: Record<string, HTMLImageElement> = {};
  private backgroundImages: Record<string, HTMLImageElement> = {};

  public init() {
    this.preloadHeroSprites();
    this.preloadMonsterSprites();
    this.preloadStageBackgrounds();
  }

  private preloadHeroSprites() {
    const heroSources: Record<HeroClass, string[]> = {
      WARRIOR: ['/knightclass.jpg', '/warrior_anim.png', '/warrior.png'],
      RANGER: ['/archer.jpg', '/ranger_anim.png', '/ranger.png', '/archer.png'],
      MAGE: ['/wizard.jpg', '/mage_anim.png', '/mage.png', '/wizard.png'],
      PRIEST: ['/priest_anim.png', '/priest.png', '/healer.png'],
    };

    (Object.keys(heroSources) as HeroClass[]).forEach((heroClass) => {
      const sources = heroSources[heroClass];
      const tryLoad = (idx: number) => {
        if (idx >= sources.length) return;
        const img = new Image();
        img.src = sources[idx];
        img.onload = () => {
          this.heroImages[heroClass] = img;
        };
        img.onerror = () => {
          tryLoad(idx + 1);
        };
      };
      tryLoad(0);
    });
  }

  private preloadMonsterSprites() {
    const monsterMap: Record<string, string> = {
      firewolf: '/firewolf.jpg',
      icewolf: '/iceworf.jpg',
      lightwolf: '/lightwolf.jpg',
      FIRE: '/firewolf.jpg',
      COLD: '/iceworf.jpg',
      LIGHTNING: '/lightwolf.jpg',
      PHYSICAL: '/lightwolf.jpg',
      CHAOS: '/lightwolf.jpg',
    };

    Object.entries(monsterMap).forEach(([key, url]) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        this.monsterImages[key] = img;
      };
    });
  }

  private preloadStageBackgrounds() {
    for (let w = 1; w <= 4; w++) {
      ['s1', 's3', 's5', 's8', 's10'].forEach((stageKey) => {
        const key = `w${w}_${stageKey}`;
        const img = new Image();
        img.src = `/backgrounds/bg_${key}.png`;
        img.onload = () => {
          this.backgroundImages[key] = img;
        };
      });
    }
  }

  public getHeroImage(heroClass: HeroClass): HTMLImageElement | null {
    return this.heroImages[heroClass];
  }

  public getMonsterImage(mobName: string, elementalType: ElementalType): HTMLImageElement | null {
    const nameLower = (mobName || '').toLowerCase();

    // 1. Direct name matching
    if (nameLower.includes('fire') || nameLower.includes('lava') || nameLower.includes('flame')) {
      return this.monsterImages['firewolf'] || null;
    }
    if (nameLower.includes('ice') || nameLower.includes('frost') || nameLower.includes('glacial') || nameLower.includes('subzero')) {
      return this.monsterImages['icewolf'] || null;
    }
    if (nameLower.includes('light') || nameLower.includes('timber') || nameLower.includes('thunder') || nameLower.includes('emerald') || nameLower.includes('void')) {
      return this.monsterImages['lightwolf'] || null;
    }

    // 2. Elemental type matching
    if (elementalType === 'FIRE') return this.monsterImages['firewolf'] || null;
    if (elementalType === 'COLD') return this.monsterImages['icewolf'] || null;
    if (elementalType === 'CHAOS' || elementalType === 'PHYSICAL') return this.monsterImages['lightwolf'] || null;

    return this.monsterImages['lightwolf'] || null;
  }

  public getBackgroundImage(key: string): HTMLImageElement | null {
    return this.backgroundImages[key] || null;
  }
}

export const assetManager = new AssetManager();
