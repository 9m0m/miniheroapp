'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ModalShell } from '../ui/ModalShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Zap,
  CheckCircle2,
  Coins,
  Sparkles,
} from 'lucide-react';
import { HeroClass, HeroSkillTree, SkillNode } from '../../types';

export const SkillTreeModal: React.FC = () => {
  const heroes = useGameStore((state) => state.heroes);
  const selectedHeroClass = useGameStore((state) => state.selectedHeroClass);
  const gold = useGameStore((state) => state.gold);
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const addFloatingText = useGameStore((state) => state.addFloatingText);
  const upgradeHeroSkill = useGameStore((state) => state.upgradeHeroSkill);

  const hero = heroes[selectedHeroClass];
  const [skillTree, setSkillTree] = useState<HeroSkillTree | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (!hero) return;
    setSkillTree(getDefaultTreeForHero(hero.id, hero.heroClass || selectedHeroClass, hero.skills || {}));
  }, [hero, selectedHeroClass]);

  if (activeModal !== 'SKILL_TREE' || !hero || !skillTree) return null;

  const handleUpgrade = async (skillNode: SkillNode) => {
    if (skillNode.currentLevel >= skillNode.maxLevel || gold < skillNode.goldCostNextLevel || isUpgrading) {
      return;
    }

    setIsUpgrading(true);
    const success = upgradeHeroSkill(hero.heroClass || selectedHeroClass, skillNode.id);
    setIsUpgrading(false);

    if (success) {
      addFloatingText(`Skill Upgraded: ${skillNode.name}!`, 180, 80, '#10b981', true);
    }
  };

  return (
    <ModalShell
      isOpen={activeModal === 'SKILL_TREE'}
      onClose={closeModal}
      icon={<Zap size={18} className="text-yellow-400" />}
      title={`${hero.name} Skill Tree`}
      description="Hero Passive Talents"
    >
      <div className="space-y-2.5 select-none">
        {/* Skill Nodes List */}
        <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-0.5">
          {skillTree.nodes.map((node) => {
            const isMax = node.currentLevel >= node.maxLevel;
            const canAfford = gold >= node.goldCostNextLevel;

            return (
              <div
                key={node.id}
                className="flex flex-col gap-1.5 p-2.5 bg-[#0e131d] border border-[#1e293b] rounded-lg shadow-sm"
              >
                {/* Top: Icon + Name + Level */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-[#080b12] border border-[#1e293b] flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                      <Sparkles size={15} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-100 truncate">{node.name}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-black">
                          Lv.{node.currentLevel}/{node.maxLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{node.description}</p>
                    </div>
                  </div>
                </div>

                {/* Bonus Description */}
                <div className="text-[11px] text-emerald-300 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/20 font-medium">
                  {node.bonusDescription}
                </div>

                {/* Level Pips & Upgrade Button */}
                <div className="flex items-center justify-between pt-1 border-t border-[#1e293b]">
                  {/* Progress pips */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: node.maxLevel }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-3.5 h-1.5 rounded-full ${
                          idx < node.currentLevel
                            ? 'bg-amber-400'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Action button */}
                  {!isMax ? (
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={() => handleUpgrade(node)}
                      disabled={!canAfford || isUpgrading}
                      className="font-bold text-xs"
                    >
                      <Coins size={11} className="mr-1" aria-hidden="true" />
                      <span>{node.goldCostNextLevel.toLocaleString()} Upgrade</span>
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-black flex items-center gap-1">
                      <CheckCircle2 size={13} aria-hidden="true" /> MAX
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Button variant="secondary" fullWidth onClick={closeModal} className="min-h-[44px]">
          Close
        </Button>
      </div>
    </ModalShell>
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
            icon: 'Shield',
            maxLevel: 5,
            currentLevel: skills['iron_wall'] || 0,
            goldCostNextLevel: 500 * ((skills['iron_wall'] || 0) + 1),
            bonusDescription: '+10 Armor • +2% Damage Reduction per level',
          },
          {
            id: 'berserk_strike',
            name: 'Berserk Strike',
            description: 'Boosts physical attack power and drains enemy life.',
            icon: 'Activity',
            maxLevel: 5,
            currentLevel: skills['berserk_strike'] || 0,
            goldCostNextLevel: 500 * ((skills['berserk_strike'] || 0) + 1),
            bonusDescription: '+10 Phys ATK • +2% Lifesteal per level',
          },
          {
            id: 'whirlwind_slash',
            name: 'Whirlwind Slash',
            description: 'Sweeping cleave dealing massive critical damage.',
            icon: 'Zap',
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
            icon: 'Target',
            maxLevel: 5,
            currentLevel: skills['eagle_eye'] || 0,
            goldCostNextLevel: 500 * ((skills['eagle_eye'] || 0) + 1),
            bonusDescription: '+3% Crit Rate • +0.06 Attack Speed per level',
          },
          {
            id: 'venom_arrow',
            name: 'Venom Arrow',
            description: 'Enchants arrows with poison and increases dodge chance.',
            icon: 'Droplet',
            maxLevel: 5,
            currentLevel: skills['venom_arrow'] || 0,
            goldCostNextLevel: 500 * ((skills['venom_arrow'] || 0) + 1),
            bonusDescription: '+8% Elemental DMG • +3% Physical Dodge per level',
          },
          {
            id: 'deadly_sniping',
            name: 'Deadly Sniping',
            description: 'Armor-piercing sniping shot dealing lethal critical damage.',
            icon: 'Zap',
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
            icon: 'Sparkles',
            maxLevel: 5,
            currentLevel: skills['mana_flow'] || 0,
            goldCostNextLevel: 500 * ((skills['mana_flow'] || 0) + 1),
            bonusDescription: '+12 Magic ATK • +3% Cooldown Reduction per level',
          },
          {
            id: 'pyroblast',
            name: 'Pyroblast',
            description: 'Summons devastating fireballs and enhances spell evasion.',
            icon: 'Flame',
            maxLevel: 5,
            currentLevel: skills['pyroblast'] || 0,
            goldCostNextLevel: 500 * ((skills['pyroblast'] || 0) + 1),
            bonusDescription: '+10% Fire DMG • +4% Spell Evasion per level',
          },
          {
            id: 'void_blizzard',
            name: 'Void Blizzard',
            description: 'Unleashes an abyssal blizzard increasing overall damage.',
            icon: 'Snowflake',
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
            icon: 'Sun',
            maxLevel: 5,
            currentLevel: skills['divine_aura'] || 0,
            goldCostNextLevel: 500 * ((skills['divine_aura'] || 0) + 1),
            bonusDescription: '+12 HP/s Regen • +3% Damage Reduction per level',
          },
          {
            id: 'purification',
            name: 'Purification',
            description: 'Cleanses darkness and grants Chaos resistance.',
            icon: 'Sparkles',
            maxLevel: 5,
            currentLevel: skills['purification'] || 0,
            goldCostNextLevel: 500 * ((skills['purification'] || 0) + 1),
            bonusDescription: '+8% Chaos Res • +4% Cooldown Reduction per level',
          },
          {
            id: 'eternal_blessing',
            name: 'Eternal Blessing',
            description: 'Empowers vitality, boosting Max HP and all Elemental Resistances.',
            icon: 'Heart',
            maxLevel: 5,
            currentLevel: skills['eternal_blessing'] || 0,
            goldCostNextLevel: 500 * ((skills['eternal_blessing'] || 0) + 1),
            bonusDescription: '+50 Max HP • +4% All Resistances per level',
          },
        ],
      };
  }
}

export default SkillTreeModal;
