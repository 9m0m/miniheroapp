'use client';

import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { calculateDamagePerHit } from '@/engine/damageCalculator';
import { HeroClass } from '@/types/game.types';

export default function BattleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    heroes,
    currentMonster,
    setCurrentMonster,
    addGold,
    addFloatingText,
    advanceWave,
    currentWave,
    stageIndex,
    worldIndex,
    getHeroTotalStats,
  } = useGameStore();

  // Attack timers for 4 heroes
  const attackTimers = useRef<Record<HeroClass, number>>({
    WARRIOR: 0,
    RANGER: 0,
    MAGE: 0,
    PRIEST: 0,
  });

  const lastFrameTime = useRef<number>(performance.now());
  const floatingTextsRef = useRef<{ id: string; x: number; y: number; text: string; color: string; isCrit: boolean; alpha: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = (currentTime: number) => {
      const dt = (currentTime - lastFrameTime.current) / 1000;
      lastFrameTime.current = currentTime;

      // 1. Clear Canvas with Dark Gradient
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#101520');
      bgGradient.addColorStop(1, '#0B0E14');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor line
      ctx.strokeStyle = '#2A3241';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 25);
      ctx.lineTo(canvas.width, canvas.height - 25);
      ctx.stroke();

      // 2. Render 3 Heroes in Party
      const heroRenderConfig = [
        { classType: 'WARRIOR' as HeroClass, x: 120, y: canvas.height - 60, color: '#3B82F6', icon: '🛡️', label: 'Arthur' },
        { classType: 'RANGER' as HeroClass, x: 70, y: canvas.height - 60, color: '#10B981', icon: '🏹', label: 'Robin' },
        { classType: 'MAGE' as HeroClass, x: 25, y: canvas.height - 60, color: '#8B5CF6', icon: '🔮', label: 'Merlin' },
      ];

      heroRenderConfig.forEach((heroConfig) => {
        const stats = getHeroTotalStats(heroConfig.classType);

        // Update Attack Timer
        attackTimers.current[heroConfig.classType] += dt;
        const attackInterval = 1.0 / Math.max(0.5, stats.atkSpeed);

        if (attackTimers.current[heroConfig.classType] >= attackInterval && currentMonster && currentMonster.currentHp > 0) {
          attackTimers.current[heroConfig.classType] = 0;

          // Compute DPH
          const dmgResult = calculateDamagePerHit(
            stats,
            1.0,
            currentMonster.armor,
            0,
            0
          );

          // Apply damage to monster
          const newHp = Math.max(0, currentMonster.currentHp - dmgResult.finalDamage);
          setCurrentMonster({ ...currentMonster, currentHp: newHp });

          // Add floating combat text
          floatingTextsRef.current.push({
            id: Math.random().toString(),
            x: currentMonster.x + (Math.random() * 20 - 10),
            y: currentMonster.y - 15,
            text: `${dmgResult.isCrit ? 'CRIT! ' : ''}-${Math.round(dmgResult.finalDamage)}`,
            color: dmgResult.isCrit ? '#EF4444' : heroConfig.color,
            isCrit: dmgResult.isCrit,
            alpha: 1.0,
          });

          // Draw attack line / slash effect
          ctx.strokeStyle = heroConfig.color;
          ctx.lineWidth = dmgResult.isCrit ? 3 : 1.5;
          ctx.beginPath();
          ctx.moveTo(heroConfig.x + 15, heroConfig.y);
          ctx.lineTo(currentMonster.x, currentMonster.y);
          ctx.stroke();
        }

        // Draw Hero Sprite Box
        ctx.fillStyle = heroConfig.color;
        ctx.beginPath();
        ctx.roundRect(heroConfig.x - 12, heroConfig.y - 20, 24, 28, 4);
        ctx.fill();

        // Hero Icon
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(heroConfig.icon, heroConfig.x, heroConfig.y);

        // Hero Name
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.fillText(heroConfig.label, heroConfig.x, heroConfig.y + 18);
      });

      // 3. Render Monster / Boss
      if (currentMonster && currentMonster.currentHp > 0) {
        const isBoss = currentWave === 30;
        const monsterWidth = isBoss ? 40 : 28;
        const monsterHeight = isBoss ? 45 : 32;

        // Monster Body
        ctx.fillStyle = isBoss ? '#DC2626' : '#EF4444';
        ctx.beginPath();
        ctx.roundRect(currentMonster.x - monsterWidth / 2, currentMonster.y - monsterHeight / 2, monsterWidth, monsterHeight, 6);
        ctx.fill();

        // Monster Icon
        ctx.font = isBoss ? '20px sans-serif' : '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isBoss ? '👹' : '👾', currentMonster.x, currentMonster.y + 6);

        // Monster Name
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = isBoss ? '#FCA5A5' : '#E2E8F0';
        ctx.fillText(currentMonster.name, currentMonster.x, currentMonster.y - monsterHeight / 2 - 12);

        // Monster Health Bar
        const hpPercent = Math.max(0, currentMonster.currentHp / currentMonster.maxHp);
        const barWidth = 60;
        const barHeight = 5;

        // BG bar
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(currentMonster.x - barWidth / 2, currentMonster.y - monsterHeight / 2 - 8, barWidth, barHeight);

        // HP Fill
        ctx.fillStyle = isBoss ? '#EF4444' : '#22C55E';
        ctx.fillRect(currentMonster.x - barWidth / 2, currentMonster.y - monsterHeight / 2 - 8, barWidth * hpPercent, barHeight);
      } else if (currentMonster && currentMonster.currentHp <= 0) {
        // Monster Defeated!
        const earnedGold = currentWave === 30 ? 150 : 15;
        addGold(earnedGold);
        advanceWave();

        // Spawn next monster
        const nextIsBoss = currentWave + 1 === 30;
        const nextBaseHp = 200 + worldIndex * 150 + stageIndex * 40 + (currentWave + 1) * 25;

        setCurrentMonster({
          id: `mob_${Date.now()}`,
          name: nextIsBoss ? `BOSS ${worldIndex}-${stageIndex}` : `Quái Wave ${currentWave + 1}`,
          maxHp: nextIsBoss ? nextBaseHp * 3 : nextBaseHp,
          currentHp: nextIsBoss ? nextBaseHp * 3 : nextBaseHp,
          atk: 15 + currentWave * 2,
          armor: 20 + currentWave,
          elementalType: 'PHYSICAL',
          isBoss: nextIsBoss,
          x: 280,
          y: canvas.height - 60,
        });
      }

      // 4. Render Floating Damage Texts
      floatingTextsRef.current.forEach((ft) => {
        ft.y -= 30 * dt; // Float up
        ft.alpha -= 1.2 * dt; // Fade out

        if (ft.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, ft.alpha);
          ctx.font = ft.isCrit ? 'bold 13px sans-serif' : '11px sans-serif';
          ctx.fillStyle = ft.color;
          ctx.textAlign = 'center';
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        }
      });

      // Filter out faded texts
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.alpha > 0);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentMonster, currentWave, stageIndex, worldIndex, getHeroTotalStats, setCurrentMonster, addGold, advanceWave]);

  return (
    <div className="w-full bg-game-card relative border-b border-game-border flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={360}
        height={160}
        className="w-full h-40 block"
      />
    </div>
  );
}
