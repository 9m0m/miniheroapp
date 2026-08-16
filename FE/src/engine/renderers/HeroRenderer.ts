import { HeroClass } from '@/types/game.types';
import { AssetManager } from '../AssetManager';

export interface HeroPosition {
  class: HeroClass;
  x: number;
  y: number;
  icon: string;
  color: string;
}

export class HeroRenderer {
  public static getDeployedHeroPositions(canvasHeight: number, activeParty: HeroClass[]): HeroPosition[] {
    const allHeroPositions: HeroPosition[] = [
      { class: 'PRIEST', x: 25, y: canvasHeight - 45, icon: '✨', color: '#FCD34D' },
      { class: 'MAGE', x: 60, y: canvasHeight - 45, icon: '🔮', color: '#60A5FA' },
      { class: 'RANGER', x: 95, y: canvasHeight - 45, icon: '🏹', color: '#34D399' },
      { class: 'WARRIOR', x: 135, y: canvasHeight - 45, icon: '⚔️', color: '#F87171' },
    ];
    return allHeroPositions.filter((pos) => activeParty.includes(pos.class));
  }

  public static renderHeroes(
    ctx: CanvasRenderingContext2D,
    canvasHeight: number,
    activeParty: HeroClass[],
    currentTime: number,
    attackTimers: Record<HeroClass, number>,
    assets: AssetManager
  ): HeroPosition[] {
    const deployedHeroes = this.getDeployedHeroPositions(canvasHeight, activeParty);

    deployedHeroes.forEach((pos) => {
      // 1. Draw Hero Ground Shadow (scales with bounce)
      const phaseOffset =
        pos.class === 'WARRIOR'
          ? 0
          : pos.class === 'RANGER'
          ? 1.5
          : pos.class === 'MAGE'
          ? 3.0
          : 4.5;
      const walkCycle = Math.sin(currentTime * 0.009 + phaseOffset);
      const bobY = Math.abs(walkCycle) * -3.5; // Cute bounce up 0 to 3.5px
      const tiltAngle = walkCycle * 0.035; // Subtle lean ~2 degrees

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y + 14, Math.max(5, 9 - Math.abs(bobY) * 0.6), 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Hero Sprite with transform
      ctx.save();
      ctx.translate(pos.x, pos.y + bobY);
      ctx.rotate(tiltAngle);

      const heroImg = assets.getHeroImage(pos.class);
      if (heroImg) {
        const spriteSize = 34;
        const is4Frame = heroImg.width >= heroImg.height * 3.0;
        const is2Frame = !is4Frame && heroImg.width >= heroImg.height * 1.5;

        if (is4Frame || is2Frame) {
          let frameIndex = 0;
          let frameWidth = heroImg.width;

          if (is4Frame) {
            frameWidth = heroImg.width / 4;
            const isCurrentlyAttacking = (attackTimers[pos.class] || 0) < 0.25;
            if (isCurrentlyAttacking) {
              frameIndex = 2; // Attack stance
            } else {
              frameIndex = Math.floor(currentTime * 0.006) % 2; // Alternates Idle and Walk
            }
          } else {
            frameWidth = heroImg.width / 2;
            frameIndex = Math.floor(currentTime * 0.006) % 2;
          }

          const frameHeight = heroImg.height;

          ctx.drawImage(
            heroImg,
            frameIndex * frameWidth,
            0,
            frameWidth,
            frameHeight,
            -spriteSize / 2,
            -spriteSize / 2 - 4,
            spriteSize,
            spriteSize
          );
        } else {
          // Single Image Portrait Avatar: Clip as sleek circular avatar with glowing border
          const avatarRadius = 14;
          ctx.save();
          ctx.beginPath();
          ctx.arc(0, -4, avatarRadius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(
            heroImg,
            -avatarRadius,
            -avatarRadius - 4,
            avatarRadius * 2,
            avatarRadius * 2
          );
          ctx.restore();

          // Class glow ring border
          ctx.strokeStyle = pos.color;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(0, -4, avatarRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = pos.color;
        ctx.beginPath();
        ctx.roundRect(-10, -12, 20, 24, 4);
        ctx.fill();

        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pos.icon, 0, 4);
      }
      ctx.restore();

      // 3. Hero Name label below
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#CBD5E1';
      ctx.textAlign = 'center';
      ctx.fillText(pos.class.charAt(0) + pos.class.slice(1).toLowerCase(), pos.x, pos.y + 24);
    });

    return deployedHeroes;
  }
}
