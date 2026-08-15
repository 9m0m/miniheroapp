'use client';

import React, { useState } from 'react';
import TopHUD from '@/components/layout/TopHUD';
import BottomNav, { TabType } from '@/components/layout/BottomNav';
import BattleCanvas from '@/features/battle/BattleCanvas';
import PartyManager from '@/features/party/PartyManager';
import CubeManager from '@/features/cube/CubeManager';
import { FlaskConical, Anvil, Sparkles, Trophy } from 'lucide-react';

export default function GameMainPage() {
  const [activeTab, setActiveTab] = useState<TabType>('PARTY');

  return (
    <main className="flex flex-col h-screen w-full select-none bg-game-dark overflow-hidden">
      {/* 1. Top HUD Bar (Currencies & Stage Progress) */}
      <TopHUD />

      {/* 2. 2D Game Battle Canvas (Always Live 60FPS) */}
      <BattleCanvas />

      {/* 3. Dynamic Management View by Active Tab */}
      <div className="flex-1 flex flex-col overflow-hidden bg-game-dark">
        {activeTab === 'BATTLE' && (
          <div className="p-4 flex flex-col items-center justify-center gap-3 text-center flex-1 text-xs">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 text-2xl">
              ⚔️
            </div>
            <h3 className="font-bold text-sm text-slate-100">Chiến Trường Tự Động (Idle Auto-Battle)</h3>
            <p className="text-slate-400 max-w-xs leading-relaxed">
              Đội hình 3 Heroes đang tự động diệt 30 waves quái vật và Stage Boss trên sàn đấu phía trên.
            </p>
            <div className="bg-game-card p-3 rounded-lg border border-game-border w-full text-left space-y-1.5 mt-2">
              <div className="flex justify-between text-slate-300">
                <span>Trạng thái:</span>
                <span className="text-emerald-400 font-bold">Đang Tự Động Chiến Đấu</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Rớt đồ:</span>
                <span className="text-yellow-400 font-mono">Gold + Đá + Rương</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PARTY' && <PartyManager />}
        {activeTab === 'CUBE' && <CubeManager />}

        {activeTab === 'ALCHEMY' && (
          <div className="p-4 flex flex-col items-center justify-center gap-3 text-center flex-1 text-xs">
            <FlaskConical className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h3 className="font-bold text-sm text-slate-100">Phòng Giả Kim (Alchemy Lab)</h3>
            <p className="text-slate-400 max-w-xs leading-relaxed">
              Nấu Giấy Chúc Phúc (Blessing Scrolls), Thuốc Kháng Nguyên Tố 4 Hệ và Tiên Dược Vĩnh Viễn.
            </p>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
              Sẵn Sàng Cho Giai Đoạn 2 (P1)
            </span>
          </div>
        )}

        {activeTab === 'BLACKSMITH' && (
          <div className="p-4 flex flex-col items-center justify-center gap-3 text-center flex-1 text-xs">
            <Anvil className="w-12 h-12 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">Xưởng Thợ Rèn (Blacksmith Crafting)</h3>
            <p className="text-slate-400 max-w-xs leading-relaxed">
              Chế tạo 4 Ô Phụ Kiện (Nhẫn, Dây Chuyền, Bùa Chú) và Đục Lỗ Khảm Ngọc (Socketing).
            </p>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
              Sẵn Sàng Cho Giai Đoạn 2 (P1)
            </span>
          </div>
        )}
      </div>

      {/* 4. Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </main>
  );
}
