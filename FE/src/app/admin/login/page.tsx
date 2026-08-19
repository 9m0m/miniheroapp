'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, Key, ArrowRight, Gamepad2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminApi, adminAuth } from '@/services/adminApi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (adminAuth.isAuthenticated()) {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await adminApi.login(username.trim(), password.trim());
      adminAuth.setSession(res.token, res.username, rememberMe);
      setSuccessMsg('Authentication successful! Redirecting to LiveOps Portal...');
      setTimeout(() => {
        router.push('/admin');
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid SuperAdmin username or password!');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('superadmin');
    setPassword('adminpassword123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#07090E] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Dynamic Cyber Background Gradients & Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-md bg-[#0F141E]/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-blue-950/40 relative z-10">
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-blue-500/20 mb-3 animate-pulse-fast">
            <div className="w-full h-full bg-[#0B0F19] rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            SuperAdmin Portal
          </div>

          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400">
            WORLD HERO LIVEOPS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Game Management & Live Balancing Control Center
          </p>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Username</span>
              {process.env.NODE_ENV !== 'production' && (
                <span className="text-[10px] text-slate-500 font-mono">superadmin (dev)</span>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                required
                className="w-full bg-[#161C28] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Password</span>
              {process.env.NODE_ENV !== 'production' && (
                <span className="text-[10px] text-slate-500 font-mono">adminpassword123 (dev)</span>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter SuperAdmin password..."
                required
                className="w-full bg-[#161C28] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Remember Me & Quick Fill Helper */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-[#161C28] text-blue-500 focus:ring-blue-500/30 w-4 h-4"
              />
              <span>Remember session</span>
            </label>

            {process.env.NODE_ENV !== 'production' && (
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Fill Dev Credentials</span>
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 group active:scale-98"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>AUTHENTICATE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link back to game */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            <span>Return to World Hero Game</span>
          </a>
        </div>
      </div>
    </div>
  );
}
