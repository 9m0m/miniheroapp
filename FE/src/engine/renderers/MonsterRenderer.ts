import { Monster } from '@/types/game.types';
import { AssetManager } from '../AssetManager';

export class MonsterRenderer {
  public static render(
    ctx: CanvasRenderingContext2D,
    currentMob: Monster,
    currentWave: number,
    currentMobInWave: number,
    totalMobsInWave: number,
    assets: AssetManager
  ) {
    if (!currentMob || currentMob.currentHp <= 0) return;

    const isBoss = currentWave === 31;
    const monsterWidth = isBoss ? 44 : 30;
    const monsterHeight = isBoss ? 48 : 32;

    // 1. Monster Body & Custom Monster Sprite (Wolf / Elemental)
    const mobImg = assets.getMonsterImage(currentMob.name, currentMob.elementalType);

    if (mobImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(currentMob.x, currentMob.y, monsterWidth / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        mobImg,
        currentMob.x - monsterWidth / 2,
        currentMob.y - monsterHeight / 2,
        monsterWidth,
        monsterHeight
      );
      ctx.restore();

      // Elemental aura border
      ctx.strokeStyle = isBoss
        ? '#EF4444'
        : currentMob.elementalType === 'FIRE'
        ? '#F97316'
        : currentMob.elementalType === 'COLD'
        ? '#38BDF8'
        : '#FCD34D';
      ctx.lineWidth = isBoss ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(currentMob.x, currentMob.y, monsterWidth / 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = isBoss ? '#DC2626' : '#EF4444';
      ctx.beginPath();
      ctx.roundRect(
        currentMob.x - monsterWidth / 2,
        currentMob.y - monsterHeight / 2,
        monsterWidth,
        monsterHeight,
        6
      );
      ctx.fill();

      // Monster Icon fallback
      ctx.font = isBoss ? '22px sans-serif' : '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        isBoss
          ? '👑'
          : currentMob.elementalType === 'FIRE'
          ? '🔥'
          : currentMob.elementalType === 'COLD'
          ? '❄️'
          : '👺',
        currentMob.x,
        currentMob.y + 6
      );
    }

    // 2. Monster RPG Name
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = isBoss ? '#FCA5A5' : '#F1F5F9';
    ctx.textAlign = 'center';
    ctx.fillText(currentMob.name, currentMob.x, currentMob.y - monsterHeight / 2 - 16);

    // 3. Wave & Mob Badge Subtitle
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = isBoss ? '#EF4444' : '#94A3B8';
    const mobSubtitle = isBoss
      ? '👑 STAGE BOSS (W31) 👑'
      : `Wave ${currentWave}/30 • Mob ${currentMobInWave}/${totalMobsInWave}`;
    ctx.fillText(mobSubtitle, currentMob.x, currentMob.y - monsterHeight / 2 - 6);

    // 4. Monster Health Bar
    const hpPercent = Math.max(0, currentMob.currentHp / currentMob.maxHp);
    const barWidth = isBoss ? 54 : 36;
    const barHeight = 4;

    // BG bar
    ctx.fillStyle = '#334155';
    ctx.fillRect(currentMob.x - barWidth / 2, currentMob.y - monsterHeight / 2 - 2, barWidth, barHeight);

    // HP Fill
    ctx.fillStyle = isBoss ? '#EF4444' : '#10B981';
    ctx.fillRect(
      currentMob.x - barWidth / 2,
      currentMob.y - monsterHeight / 2 - 2,
      barWidth * hpPercent,
      barHeight
    );
  }
}
