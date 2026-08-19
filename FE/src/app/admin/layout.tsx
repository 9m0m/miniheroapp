'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Gamepad2, LogOut, Activity, Database, Sparkles, Cpu, Layers } from 'lucide-react';
import { adminAuth } from '@/services/adminApi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    setMounted(true);
    if (!isLoginPage) {
      const authenticated = adminAuth.isAuthenticated();
      if (!authenticated) {
        setIsAuthenticated(false);
        router.replace('/admin/login');
      } else {
        setIsAuthenticated(true);
        setUsername(adminAuth.getUser() || 'superadmin');
      }
    }
  }, [isLoginPage, pathname, router]);

  const handleLogout = () => {
    adminAuth.clearSession();
    setIsAuthenticated(false);
    router.replace('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-mono">Verifying SuperAdmin Credentials...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top Cyber Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xl">
        {/* Brand & LiveOps Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-[2px] shadow-md shadow-blue-500/20">
            <div className="w-full h-full bg-[#080B11] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400">
                WORLD HERO
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold uppercase tracking-wider">
                LiveOps Portal
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Game CMS • Core v2 balancing</p>
          </div>
        </div>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Server Live Status */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>POSTGRESQL LIVE</span>
          </div>

          {/* SuperAdmin User Chip */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/80 text-xs">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-semibold text-slate-200">{username}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">SUPERADMIN</span>
          </div>

          {/* Play Game Button */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all"
            title="Open Game in new tab"
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">Play Game (Live)</span>
          </a>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-all"
            title="Logout from LiveOps Portal"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-[1680px] w-full mx-auto animate-fade-in">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-800/60 py-3 px-6 text-center text-xs text-slate-500 font-mono flex items-center justify-between">
        <span>World Hero LiveOps Engine v1.0 • Phase 5 Clean Architecture</span>
        <span>PostgreSQL 16 & Spring Boot 3 Engine</span>
      </footer>
    </div>
  );
}
