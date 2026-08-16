'use client';

import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { calculateDamagePerHit } from '@/engine/damageCalculator';
import { ElementalType, HeroClass, Monster } from '@/types/game.types';
import { assetManager } from '@/engine/AssetManager';
import { BackgroundRenderer } from '@/engine/renderers/BackgroundRenderer';
import { HeroRenderer } from '@/engine/renderers/HeroRenderer';
import { MonsterRenderer } from '@/engine/renderers/MonsterRenderer';
import { CombatEffectsRenderer } from '@/engine/renderers/CombatEffectsRenderer';

const WORLD_MONSTER_POOLS: Record<number, { name: string; icon: string; elem: ElementalType }[]> = {
  1: [
    { name: 'Emerald Timberwolf', icon: '🐺', elem: 'PHYSICAL' },
    { name: 'Infernal Fire Wolf', icon: '🔥', elem: 'FIRE' },
    { name: 'Glacial Frost Wolf', icon: '❄️', elem: 'COLD' },
    { name: 'Thunder Wolf Alpha', icon: '⚡', elem: 'CHAOS' },
  ],
  2: [
    { name: 'Glacial Frost Wolf', icon: '❄️', elem: 'COLD' },
    { name: 'Subzero Frost Stalker', icon: '🐺', elem: 'COLD' },
    { name: 'Ancient Ice Wyrm', icon: '🐉', elem: 'COLD' },
    { name: 'Emerald Timberwolf', icon: '🐺', elem: 'PHYSICAL' },
  ],
  3: [
    { name: 'Infernal Fire Wolf', icon: '🔥', elem: 'FIRE' },
    { name: 'Volcanic Lava Hound', icon: '🐕', elem: 'FIRE' },
    { name: 'Magma Caldera Brute', icon: '🌋', elem: 'FIRE' },
    { name: 'Fire Lord Whelp', icon: '🔥', elem: 'FIRE' },
  ],
  4: [
    { name: 'Cosmic Void Wolf', icon: '🪐', elem: 'CHAOS' },
    { name: 'Thunder Wolf Alpha', icon: '⚡', elem: 'CHAOS' },
    { name: 'Abyssal Chaos Stalker', icon: '👤', elem: 'CHAOS' },
    { name: 'Primordial Fiend', icon: '👾', elem: 'CHAOS' },
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

  // Store action references and live state snapshot in refs to eliminate re-mount loops
  const stateRef = useRef({
    heroes: useGameStore.getState().heroes,
    activeParty: useGameStore.getState().activeParty,
    currentMonster: useGameStore.getState().currentMonster,
    currentWave: useGameStore.getState().currentWave,
    stageIndex: useGameStore.getState().stageIndex,
    worldIndex: useGameStore.getState().worldIndex,
    combatSpeed: useGameStore.getState().combatSpeed,
  });

  const actionsRef = useRef({
    getHeroTotalStats: useGameStore.getState().getHeroTotalStats,
    setCurrentMonster: useGameStore.getState().setCurrentMonster,
    addGold: useGameStore.getState().addGold,
    advanceWave: useGameStore.getState().advanceWave,
    recordBattleVictory: useGameStore.getState().recordBattleVictory,
  });

  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state) => {
      stateRef.current = {
        heroes: state.heroes,
        activeParty: state.activeParty,
        currentMonster: state.currentMonster,
        currentWave: state.currentWave,
        stageIndex: state.stageIndex,
        worldIndex: state.worldIndex,
        combatSpeed: state.combatSpeed,
      };
      actionsRef.current = {
        getHeroTotalStats: state.getHeroTotalStats,
        setCurrentMonster: state.setCurrentMonster,
        addGold: state.addGold,
        advanceWave: state.advanceWave,
        recordBattleVictory: state.recordBattleVictory,
      };
    });
    return () => unsubscribe();
  }, []);

  const stageStartTime = useRef<number>(Date.now());
  const floorOffset = useRef<number>(0);
  const heroHpRef = useRef<number>(150);
  const monsterAttackTimer = useRef<number>(0);
  const priestHealTimer = useRef<number>(0);

  const currentMobInWave = useRef<number>(1);
  const totalMobsInWave = useRef<number>(4);

  const attackTimers = useRef<Record<HeroClass, number>>({
    WARRIOR: 0,
    RANGER: 0,
    MAGE: 0,
    PRIEST: 0,
  });

  const lastFrameTime = useRef<number>(performance.now());
  const effectsRenderer = useRef<CombatEffectsRenderer>(new CombatEffectsRenderer());

  useEffect(() => {
    // Initialize assets preloader
    assetManager.init();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = (currentTime: number) => {
      const {
        activeParty,
        worldIndex,
        stageIndex,
        currentWave,
        combatSpeed,
      } = stateRef.current;
      const {
        getHeroTotalStats,
        setCurrentMonster,
        addGold,
        advanceWave,
        recordBattleVictory,
      } = actionsRef.current;

      const rawDt = (currentTime - lastFrameTime.current) / 1000;
      lastFrameTime.current = currentTime;
      const speedMult = combatSpeed || 1;
      const dt = Math.min(0.1, rawDt) * speedMult;

      // 1. Render World Background & Parallax Floor
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      floorOffset.current = (floorOffset.current + 35 * dt) % 24;
      BackgroundRenderer.render(
        ctx,
        canvas.width,
        canvas.height,
        worldIndex,
        stageIndex,
        floorOffset.current,
        currentTime,
        assetManager
      );

      // 2. Render Party Heroes & Hero Sprites
      const deployedHeroes = HeroRenderer.renderHeroes(
        ctx,
        canvas.height,
        activeParty,
        currentTime,
        attackTimers.current,
        assetManager
      );

      // Priest Passive Healing Tick every 3s
      if (activeParty.includes('PRIEST')) {
        priestHealTimer.current += dt;
        if (priestHealTimer.current >= 3.0) {
          priestHealTimer.current = 0;
          heroHpRef.current = Math.min(250, heroHpRef.current + 25);
          effectsRenderer.current.spawnFloatingText(135, canvas.height - 65, '+25 HP', '#34D399', false);
        }
      }

      const currentMob = stateRef.current.currentMonster;

      // 3. Render Monster & Monster Counter-Attack
      if (currentMob && currentMob.currentHp > 0) {
        MonsterRenderer.render(
          ctx,
          currentMob,
          currentWave,
          currentMobInWave.current,
          totalMobsInWave.current,
          assetManager
        );

        // Monster Counter-Attack
        monsterAttackTimer.current += dt;
        if (monsterAttackTimer.current >= 1.8) {
          monsterAttackTimer.current = 0;
          const monsterDmg = Math.max(5, currentMob.atk - 10);
          heroHpRef.current = Math.max(20, heroHpRef.current - monsterDmg);

          effectsRenderer.current.spawnFloatingText(
            125 + (Math.random() * 10 - 5),
            canvas.height - 75,
            `-${monsterDmg}`,
            '#F87171',
            false
          );

          effectsRenderer.current.renderAttackBeam(
            ctx,
            currentMob.x - 10,
            currentMob.y,
            135,
            canvas.height - 60,
            '#EF4444'
          );
        }
      } else if (currentMob && currentMob.currentHp <= 0) {
        // Monster Defeated!
        const pool = WORLD_MONSTER_POOLS[worldIndex] || WORLD_MONSTER_POOLS[1];
        const bossTemplate = WORLD_BOSS_TEMPLATES[worldIndex] || WORLD_BOSS_TEMPLATES[1];
        const isCurrentBoss = currentWave === 31;

        if (!isCurrentBoss && currentMobInWave.current < totalMobsInWave.current) {
          currentMobInWave.current += 1;
          addGold(20);

          const randomMob = pool[Math.floor(Math.random() * pool.length)];
          const newMob: Monster = {
            id: `mob_w${worldIndex}_s${stageIndex}_${Date.now()}`,
            name: randomMob.name,
            maxHp: 200 + currentWave * 50,
            currentHp: 200 + currentWave * 50,
            atk: 25 + currentWave * 4,
            armor: 10 + currentWave * 2,
            elementalType: randomMob.elem,
            x: 290,
            y: canvas.height - 52,
          };
          setCurrentMonster(newMob);
        } else {
          // Wave Cleared
          const earnedGold = 100 + currentWave * 25;
          const earnedStones = currentWave === 31 ? 3 : 1;
          addGold(earnedGold);
          const timeSpentSec = Math.max(1, Math.round((Date.now() - stageStartTime.current) / 1000));
          recordBattleVictory(worldIndex, stageIndex, timeSpentSec, earnedGold, earnedStones);

          if (currentWave === 31) {
            stageStartTime.current = Date.now();
          }

          advanceWave();

          const isNextWaveBoss = currentWave + 1 === 31;
          currentMobInWave.current = 1;
          totalMobsInWave.current = isNextWaveBoss ? 1 : Math.floor(Math.random() * 3) + 3;

          const mobConfig = isNextWaveBoss
            ? bossTemplate
            : pool[Math.floor(Math.random() * pool.length)];

          const hpScaling = isNextWaveBoss ? 3500 + stageIndex * 1500 : 250 + (currentWave + 1) * 60;
          const atkScaling = isNextWaveBoss ? 120 + stageIndex * 40 : 30 + (currentWave + 1) * 5;

          const newMob: Monster = {
            id: `mob_w${worldIndex}_s${stageIndex}_w${currentWave + 1}`,
            name: mobConfig.name,
            maxHp: hpScaling,
            currentHp: hpScaling,
            atk: atkScaling,
            armor: 15 + currentWave * 3,
            elementalType: mobConfig.elem,
            x: 290,
            y: canvas.height - 52,
          };
          setCurrentMonster(newMob);
        }
      }

      // 4. Hero Combat Attacks on Monster
      if (currentMob && currentMob.currentHp > 0) {
        deployedHeroes.forEach((heroPos) => {
          const stats = getHeroTotalStats(heroPos.class);
          const heroAtkInterval = Math.max(0.4, 1.2 / (stats.atkSpeed || 1));

          attackTimers.current[heroPos.class] += dt;
          if (attackTimers.current[heroPos.class] >= heroAtkInterval) {
            attackTimers.current[heroPos.class] = 0;

            const calc = calculateDamagePerHit(stats, 1.0, currentMob.armor || 0, 0, 0);
            const actualDmg = Math.max(1, Math.round(calc.finalDamage));

            currentMob.currentHp = Math.max(0, currentMob.currentHp - actualDmg);
            setCurrentMonster({ ...currentMob });

            const textColor = calc.isCrit ? '#F59E0B' : heroPos.color;
            const textContent = calc.isCrit ? `💥 ${actualDmg}!` : `${actualDmg}`;

            effectsRenderer.current.spawnFloatingText(
              currentMob.x + (Math.random() * 16 - 8),
              currentMob.y - 12 - (Math.random() * 10),
              textContent,
              textColor,
              calc.isCrit
            );

            // Trigger Hero-Specific Attack VFX (Warrior Slash / Archer Arrow / Mage Orb / Priest Heal)
            effectsRenderer.current.spawnHeroAttackVFX(
              heroPos.class,
              heroPos.x + 10,
              heroPos.y - 6,
              currentMob.x - 8,
              currentMob.y
            );
          }
        });
      }

      // 5. Render Floating Texts & Particle Effects
      effectsRenderer.current.renderAndTick(ctx, dt);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
