'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Users, Lock, ChevronRight } from 'lucide-react';
import { loginAdmin } from '@/app/actions/auth';

export default function LandingGateway() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginAdmin(password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="w-full my-auto space-y-4 sm:space-y-6" suppressHydrationWarning>
      <div className="text-center space-y-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500 rounded-3xl border-4 border-slate-700/80 text-white flex items-center justify-center mx-auto shadow-soft">
          <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Gym System Portal</h1>
        <p className="text-slate-700 font-bold">Select your access level below to continue.</p>
      </div>

      <div className="space-y-4">
        {/* Member Access Route */}
        <button
          onClick={() => router.push('/portal')}
          className="w-full bg-[#E2E8F0] p-6 rounded-3xl border-4 border-slate-700/80 shadow-soft hover:bg-[#F1F5F9] active:translate-y-1 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="bg-sky-200 p-3 rounded-2xl border-2 border-slate-700/80">
              <Users className="w-6 h-6 text-sky-800" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Member Access</h2>
              <p className="text-sm text-slate-600 font-bold">Check gym status and your membership</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-slate-700" />
        </button>

        {/* Admin Access Route */}
        {!showAdminLogin ? (
          <button
            onClick={() => setShowAdminLogin(true)}
            className="w-full bg-[#E2E8F0] p-6 rounded-3xl border-4 border-slate-700/80 shadow-soft hover:bg-[#F1F5F9] active:translate-y-1 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="bg-amber-200 p-3 rounded-2xl border-2 border-slate-700/80">
                <Lock className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Staff / Admin Login</h2>
                <p className="text-sm text-slate-600 font-bold">Manage members, SMS, and settings</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-slate-700" />
          </button>
        ) : (
          <form onSubmit={handleAdminLogin} className="w-full bg-[#E2E8F0] p-6 rounded-3xl border-4 border-slate-700/80 shadow-soft space-y-4 animate-in fade-in zoom-in duration-200">
            <label className="block text-sm font-extrabold text-slate-700">Enter Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Hint: admin123"
              className="w-full bg-white px-4 py-3 rounded-2xl border-4 border-slate-700/80 focus:outline-none focus:ring-4 focus:ring-amber-400/50 font-bold text-lg"
              autoFocus
            />
            {error && <p className="text-red-500 font-bold text-sm">Incorrect password. Please try again.</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAdminLogin(false)}
                className="flex-1 bg-slate-300 py-3 rounded-2xl border-4 border-slate-700/80 font-bold hover:bg-slate-400 active:translate-y-0.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-amber-400 py-3 rounded-2xl border-4 border-slate-700/80 font-extrabold hover:bg-amber-500 active:translate-y-0.5 shadow-sm"
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
