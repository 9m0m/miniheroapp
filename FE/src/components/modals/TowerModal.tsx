'use client';

import React from 'react';
import { TowerManager } from '@/features/tower/TowerManager';

interface TowerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TowerModal: React.FC<TowerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md h-full max-h-[100dvh] bg-slate-950 border-x border-slate-800 flex flex-col shadow-2xl overflow-hidden relative">
        <TowerManager onClose={onClose} />
      </div>
    </div>
  );
};
