'use client';

import React from 'react';
import { BuildInspectResponse } from '@/types/trial.types';
import { ModalShell } from '../ui/ModalShell';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Lock, Sparkles, Shield, Target, HeartPulse } from 'lucide-react';

interface InspectBuildModalProps {
  data: BuildInspectResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

const CLASS_ICONS: Record<string, React.ElementType> = {
  WARRIOR: Shield,
  RANGER: Target,
  MAGE: Sparkles,
  PRIEST: HeartPulse,
};

export const InspectBuildModal: React.FC<InspectBuildModalProps> = ({ data, isOpen, onClose }) => {
  if (!isOpen || !data) return null;

  let parsedSnapshot: any = null;
  if (data.heroesSnapshotJson) {
    try {
      parsedSnapshot = JSON.parse(data.heroesSnapshotJson);
    } catch (e) {
      console.error('Failed to parse heroes snapshot:', e);
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={<Sparkles size={18} className="text-purple-400" />}
      title={`${data.username}'s Build`}
      description={data.message}
    >
      <div className="space-y-3 select-none">
        {!data.isBuildPublic && !parsedSnapshot ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock size={20} aria-hidden="true" />
            </div>
            <h4 className="text-sm font-bold text-slate-100">Private Tactical Build</h4>
            <p className="text-xs text-slate-400 max-w-xs">
              This player has chosen to keep their build configuration private.
            </p>
          </div>
        ) : parsedSnapshot ? (
          <div className="space-y-2 max-h-[44vh] overflow-y-auto pr-0.5">
            {['WARRIOR', 'RANGER', 'MAGE', 'PRIEST'].map((heroClass) => {
              const hero = parsedSnapshot.heroes ? parsedSnapshot.heroes[heroClass] : null;
              if (!hero) return null;
              const Icon = CLASS_ICONS[heroClass] || Shield;

              return (
                <div
                  key={heroClass}
                  className="space-y-1.5 p-2.5 bg-[#0e131d] border border-[#1e293b] rounded-lg shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon size={15} className="text-cyan-400" aria-hidden="true" />
                      <span className="text-xs font-black text-slate-100">{heroClass}</span>
                    </div>
                    <Badge variant="accent" size="xs">
                      Lv.{hero.level || 1}
                    </Badge>
                  </div>

                  {/* Stat Highlights */}
                  <div className="grid grid-cols-2 gap-1 text-xs font-mono text-slate-300">
                    <div className="flex justify-between bg-[#080b12] p-1.5 rounded border border-[#1e293b]">
                      <span className="text-slate-400">Total ATK:</span>
                      <span className="text-amber-400 font-bold tabular-nums">
                        {Math.round((hero.computedStats?.physAtk || 0) + (hero.computedStats?.magicAtk || 0))}
                      </span>
                    </div>

                    <div className="flex justify-between bg-[#080b12] p-1.5 rounded border border-[#1e293b]">
                      <span className="text-slate-400">Armor:</span>
                      <span className="text-blue-400 font-bold tabular-nums">
                        {Math.round(hero.computedStats?.armor || 0)}
                      </span>
                    </div>

                    <div className="flex justify-between bg-[#080b12] p-1.5 rounded border border-[#1e293b]">
                      <span className="text-slate-400">Max HP:</span>
                      <span className="text-emerald-400 font-bold tabular-nums">
                        {Math.round(hero.computedStats?.maxHp || 100)}
                      </span>
                    </div>

                    <div className="flex justify-between bg-[#080b12] p-1.5 rounded border border-[#1e293b]">
                      <span className="text-slate-400">Crit Rate:</span>
                      <span className="text-yellow-400 font-bold tabular-nums">
                        {Math.round(hero.computedStats?.critRate || 5)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <Button variant="secondary" fullWidth onClick={onClose} className="min-h-[44px]">
          Close
        </Button>
      </div>
    </ModalShell>
  );
};

export default InspectBuildModal;
