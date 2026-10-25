'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Users, Lock, ChevronRight, Sparkles, KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react';
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
    <div className="relative w-full min-h-[calc(100vh-2rem)] flex items-center justify-center py-8 px-4 overflow-hidden select-none" suppressHydrationWarning>
      {/* Geometric Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Radial Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[120px] rounded-full" />
        
        {/* Minimalist Grid Pattern SVG */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.15] text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.75" />
              <circle cx="40" cy="0" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>

        {/* Minimalist Geometry Background Vectors */}
        {/* Top Left Geometry Wireframe */}
        <svg className="absolute top-8 left-8 w-48 h-48 opacity-20 text-slate-300 hidden md:block" viewBox="0 0 200 200" fill="none">
          <rect x="20" y="20" width="160" height="160" stroke="currentColor" strokeWidth="1" transform="rotate(15 100 100)" />
          <rect x="40" y="40" width="120" height="120" stroke="currentColor" strokeWidth="0.75" transform="rotate(30 100 100)" />
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="0.5" />
        </svg>

        {/* Bottom Right Geometry Wireframe */}
        <svg className="absolute bottom-8 right-8 w-56 h-56 opacity-20 text-slate-300 hidden md:block" viewBox="0 0 200 200" fill="none">
          <polygon points="100,10 190,190 10,190" stroke="currentColor" strokeWidth="1" />
          <polygon points="100,50 160,170 40,170" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="100" cy="130" r="30" stroke="currentColor" strokeWidth="0.5" />
          <path d="M100 10 L100 190 M10 190 L190 10" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
        </svg>

        {/* Background Crosshairs Grid */}
        <div className="absolute inset-0 flex justify-between p-12 opacity-30 text-xs font-mono text-slate-500 pointer-events-none hidden lg:flex">
          <div>+ 01.GATEWAY</div>
          <div>SYS_NODE_04 +</div>
        </div>
      </div>

      {/* Main Aesthetic White Card */}
      <div className="relative w-full max-w-md mx-auto z-10 bg-white rounded-lg border border-slate-200/90 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-900/5 p-6 sm:p-8 space-y-6">
        {/* Card Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-slate-900 rounded-lg border border-slate-800 text-red-500 flex items-center justify-center mx-auto shadow-md overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={gymName} className="w-full h-full object-cover" />
            ) : (
              <Dumbbell className="w-8 h-8 text-red-500" />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>System Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {gymName}
          </h1>

          <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-xs mx-auto">
            Select your access level below to continue.
          </p>
        </div>

        {/* Action Routes inside White Card */}
        <div className="space-y-3.5">
          {/* Member Access Button */}
          <button
            type="button"
            onClick={() => router.push('/portal')}
            className="w-full !bg-slate-50 hover:!bg-slate-100/90 p-4 rounded-lg !border !border-slate-200 hover:!border-red-500/80 shadow-xs active:scale-[0.99] transition-all flex items-center justify-between group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-red-600 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold !text-slate-900 group-hover:!text-red-600 transition-colors">
                  Member Access
                </h2>
                <p className="text-xs font-medium !text-slate-500">
                  Check gym status, hours & membership
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 !text-slate-400 group-hover:!text-red-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* Admin / Staff Access Button or Form */}
          {!showAdminLogin ? (
            <button
              type="button"
              onClick={() => setShowAdminLogin(true)}
              className="w-full !bg-slate-50 hover:!bg-slate-100/90 p-4 rounded-lg !border !border-slate-200 hover:!border-amber-500/80 shadow-xs active:scale-[0.99] transition-all flex items-center justify-between group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-600 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold !text-slate-900 group-hover:!text-amber-600 transition-colors">
                    Staff / Admin Login
                  </h2>
                  <p className="text-xs font-medium !text-slate-500">
                    Manage members, SMS, & settings
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 !text-slate-400 group-hover:!text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ) : (
            <form
              onSubmit={handleAdminLogin}
              className="w-full !bg-slate-50 p-4.5 rounded-lg !border !border-slate-200 shadow-xs space-y-3.5 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between text-slate-800 font-extrabold text-xs pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2 text-amber-600">
                  <KeyRound className="w-4 h-4" />
                  <span>Staff Authentication</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                  <ShieldCheck className="w-3 h-3 text-slate-400" />
                  <span>SECURE</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  Enter Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Hint: admin123"
                  className="w-full !bg-white px-3.5 py-2.5 !rounded-lg !border !border-slate-300 !text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:!border-amber-500 font-extrabold text-sm placeholder:!text-slate-400 shadow-xs"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Incorrect admin password. Please try again.</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setPassword('');
                    setError(false);
                  }}
                  className="flex-1 !bg-slate-200 hover:!bg-slate-300 !text-slate-700 py-2.5 !rounded-lg !border-0 font-extrabold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white py-2.5 !rounded-lg !border-0 font-extrabold text-xs shadow-xs transition cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Card Footer Minimal Detail */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Portal Active</span>
          </div>
          <span>v2.4</span>
        </div>
      </div>
    </div>
  );
}

