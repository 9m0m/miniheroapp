import { HeroClass } from '@/types/game.types';

export interface FloatingTextEntry {
  id: number;
  active: boolean;
  x: number;
  y: number;
  text: string;
  color: string;
  isCrit: boolean;
  alpha: number;
}

export interface CombatVFX {
  id: number;
  active: boolean;
  type: 'SLASH' | 'ARROW' | 'MAGIC_ORB' | 'HOLY_HEAL';
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  progress: number;
  speed: number;
  color: string;
  life: number;
}

const MAX_FLOATING_TEXTS = 30;
const MAX_VFX = 20;

export class CombatEffectsRenderer {
  private textPool: FloatingTextEntry[];
  private vfxPool: CombatVFX[];

  constructor() {
    this.textPool = Array.from({ length: MAX_FLOATING_TEXTS }, (_, i) => ({
      id: i,
      active: false,
      x: 0,
      y: 0,
      text: '',
      color: '#FFFFFF',
      isCrit: false,
      alpha: 0,
    }));

    this.vfxPool = Array.from({ length: MAX_VFX }, (_, i) => ({
      id: i,
      active: false,
      type: 'SLASH',
      startX: 0,
      startY: 0,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      progress: 0,
      speed: 1,
      color: '#FFFFFF',
      life: 0,
    }));
  }

  public spawnFloatingText(x: number, y: number, text: string, color: string, isCrit: boolean) {
    let target = this.textPool.find((entry) => !entry.active);
    if (!target) {
      target = this.textPool.reduce((min, cur) => (cur.alpha < min.alpha ? cur : min), this.textPool[0]);
    }
    target.active = true;
    target.x = x;
    target.y = y;
    target.text = text;
    target.color = color;
    target.isCrit = isCrit;
    target.alpha = 1.0;
  }

  public spawnHeroAttackVFX(
    heroClass: HeroClass,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number
  ) {
    let vfx = this.vfxPool.find((e) => !e.active);
    if (!vfx) {
      vfx = this.vfxPool[0];
    }

    vfx.active = true;
    vfx.startX = startX;
    vfx.startY = startY;
    vfx.targetX = targetX;
    vfx.targetY = targetY;
    vfx.currentX = startX;
    vfx.currentY = startY;
    vfx.progress = 0;
    vfx.life = 1.0;

    switch (heroClass) {
      case 'WARRIOR':
        vfx.type = 'SLASH';
        vfx.color = '#F87171';
        vfx.speed = 3.5;
        break;
      case 'RANGER':
        vfx.type = 'ARROW';
        vfx.color = '#34D399';
        vfx.speed = 3.0;
        break;
      case 'MAGE':
        vfx.type = 'MAGIC_ORB';
        vfx.color = '#C084FC';
        vfx.speed = 2.4;
        break;
      case 'PRIEST':
        vfx.type = 'HOLY_HEAL';
        vfx.color = '#FCD34D';
        vfx.speed = 2.0;
        break;
    }
  }

  public renderAndTick(ctx: CanvasRenderingContext2D, dt: number) {
    // 1. Tick & Render Combat Visual FX (Projectiles, Slashes, Magic)
    this.vfxPool.forEach((vfx) => {
      if (!vfx.active) return;

      vfx.progress += vfx.speed * dt;
      vfx.currentX = vfx.startX + (vfx.targetX - vfx.startX) * Math.min(1, vfx.progress);
      vfx.currentY = vfx.startY + (vfx.targetY - vfx.startY) * Math.min(1, vfx.progress);

      if (vfx.progress >= 1.0) {
        vfx.life -= 4.0 * dt;
        if (vfx.life <= 0) {
          vfx.active = false;
          return;
        }
      }

      ctx.save();

      if (vfx.type === 'SLASH') {
        // Dynamic Crescent Sword Slash Arc
        ctx.strokeStyle = vfx.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = vfx.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        const arcRadius = 16;
        ctx.arc(vfx.targetX, vfx.targetY, arcRadius, -0.6 * Math.PI, 0.4 * Math.PI);
        ctx.stroke();

        // Slash Spark
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(vfx.targetX - 2, vfx.targetY - 2, 4, 4);
      } else if (vfx.type === 'ARROW') {
        // Fast Flying Arrow Projectile with Speed Trail
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(vfx.currentX - 12, vfx.currentY);
        ctx.lineTo(vfx.currentX, vfx.currentY);
        ctx.stroke();

        // Arrow head arrowhead
        ctx.fillStyle = '#34D399';
        ctx.beginPath();
        ctx.moveTo(vfx.currentX + 3, vfx.currentY);
        ctx.lineTo(vfx.currentX - 4, vfx.currentY - 3);
        ctx.lineTo(vfx.currentX - 4, vfx.currentY + 3);
        ctx.closePath();
        ctx.fill();
      } else if (vfx.type === 'MAGIC_ORB') {
        // Glowing Arcane Fireball / Energy Orb
        const orbRadius = 4.5 + Math.sin(vfx.progress * 10) * 1.5;
        ctx.shadowColor = vfx.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = vfx.color;
        ctx.beginPath();
        ctx.arc(vfx.currentX, vfx.currentY, orbRadius, 0, Math.PI * 2);
        ctx.fill();

        // Inner hot core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(vfx.currentX, vfx.currentY, orbRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (vfx.type === 'HOLY_HEAL') {
        // Rising Golden Divine Ring
        ctx.strokeStyle = '#FCD34D';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(vfx.startX, vfx.startY - vfx.progress * 16, 12, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });

    // 2. Tick & Render Floating Damage Numbers
    this.textPool.forEach((ft) => {
      if (!ft.active) return;

      ft.y -= 24 * dt;
      ft.alpha -= 1.1 * dt;

      if (ft.alpha <= 0) {
        ft.active = false;
        return;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = ft.isCrit ? 'bold 13px sans-serif' : 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  public renderAttackBeam(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    color: string
  ) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
  }
}
