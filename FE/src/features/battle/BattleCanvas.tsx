'use client';

import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { calculateDamagePerHit } from '@/engine/damageCalculator';
import { ElementalType, HeroClass } from '@/types/game.types';

const WORLD_MONSTER_POOLS: Record<number, { name: string; icon: string; elem: ElementalType }[]> = {
  1: [
    { name: 'Forest Goblin Scout', icon: '👺', elem: 'PHYSICAL' },
    { name: 'Goblin Spearman', icon: '🗡️', elem: 'PHYSICAL' },
    { name: 'Feral Wild Boar', icon: '🐗', elem: 'PHYSICAL' },
    { name: 'Emerald Timberwolf', icon: '🐺', elem: 'PHYSICAL' },
  ],
  2: [
    { name: 'Glacial Frost Sprite', icon: '❄️', elem: 'COLD' },
    { name: 'Ancient Ice Golem', icon: '🗿', elem: 'COLD' },
    { name: 'Glacial Archer', icon: '🏹', elem: 'COLD' },
    { name: 'Subzero Frost Stalker', icon: '🐆', elem: 'COLD' },
  ],
  3: [
    { name: 'Volcanic Fire Imp', icon: '🔥', elem: 'FIRE' },
    { name: 'Infernal Lava Hound', icon: '🐕', elem: 'FIRE' },
    { name: 'Magma Caldera Brute', icon: '🌋', elem: 'FIRE' },
    { name: 'Pyromancer Sorcerer', icon: '🧙‍♂️', elem: 'FIRE' },
  ],
  4: [
    { name: 'Cosmic Void Wisp', icon: '👁️', elem: 'CHAOS' },
    { name: 'Abyssal Stalker', icon: '👤', elem: 'CHAOS' },
    { name: 'Primordial Chaos Fiend', icon: '👾', elem: 'CHAOS' },
    { name: 'Nether Horror Eldritch', icon: '🌌', elem: 'CHAOS' },
  ],
};

const WORLD_BOSS_TEMPLATES: Record<number, { name: string; icon: string; elem: ElementalType }> = {
  1: { name: 'Elder Goblin King', icon: '👑', elem: 'PHYSICAL' },
  2: { name: 'Ancient Frost Wyrm', icon: '🐉', elem: 'COLD' },
  3: { name: 'Fire Lord Ifrit', icon: '🔥', elem: 'FIRE' },
  4: { name: 'Void Overlord Abaddon', icon: '🪐', elem: 'CHAOS' },
};

