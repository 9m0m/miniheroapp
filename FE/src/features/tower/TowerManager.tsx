'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { towerApi } from '@/services/towerApi';
import { TowerFloorDto, TowerProgressDto, TowerPartyV2Dto, TowerAttemptResponseDto } from '@/types/tower.types';
import { TowerBattleResult } from '@/domain/combat/combat.types';
import { TowerLobby } from './TowerLobby';
import { PartyBuilder } from './PartyBuilder';
import { FloorPreview } from './FloorPreview';
import { TowerBattleBoard } from './TowerBattleBoard';
import { TowerResultsSheet } from './TowerResultsSheet';

type TowerView = 'LOBBY' | 'PARTY_BUILDER' | 'FLOOR_PREVIEW' | 'BATTLE' | 'RESULT';

interface TowerManagerProps {
  onClose?: () => void;
}

export const TowerManager: React.FC<TowerManagerProps> = ({ onClose }) => {
  const { ownedHeroesById } = useGameStore();
  const ownedList = Object.values(ownedHeroesById || {});
  const heroesList = ownedList;

  const [currentView, setCurrentView] = useState<TowerView>('LOBBY');
  const [progress, setProgress] = useState<TowerProgressDto | undefined>();
  const [floors, setFloors] = useState<TowerFloorDto[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<TowerFloorDto | null>(null);
  const [battleResult, setBattleResult] = useState<TowerBattleResult | null>(null);
  const [attemptResponse, setAttemptResponse] = useState<TowerAttemptResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBattleStarting, setIsBattleStarting] = useState(false);
  const [isRetreating, setIsRetreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeAttemptKey, setActiveAttemptKey] = useState<string | null>(null);
  const attemptKeyRef = React.useRef<string | null>(null);

  const getOrCreateAttemptKey = (floorNum: number): string => {
    const storageKey = `wh_tower_attempt_key_f${floorNum}`;
    let existingKey = typeof window !== 'undefined' ? sessionStorage.getItem(storageKey) : null;
    if (!existingKey || !existingKey.startsWith(`attempt_${floorNum}_`)) {
      existingKey = `attempt_${floorNum}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(storageKey, existingKey);
      }
    }
    attemptKeyRef.current = existingKey;
    setActiveAttemptKey(existingKey);
    return existingKey;
  };

  const clearAttemptKey = () => {
    attemptKeyRef.current = null;
    setActiveAttemptKey(null);
    if (typeof window !== 'undefined' && selectedFloor) {
      sessionStorage.removeItem(`wh_tower_attempt_key_f${selectedFloor.floorNumber}`);
    }
  };

  const fetchTowerData = async (checkRecovery = false) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const prog = await towerApi.getMyProgress();
      const seasonId = prog.seasonId || 'season-1';
      const floorList = await towerApi.getFloors(seasonId);
      setProgress(prog);
      setFloors(floorList);

      // Reload / Session recovery if user has an unacknowledged attempt (only on initial load)
      if (checkRecovery && prog.unacknowledgedAttempt) {
        const unack = prog.unacknowledgedAttempt;
        setAttemptResponse(unack);
        setBattleResult({
          winner: unack.winner,
          roundsUsed: unack.roundsUsed,
          remainingPlayerHpPercent: unack.remainingHpPercent,
          calculatedScore: unack.score,
          replayEvents: unack.replayEvents || [],
          finalCombatants: unack.combatants || [],
        });
        setCurrentView('RESULT');
      }
    } catch (err: any) {
      console.error('Failed to load tower data', err);
      setErrorMsg('Failed to load Tower data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTowerData(true);
  }, []);

  const handleSelectFloor = (floor: TowerFloorDto) => {
    setSelectedFloor(floor);
    getOrCreateAttemptKey(floor.floorNumber);
    setCurrentView('FLOOR_PREVIEW');
  };

  const handleEditTeam = () => {
    setCurrentView('PARTY_BUILDER');
  };

  const handleSaveParty = async (party: TowerPartyV2Dto) => {
    try {
      const savedParty = await towerApi.savePartyV2(party);
      if (progress) {
        setProgress({
          ...progress,
          savedPartyV2: savedParty,
        });
      }
      setCurrentView(selectedFloor ? 'FLOOR_PREVIEW' : 'LOBBY');
    } catch (err: any) {
      console.error('Failed to save tower party', err);
      alert(err.response?.data?.message || 'Failed to save party');
    }
  };

  const handleStartBattle = async () => {
    if (isBattleStarting || !selectedFloor) return;

    let partyV2 = progress?.savedPartyV2;
    if (!partyV2?.slots || partyV2.slots.length !== 3) {
      if (heroesList.length < 3) {
        alert('You need at least 3 heroes to enter Tower');
        return;
      }
      partyV2 = {
        slots: [
          { heroId: heroesList[0].id, row: 'FRONT', col: 'CENTER' },
          { heroId: heroesList[1].id, row: 'BACK', col: 'LEFT' },
          { heroId: heroesList[2].id, row: 'BACK', col: 'RIGHT' },
        ],
        tactic: 'BALANCED',
        heroPolicies: {},
        energyPriority: heroesList.slice(0, 3).map((hero) => hero.id),
      };
    }

    // Ensure slots are mapped to unique 3x2 cells with zero collisions
    const occupied = new Set<string>();
    const validSlots = partyV2.slots.map((s, idx) => {
      let row: 'FRONT' | 'BACK' = s.row === 'FRONT' ? 'FRONT' : 'BACK';
      let col: 'LEFT' | 'CENTER' | 'RIGHT' = s.col || (row === 'FRONT' ? 'CENTER' : idx === 1 ? 'LEFT' : 'RIGHT');

      let key = `${row}_${col}`;
      if (occupied.has(key)) {
        const fallbacks: Array<{ row: 'FRONT' | 'BACK'; col: 'LEFT' | 'CENTER' | 'RIGHT' }> = [
          { row: 'FRONT', col: 'CENTER' },
          { row: 'BACK', col: 'LEFT' },
          { row: 'BACK', col: 'RIGHT' },
          { row: 'FRONT', col: 'LEFT' },
          { row: 'FRONT', col: 'RIGHT' },
          { row: 'BACK', col: 'CENTER' },
        ];
        const nextFree = fallbacks.find((f) => !occupied.has(`${f.row}_${f.col}`));
        if (nextFree) {
          row = nextFree.row;
          col = nextFree.col;
          key = `${row}_${col}`;
        }
      }
      occupied.add(key);

      return {
        heroId: s.heroId,
        row,
        col,
      };
    });

    const idempotencyKey = getOrCreateAttemptKey(selectedFloor.floorNumber);

    try {
      setIsBattleStarting(true);
      const response = await towerApi.createAttempt({
        floorNumber: selectedFloor.floorNumber,
        slots: validSlots,
        tactic: partyV2.tactic,
        heroPolicies: partyV2.heroPolicies,
        energyPriority: partyV2.energyPriority,
        idempotencyKey,
      });

      // Construct client battle result from backend replay response
      const clientBattleResult: TowerBattleResult = {
        winner: response.winner,
        roundsUsed: response.roundsUsed,
        remainingPlayerHpPercent: response.remainingHpPercent,
        calculatedScore: response.score,
        replayEvents: response.replayEvents || [],
        finalCombatants: response.combatants || [],
      };

      setAttemptResponse(response);
      setBattleResult(clientBattleResult);
      setCurrentView('BATTLE');
      clearAttemptKey();
    } catch (err: any) {
      console.error('Failed to start tower attempt', err);
      alert(err.response?.data?.message || 'Failed to start battle');
    } finally {
      setIsBattleStarting(false);
    }
  };

  const handleBattleFinished = async () => {
    if (attemptResponse) {
      try {
        await towerApi.acknowledgeAttempt(attemptResponse.attemptId);
      } catch (err) {
        console.warn('Acknowledge failed non-fatally', err);
      }
    }
    // Refresh progress with backend before showing results
    await fetchTowerData();
    setCurrentView('RESULT');
  };

  const handleSurrender = async (): Promise<boolean> => {
    if (attemptResponse) {
      try {
        setIsRetreating(true);
        await towerApi.acknowledgeAttempt(attemptResponse.attemptId);
      } catch (err: any) {
        console.error('Failed to acknowledge attempt on retreat', err);
        alert(err.response?.data?.message || 'Failed to acknowledge retreat with server. Please try again.');
        return false;
      } finally {
        setIsRetreating(false);
      }
    }
    clearAttemptKey();
    setAttemptResponse(null);
    setBattleResult(null);
    fetchTowerData();
    setCurrentView(selectedFloor ? 'FLOOR_PREVIEW' : 'LOBBY');
    return true;
  };

  const handleNextFloor = () => {
    if (!attemptResponse) return;
    const nextNum = attemptResponse.floorNumber + 1;
    const nextFloor = floors.find((f) => f.floorNumber === nextNum);
    setBattleResult(null);
    setAttemptResponse(null);
    if (nextFloor) {
      setSelectedFloor(nextFloor);
      getOrCreateAttemptKey(nextFloor.floorNumber);
      setCurrentView('FLOOR_PREVIEW');
    } else {
      setCurrentView('LOBBY');
    }
  };

  const handleRetryFloor = () => {
    setBattleResult(null);
    setAttemptResponse(null);
    if (selectedFloor) {
      getOrCreateAttemptKey(selectedFloor.floorNumber);
      setCurrentView('FLOOR_PREVIEW');
    } else {
      setCurrentView('LOBBY');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-slate-300 p-4 select-none">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold">Loading Progress Tower...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-slate-300 p-4 select-none text-center">
        <p className="text-sm text-red-400 font-bold mb-3">{errorMsg}</p>
        <button
          onClick={() => fetchTowerData()}
          className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  switch (currentView) {
    case 'PARTY_BUILDER':
      return (
        <PartyBuilder
          ownedHeroes={heroesList}
          currentPartyV2={progress?.savedPartyV2}
          onSave={handleSaveParty}
          onBack={() => setCurrentView('LOBBY')}
        />
      );

    case 'FLOOR_PREVIEW':
      return selectedFloor ? (
        <FloorPreview
          floor={selectedFloor}
          onStartBattle={handleStartBattle}
          onEditTeam={() => setCurrentView('PARTY_BUILDER')}
          onBack={() => setCurrentView('LOBBY')}
          isLoading={isBattleStarting}
        />
      ) : (
        <TowerLobby
          progress={progress}
          floors={floors}
          ownedHeroes={heroesList}
          onSelectFloor={(f) => {
            setSelectedFloor(f);
            setCurrentView('FLOOR_PREVIEW');
          }}
          onEditTeam={() => setCurrentView('PARTY_BUILDER')}
          onClose={onClose}
        />
      );

    case 'BATTLE':
      return battleResult ? (
        <TowerBattleBoard
          battleResult={battleResult}
          onFinish={handleBattleFinished}
          onSurrender={handleSurrender}
          isRetreating={isRetreating}
        />
      ) : null;

    case 'RESULT':
      return attemptResponse ? (
        <TowerResultsSheet
          result={attemptResponse}
          onNextFloor={handleNextFloor}
          onRetry={handleRetryFloor}
          onLobby={() => setCurrentView('LOBBY')}
        />
      ) : null;

    case 'LOBBY':
    default:
      return (
        <TowerLobby
          progress={progress}
          floors={floors}
          ownedHeroes={heroesList}
          onSelectFloor={(f) => {
            setSelectedFloor(f);
            setCurrentView('FLOOR_PREVIEW');
          }}
          onEditTeam={() => setCurrentView('PARTY_BUILDER')}
          onClose={onClose}
        />
      );
  }
};
