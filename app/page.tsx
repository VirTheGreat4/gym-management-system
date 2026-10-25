'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Users, Lock, ChevronRight, Sparkles, KeyRound, ShieldAlert } from 'lucide-react';
import { loginAdmin } from '@/app/actions/auth';
import { getGymSettings } from '@/app/actions/settings';

export default function LandingGateway() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [gymName, setGymName] = useState('PowerFit Studio');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    async function loadGymInfo() {
      const { data } = await getGymSettings();
      if (data) {
        if (data.name) setGymName(data.name);
        if (data.logo_url) setLogoUrl(data.logo_url);
      }
    }
    loadGymInfo();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginAdmin(password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="w-full my-auto space-y-6 sm:space-y-8 max-w-lg mx-auto px-2" suppressHydrationWarning>
      {/* Header Branding */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-zinc-900 rounded-3xl border-3 border-zinc-700 text-red-500 flex items-center justify-center mx-auto shadow-soft overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={gymName} className="w-full h-full object-cover" />
          ) : (
            <Dumbbell className="w-10 h-10 text-red-500" />
          )}
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-2xl bg-zinc-800 text-zinc-300 text-xs font-extrabold border border-zinc-700">
          <Sparkles className="w-3.5 h-3.5 text-red-500" /> System Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-100 tracking-tight">
          {gymName}
        </h1>
        <p className="text-sm font-medium text-zinc-400 max-w-xs mx-auto">
          Select your access level below to continue.
        </p>
      </div>

      <div className="space-y-4">
        {/* Member Access Route Card */}
        <button
          type="button"
          onClick={() => router.push('/portal')}
          className="w-full bg-[#121214] hover:bg-zinc-800 p-5 sm:p-6 rounded-2xl border-2 border-zinc-700/80 hover:border-red-500/60 shadow-soft-lg active:scale-[0.99] transition-all flex items-center justify-between group text-left cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-950/80 p-3.5 rounded-2xl border border-red-700 text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-100 group-hover:text-white">
                Member Access
              </h2>
              <p className="text-xs sm:text-sm font-medium text-zinc-400">
                Check gym status, hours & membership
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
        </button>

        {/* Admin Access Route Card / Form */}
        {!showAdminLogin ? (
          <button
            type="button"
            onClick={() => setShowAdminLogin(true)}
            className="w-full bg-[#121214] hover:bg-zinc-800 p-5 sm:p-6 rounded-2xl border-2 border-zinc-700/80 hover:border-amber-500/60 shadow-soft-lg active:scale-[0.99] transition-all flex items-center justify-between group text-left cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="bg-amber-950/80 p-3.5 rounded-2xl border border-amber-700 text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-zinc-100 group-hover:text-white">
                  Staff / Admin Login
                </h2>
                <p className="text-xs sm:text-sm font-medium text-zinc-400">
                  Manage members, SMS, & settings
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </button>
        ) : (
          <form
            onSubmit={handleAdminLogin}
            className="w-full bg-[#121214] p-6 rounded-2xl border-2 border-zinc-700 shadow-soft-lg space-y-4 animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm pb-1 border-b border-zinc-800">
              <KeyRound className="w-4 h-4" />
              <span>Staff Authentication</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                Enter Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Hint: admin123"
                className="w-full bg-zinc-950 px-4 py-3.5 rounded-2xl border-2 border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400 font-extrabold text-base placeholder:text-zinc-600 shadow-xs"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-950/80 border border-red-700 text-red-300 font-extrabold text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>Incorrect admin password. Please try again.</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAdminLogin(false);
                  setPassword('');
                  setError(false);
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-3.5 rounded-2xl border-2 border-zinc-700 font-extrabold text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl border-2 border-red-500/50 font-extrabold text-sm shadow-soft transition cursor-pointer"
              >
                Log In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