export default function BattleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    heroes,
    activeParty,
    currentMonster,
    setCurrentMonster,
    addGold,
    advanceWave,
    currentWave,
    stageIndex,
    worldIndex,
    combatSpeed,
    getHeroTotalStats,
    recordBattleVictory,
  } = useGameStore();

  const stageStartTime = useRef<number>(Date.now());
  const floorOffset = useRef<number>(0);
  const heroHpRef = useRef<number>(150);
  const monsterAttackTimer = useRef<number>(0);
  const priestHealTimer = useRef<number>(0);

  // Wave Monster Count Progression (e.g. 4 mobs per normal wave, 1 for Boss)
  const currentMobInWave = useRef<number>(1);
  const totalMobsInWave = useRef<number>(4);

  // Attack timers for 4 heroes
  const attackTimers = useRef<Record<HeroClass, number>>({
    WARRIOR: 0,
    RANGER: 0,
    MAGE: 0,
    PRIEST: 0,
  });

  const lastFrameTime = useRef<number>(performance.now());
  const floatingTextsRef = useRef<{ id: string; x: number; y: number; text: string; color: string; isCrit: boolean; alpha: number }[]>([]);
  const warriorImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Preload custom warrior sprite
    const img = new Image();
    img.src = '/knightclass.jpg';
    img.onload = () => {
      warriorImageRef.current = img;
    };
    img.onerror = () => {
      const fallbackImg = new Image();
      fallbackImg.src = '/warrior.png';
      fallbackImg.onload = () => {
        warriorImageRef.current = fallbackImg;
      };
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = (currentTime: number) => {
      const rawDt = (currentTime - lastFrameTime.current) / 1000;
      lastFrameTime.current = currentTime;
      const speedMult = combatSpeed || 1;
      const dt = Math.min(0.1, rawDt) * speedMult;

      // 1. Render World Themed Parallax Background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Parallax Floor Scrolling
      floorOffset.current = (floorOffset.current + 35 * dt) % 24;

      // Background Gradient based on World
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (worldIndex === 2) {
        // Frozen Citadel
        bgGradient.addColorStop(0, '#0f172a');
        bgGradient.addColorStop(0.7, '#1e293b');
        bgGradient.addColorStop(1, '#0c4a6e');
      } else if (worldIndex === 3) {
        // Volcanic Caldera
        bgGradient.addColorStop(0, '#1c1917');
        bgGradient.addColorStop(0.7, '#450a0a');
        bgGradient.addColorStop(1, '#7f1d1d');
      } else if (worldIndex === 4) {
        // Void Abyss
        bgGradient.addColorStop(0, '#09090b');
        bgGradient.addColorStop(0.7, '#2e1065');
        bgGradient.addColorStop(1, '#3b0764');
      } else {
        // Emerald Forest (Default)
        bgGradient.addColorStop(0, '#052e16');
        bgGradient.addColorStop(0.7, '#064e3b');
        bgGradient.addColorStop(1, '#022c22');
      }
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant pixel particles
      ctx.fillStyle = worldIndex === 3 ? '#f97316' : (worldIndex === 2 ? '#38bdf8' : '#34d399');
      for (let i = 0; i < 6; i++) {
        const particleX = (currentTime / (30 + i * 5) + i * 60) % canvas.width;
        const particleY = (i * 22 + (currentTime / 50)) % (canvas.height - 40);
        ctx.fillRect(particleX, particleY, 2, 2);
      }

      // Parallax Floor Pattern
      ctx.fillStyle = '#06130B';
      ctx.fillRect(0, canvas.height - 24, canvas.width, 24);

      ctx.strokeStyle = '#0F2E1B';
      ctx.lineWidth = 1.5;
      for (let x = -24 + floorOffset.current; x < canvas.width + 24; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 24);
        ctx.lineTo(x - 12, canvas.height);
        ctx.stroke();
      }

      // 2. Render Party Heroes & Hero Combat Loop (Only deployed heroes in activeParty!)
      const allHeroPositions = [
        { class: 'PRIEST' as HeroClass, x: 25, y: canvas.height - 45, icon: '✨', color: '#FCD34D' },
        { class: 'MAGE' as HeroClass, x: 60, y: canvas.height - 45, icon: '🔮', color: '#60A5FA' },
        { class: 'RANGER' as HeroClass, x: 95, y: canvas.height - 45, icon: '🏹', color: '#34D399' },
        { class: 'WARRIOR' as HeroClass, x: 135, y: canvas.height - 45, icon: '⚔️', color: '#F87171' },
      ];

      const deployedHeroPositions = allHeroPositions.filter((pos) => activeParty.includes(pos.class));

      deployedHeroPositions.forEach((pos) => {
        const heroData = heroes[pos.class];
        const isWarrior = pos.class === 'WARRIOR';
        const heroStats = getHeroTotalStats(pos.class);

        // Update Attack Timer
        const heroAtkSpeed = heroStats.atkSpeed || 1.0;
        const attackInterval = 1.0 / Math.max(0.5, heroAtkSpeed);
        attackTimers.current[pos.class] += dt;

        // Perform Attack on Monster if ready
        if (attackTimers.current[pos.class] >= attackInterval && currentMonster && currentMonster.currentHp > 0) {
          attackTimers.current[pos.class] = 0;

          // Damage Calculation
          const dmgResult = calculateDamagePerHit(
            heroStats,
            1.0,
            currentMonster.armor || 20,
            0,
            currentMonster.elementalType === 'FIRE' || currentMonster.elementalType === 'COLD' ? 10 : 0
          );

          const appliedDmg = Math.max(1, Math.round(dmgResult.finalDamage));
          currentMonster.currentHp = Math.max(0, currentMonster.currentHp - appliedDmg);

          // Add floating text
          const floatColor = dmgResult.isCrit ? '#FBBF24' : (pos.class === 'MAGE' ? '#93C5FD' : '#FFFFFF');
          floatingTextsRef.current.push({
            id: Math.random().toString(),
            x: currentMonster.x + (Math.random() * 24 - 12),
            y: currentMonster.y - 25,
            text: dmgResult.isCrit ? `CRIT! -${appliedDmg}` : `-${appliedDmg}`,
            color: floatColor,
            isCrit: dmgResult.isCrit,
            alpha: 1.0,
          });

          // Draw attack beam/projectile flash
          ctx.strokeStyle = pos.color;
          ctx.lineWidth = dmgResult.isCrit ? 3 : 1.5;
          ctx.beginPath();
          ctx.moveTo(pos.x + 8, pos.y);
          ctx.lineTo(currentMonster.x, currentMonster.y);
          ctx.stroke();
        }

        // Draw Hero Body / Custom Knight Sprite
        if (isWarrior && warriorImageRef.current) {
          const spriteSize = 34;
          ctx.drawImage(
            warriorImageRef.current,
            pos.x - spriteSize / 2,
            pos.y - spriteSize / 2 - 4,
            spriteSize,
            spriteSize
          );
        } else {
          ctx.fillStyle = pos.color;
          ctx.beginPath();
          ctx.roundRect(pos.x - 10, pos.y - 12, 20, 24, 4);
          ctx.fill();

          ctx.font = '13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(pos.icon, pos.x, pos.y + 4);
        }

        // Hero Name label below
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.textAlign = 'center';
        ctx.fillText(pos.class.charAt(0) + pos.class.slice(1).toLowerCase(), pos.x, pos.y + 20);
      });

      // Elena (Priest) Passive Healing Tick every 3s (Only if Priest is deployed!)
      if (activeParty.includes('PRIEST')) {
        priestHealTimer.current += dt;
        if (priestHealTimer.current >= 3.0) {
          priestHealTimer.current = 0;
          heroHpRef.current = Math.min(250, heroHpRef.current + 25);
          floatingTextsRef.current.push({
            id: Math.random().toString(),
            x: 135,
            y: canvas.height - 65,
            text: '+25 HP',
            color: '#34D399',
            isCrit: false,
            alpha: 1.0,
          });
        }
      }

      // 3. Render Monster & Monster Counter-Attack
      if (currentMonster && currentMonster.currentHp > 0) {
        const isBoss = currentWave === 31;
        const monsterWidth = isBoss ? 44 : 30;
        const monsterHeight = isBoss ? 48 : 32;

        // Monster Counter-Attack on Arthur
        monsterAttackTimer.current += dt;
        if (monsterAttackTimer.current >= 1.8) {
          monsterAttackTimer.current = 0;
          const monsterDmg = Math.max(5, currentMonster.atk - 10);
          heroHpRef.current = Math.max(20, heroHpRef.current - monsterDmg);

          floatingTextsRef.current.push({
            id: Math.random().toString(),
            x: 125 + (Math.random() * 10 - 5),
            y: canvas.height - 75,
            text: `-${monsterDmg}`,
            color: '#F87171',
            isCrit: false,
            alpha: 1.0,
          });

          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(currentMonster.x - 10, currentMonster.y);
          ctx.lineTo(135, canvas.height - 60);
          ctx.stroke();
        }

        // Monster Body
        ctx.fillStyle = isBoss ? '#DC2626' : '#EF4444';
        ctx.beginPath();
        ctx.roundRect(currentMonster.x - monsterWidth / 2, currentMonster.y - monsterHeight / 2, monsterWidth, monsterHeight, 6);
        ctx.fill();

        // Monster Icon
        ctx.font = isBoss ? '22px sans-serif' : '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isBoss ? '👑' : (currentMonster.elementalType === 'FIRE' ? '🔥' : (currentMonster.elementalType === 'COLD' ? '❄️' : '👺')), currentMonster.x, currentMonster.y + 6);

        // Monster RPG Name
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = isBoss ? '#FCA5A5' : '#F1F5F9';
        ctx.fillText(currentMonster.name, currentMonster.x, currentMonster.y - monsterHeight / 2 - 16);

        // Wave & Mob Badge Subtitle (e.g. "Wave 3/30 • Mob 2/4" or "STAGE BOSS 👑")
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = isBoss ? '#EF4444' : '#94A3B8';
        const mobSubtitle = isBoss ? '👑 STAGE BOSS (W31) 👑' : `Wave ${currentWave}/30 • Mob ${currentMobInWave.current}/${totalMobsInWave.current}`;
        ctx.fillText(mobSubtitle, currentMonster.x, currentMonster.y - monsterHeight / 2 - 6);

        // Monster Health Bar
        const hpPercent = Math.max(0, currentMonster.currentHp / currentMonster.maxHp);
        const barWidth = isBoss ? 54 : 36;
        const barHeight = 4;

        // BG bar
        ctx.fillStyle = '#334155';
        ctx.fillRect(currentMonster.x - barWidth / 2, currentMonster.y - monsterHeight / 2 - 2, barWidth, barHeight);

        // HP Fill
        ctx.fillStyle = isBoss ? '#EF4444' : '#10B981';
        ctx.fillRect(currentMonster.x - barWidth / 2, currentMonster.y - monsterHeight / 2 - 2, barWidth * hpPercent, barHeight);
      } else if (currentMonster && currentMonster.currentHp <= 0) {
        // Monster Defeated!
        const pool = WORLD_MONSTER_POOLS[worldIndex] || WORLD_MONSTER_POOLS[1];
        const bossTemplate = WORLD_BOSS_TEMPLATES[worldIndex] || WORLD_BOSS_TEMPLATES[1];

        const isCurrentBoss = currentWave === 31;

        if (!isCurrentBoss && currentMobInWave.current < totalMobsInWave.current) {
          // Next mob in same wave
          currentMobInWave.current += 1;
          addGold(20);

          const randomMob = pool[Math.floor(Math.random() * pool.length)];
          const stageScaling = 1.0 + (stageIndex - 1) * 0.08 + (worldIndex - 1) * 0.45;
          const waveScaling = 1.0 + currentWave * 0.04;
          const baseHpCalc = Math.round(180 * stageScaling * waveScaling);

          setCurrentMonster({
            id: `mob_${Date.now()}`,
            name: randomMob.name,
            maxHp: baseHpCalc,
            currentHp: baseHpCalc,
            atk: Math.round((14 + currentWave * 2) * stageScaling),
            armor: Math.round((18 + currentWave) * stageScaling),
            elementalType: randomMob.elem,
            isBoss: false,
            x: 280,
            y: canvas.height - 60,
          });
        } else {
          // Wave Cleared!
          const earnedGold = isCurrentBoss ? 250 : 50;
          addGold(earnedGold);

          if (isCurrentBoss) {
            const clearTimeSec = Math.max(1, Math.round((Date.now() - stageStartTime.current) / 1000));
            recordBattleVictory(worldIndex, stageIndex, clearTimeSec, 1500, 3, 'Boss Gear Chest');
            stageStartTime.current = Date.now();
          }

          advanceWave();
          currentMobInWave.current = 1;

          // Next Wave Setup: Waves 1..30 normal, Wave 31 is the Stage Boss
          const nextWaveNumber = currentWave >= 31 ? 1 : currentWave + 1;
          const nextIsBoss = nextWaveNumber === 31;
          totalMobsInWave.current = nextIsBoss ? 1 : Math.min(8, 3 + Math.floor(nextWaveNumber / 5));

          const nextMob = nextIsBoss ? bossTemplate : pool[Math.floor(Math.random() * pool.length)];
          const stageScaling = 1.0 + (stageIndex - 1) * 0.08 + (worldIndex - 1) * 0.45;
          const waveScaling = 1.0 + nextWaveNumber * 0.04;
          const baseHpCalc = Math.round(200 * stageScaling * waveScaling * (nextIsBoss ? 3.5 : 1.0));
          const baseAtkCalc = Math.round((15 + nextWaveNumber * 2) * stageScaling * (nextIsBoss ? 1.8 : 1.0));
          const baseArmorCalc = Math.round((20 + nextWaveNumber) * stageScaling * (nextIsBoss ? 1.5 : 1.0));

          setCurrentMonster({
            id: `mob_${Date.now()}`,
            name: nextMob.name + (nextIsBoss ? ' 👑' : ''),
            maxHp: baseHpCalc,
            currentHp: baseHpCalc,
            atk: baseAtkCalc,
            armor: baseArmorCalc,
            elementalType: nextMob.elem,
            isBoss: nextIsBoss,
            x: 280,
            y: canvas.height - 60,
          });
        }
      }

      // 4. Render Floating Damage Texts
      floatingTextsRef.current.forEach((ft) => {
        ft.y -= 25 * dt;
        ft.alpha -= 1.0 * dt;

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

      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.alpha > 0);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentMonster, currentWave, stageIndex, worldIndex, combatSpeed, getHeroTotalStats, setCurrentMonster, addGold, advanceWave, recordBattleVictory]);

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
