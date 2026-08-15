'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, Sparkles, Zap, ArrowUpCircle, CheckCircle2, Lock } from 'lucide-react';
import { HeroClass, HeroSkillTree, SkillNode } from '../../types';

export const SkillTreeModal: React.FC = () => {
  const {
    heroes,
    selectedHeroClass,
    gold,
    activeModal,
    closeModal,
    addFloatingText,
    upgradeHeroSkill,
  } = useGameStore();

  const hero = heroes[selectedHeroClass];
  const [skillTree, setSkillTree] = useState<HeroSkillTree | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Build local tree view based on class
  useEffect(() => {
    if (!hero) return;
    setSkillTree(getDefaultTreeForHero(hero.id, hero.heroClass, hero.skills || {}));
  }, [hero, selectedHeroClass]);

  if (activeModal !== 'SKILL_TREE' || !hero || !skillTree) return null;

  const handleUpgrade = async (skillNode: SkillNode) => {
    if (skillNode.currentLevel >= skillNode.maxLevel || gold < skillNode.goldCostNextLevel || isUpgrading) {
      return;
    }

    setIsUpgrading(true);
    const success = await upgradeHeroSkill(hero.id, skillNode.id);
    setIsUpgrading(false);

    if (success) {
      addFloatingText(`✨ UPGRADED: ${skillNode.name.toUpperCase()} (LV.${skillNode.currentLevel + 1})!`, 180, 80, '#10b981', true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 border border-yellow-500/30 p-5 shadow-2xl text-white">
        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold mb-1 border border-yellow-500/30">
            <Zap size={13} />
            <span>CLASS SKILL TREE</span>
          </div>
          <h3 className="text-base font-bold text-slate-100">{hero.name}</h3>
          <p className="text-[10px] text-slate-400">
            Upgrade specialized class passives with <strong>Gold</strong> to permanently empower combat stats.
          </p>
        </div>

        {/* Skill Nodes List */}
        <div className="space-y-3 mb-4">
          {skillTree.nodes.map((node) => {
            const isMax = node.currentLevel >= node.maxLevel;
            const canAfford = gold >= node.goldCostNextLevel;

            return (
              <div
                key={node.id}
                className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex flex-col gap-2 transition hover:border-slate-700 shadow-sm"
              >
                {/* Top: Icon + Name + Level */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-inner">
                      {node.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-100">{node.name}</span>
                        <span className="text-[10px] font-mono text-yellow-400 font-bold">
                          Lv.{node.currentLevel}/{node.maxLevel}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">{node.description}</p>
                    </div>
                  </div>
                </div>

                {/* Bonus Description */}
                <div className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-medium">
                  {node.bonusDescription}
                </div>

                {/* Level Pips & Upgrade Button */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                  {/* Progress pips */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: node.maxLevel }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-3.5 h-1.5 rounded-full transition-all ${
                          idx < node.currentLevel
                            ? 'bg-yellow-400 shadow-sm shadow-yellow-400/50'
                            : 'bg-slate-850'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Action button */}
                  {!isMax ? (
                    <button
                      onClick={() => handleUpgrade(node)}
                      disabled={!canAfford || isUpgrading}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                        canAfford && !isUpgrading
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-sm'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpCircle size={12} />
                      <span>{node.goldCostNextLevel.toLocaleString()}🪙 Upgrade</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> MAX
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function getDefaultTreeForHero(heroId: string, heroClass: HeroClass, skills: Record<string, number>): HeroSkillTree {
  switch (heroClass) {
    case 'WARRIOR':
      return {
        heroId,
        heroClass,
        heroName: 'Arthur (Warrior)',
        nodes: [
          {
            id: 'iron_wall',
            name: 'Iron Wall',
            description: 'Reinforces armor and reduces incoming damage.',
            icon: '🛡️',
            maxLevel: 5,
            currentLevel: skills['iron_wall'] || 0,
            goldCostNextLevel: 500 * ((skills['iron_wall'] || 0) + 1),
            bonusDescription: '+10 Armor • +2% Damage Reduction per level',
          },
          {
            id: 'berserk_strike',
            name: 'Berserk Strike',
            description: 'Boosts physical attack power and drains enemy life.',
            icon: '🩸',
            maxLevel: 5,
            currentLevel: skills['berserk_strike'] || 0,
            goldCostNextLevel: 500 * ((skills['berserk_strike'] || 0) + 1),
            bonusDescription: '+10 Phys ATK • +2% Lifesteal per level',
          },
          {
            id: 'whirlwind_slash',
            name: 'Whirlwind Slash',
            description: 'Sweeping cleave dealing massive critical damage.',
            icon: '🌪️',
            maxLevel: 5,
            currentLevel: skills['whirlwind_slash'] || 0,
            goldCostNextLevel: 500 * ((skills['whirlwind_slash'] || 0) + 1),
            bonusDescription: '+10% Crit DMG • +3% Total ATK per level',
          },
        ],
      };
    case 'RANGER':
      return {
        heroId,
        heroClass,
        heroName: 'Robin (Ranger)',
        nodes: [
          {
            id: 'eagle_eye',
            name: 'Eagle Eye',
            description: 'Sharpens eyesight, boosting Critical Rate and Attack Speed.',
            icon: '🦅',
            maxLevel: 5,
            currentLevel: skills['eagle_eye'] || 0,
            goldCostNextLevel: 500 * ((skills['eagle_eye'] || 0) + 1),
            bonusDescription: '+3% Crit Rate • +0.06 Attack Speed per level',
          },
          {
            id: 'venom_arrow',
            name: 'Venom Arrow',
            description: 'Enchants arrows with poison and increases dodge chance.',
            icon: '🏹',
            maxLevel: 5,
            currentLevel: skills['venom_arrow'] || 0,
            goldCostNextLevel: 500 * ((skills['venom_arrow'] || 0) + 1),
            bonusDescription: '+8% Elemental DMG • +3% Physical Dodge per level',
          },
          {
            id: 'deadly_sniping',
            name: 'Deadly Sniping',
            description: 'Armor-piercing sniping shot dealing lethal critical damage.',
            icon: '🎯',
            maxLevel: 5,
            currentLevel: skills['deadly_sniping'] || 0,
            goldCostNextLevel: 500 * ((skills['deadly_sniping'] || 0) + 1),
            bonusDescription: '+15% Crit DMG • +8 Phys ATK per level',
          },
        ],
      };
    case 'MAGE':
      return {
        heroId,
        heroClass,
        heroName: 'Merlin (Mage)',
        nodes: [
          {
            id: 'mana_flow',
            name: 'Mana Flow',
            description: 'Amplifies magic power and accelerates cooldown recovery.',
            icon: '🔮',
            maxLevel: 5,
            currentLevel: skills['mana_flow'] || 0,
            goldCostNextLevel: 500 * ((skills['mana_flow'] || 0) + 1),
            bonusDescription: '+12 Magic ATK • +3% Cooldown Reduction per level',
          },
          {
            id: 'pyroblast',
            name: 'Pyroblast',
            description: 'Summons devastating fireballs and enhances spell evasion.',
            icon: '🔥',
            maxLevel: 5,
            currentLevel: skills['pyroblast'] || 0,
            goldCostNextLevel: 500 * ((skills['pyroblast'] || 0) + 1),
            bonusDescription: '+10% Fire DMG • +4% Spell Evasion per level',
          },
          {
            id: 'void_blizzard',
            name: 'Void Blizzard',
            description: 'Unleashes an abyssal blizzard increasing overall damage.',
            icon: '❄️',
            maxLevel: 5,
            currentLevel: skills['void_blizzard'] || 0,
            goldCostNextLevel: 500 * ((skills['void_blizzard'] || 0) + 1),
            bonusDescription: '+5% Total ATK • +8% Elemental DMG per level',
          },
        ],
      };
    case 'PRIEST':
      return {
        heroId,
        heroClass,
        heroName: 'Elena (Priest)',
        nodes: [
          {
            id: 'divine_aura',
            name: 'Divine Aura',
            description: 'Radiates holy light, regenerating HP and shielding the party.',
            icon: '✨',
            maxLevel: 5,
            currentLevel: skills['divine_aura'] || 0,
            goldCostNextLevel: 500 * ((skills['divine_aura'] || 0) + 1),
            bonusDescription: '+12 HP/s Regen • +3% Damage Reduction per level',
          },
          {
            id: 'purification',
            name: 'Purification',
            description: 'Cleanses darkness and grants Chaos resistance.',
            icon: '🕯️',
            maxLevel: 5,
            currentLevel: skills['purification'] || 0,
            goldCostNextLevel: 500 * ((skills['purification'] || 0) + 1),
            bonusDescription: '+8% Chaos Res • +4% Cooldown Reduction per level',
          },
          {
            id: 'eternal_blessing',
            name: 'Eternal Blessing',
            description: 'Empowers vitality, boosting Max HP and all Elemental Resistances.',
            icon: '💖',
            maxLevel: 5,
            currentLevel: skills['eternal_blessing'] || 0,
            goldCostNextLevel: 500 * ((skills['eternal_blessing'] || 0) + 1),
            bonusDescription: '+50 Max HP • +4% All Resistances per level',
          },
        ],
      };
  }
}
