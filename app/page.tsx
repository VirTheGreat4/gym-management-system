'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Users, Lock, ChevronRight, Sparkles, KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react';
import { loginAdmin } from '@/app/actions/auth';
import { getGymSettings } from '@/app/actions/settings';
import GeometricBackground from '@/components/GeometricBackground';
import { DEFAULT_GYM_NAME, DEFAULT_LOGO_URL } from '@/lib/config';

export default function LandingGateway() {
  const router = useRouter();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [gymName, setGymName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("gym_settings_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name && parsed.name !== "JLAB Fitness" && parsed.name !== "JLAB Fitness Gym") return parsed.name;
        }
      } catch (e) {}
    }
    return DEFAULT_GYM_NAME;
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("gym_settings_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.logo_url) {
            return parsed.logo_url;
          }
        }
      } catch (e) {}
    }
    return DEFAULT_LOGO_URL;
  });

  useEffect(() => {
    setIsMounted(true);

    function loadLocalSettings() {
      try {
        const saved = localStorage.getItem("gym_settings_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name && parsed.name !== "JLAB Fitness" && parsed.name !== "JLAB Fitness Gym") setGymName(parsed.name);
          else setGymName(DEFAULT_GYM_NAME);

          if (parsed.logo_url) {
            setLogoUrl(parsed.logo_url);
          } else {
            setLogoUrl(DEFAULT_LOGO_URL);
          }
        }
      } catch (e) {
        console.error("Error reading gym_settings_data in LandingGateway", e);
      }
    }

    loadLocalSettings();

    async function loadGymInfo() {
      const { data } = await getGymSettings();
      if (data) {
        const saved = localStorage.getItem("gym_settings_data");
        if (!saved) {
          if (data.name && data.name !== "JLAB Fitness" && data.name !== "JLAB Fitness Gym") setGymName(data.name);
          else setGymName(DEFAULT_GYM_NAME);

          if (data.logo_url) {
            setLogoUrl(data.logo_url);
          } else {
            setLogoUrl(DEFAULT_LOGO_URL);
          }
        }
      }
    }
    loadGymInfo();

    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        if (e.detail.name && e.detail.name !== "JLAB Fitness" && e.detail.name !== "JLAB Fitness Gym") setGymName(e.detail.name);
        else if (e.detail.name) setGymName(DEFAULT_GYM_NAME);

        if (e.detail.logo_url) {
          setLogoUrl(e.detail.logo_url);
        } else if (e.detail.logo_url !== undefined) {
          setLogoUrl(DEFAULT_LOGO_URL);
        }
      } else {
        loadLocalSettings();
      }
    };

    window.addEventListener("gym-settings-updated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("gym-settings-updated", handleSettingsUpdate);
    };
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
    <div className="relative w-full min-h-screen flex items-center justify-center py-6 px-3 sm:px-6 overflow-hidden select-none" suppressHydrationWarning>
      {/* Minimalist Geometric Background Layer */}
      <GeometricBackground />

      {/* Main Card - Soft Off-White Aesthetic Container */}
      <div className="relative w-full max-w-sm sm:max-w-md mx-auto z-10 !bg-[#f0f2f5] rounded-xl !border-2 !border-slate-300/90 shadow-2xl shadow-slate-950/30 p-5 sm:p-7 space-y-5">
        {/* Card Header Branding */}
        <div className="text-center space-y-3 p-2 rounded-xl transition">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-slate-900 rounded-2xl border-2 border-slate-800 text-red-500 flex items-center justify-center mx-auto shadow-xl overflow-hidden shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={gymName} className="w-full h-full object-contain p-1.5" />
            ) : (
              <Dumbbell className="w-12 h-12 text-red-500" />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-slate-800 text-xs font-bold border border-slate-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>System Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {gymName}
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-xs mx-auto">
            Select your access level below to continue.
          </p>
        </div>

        {/* Action Buttons with High-Contrast Clear Outlines */}
        <div className="space-y-3">
          {/* Member Access Button */}
          <button
            type="button"
            onClick={() => router.push('/portal')}
            className="w-full !bg-white hover:!bg-slate-50 p-3.5 sm:p-4 rounded-lg !border-2 !border-slate-300 hover:!border-red-600 shadow-sm active:scale-[0.99] transition-all flex items-center justify-between group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-50 p-2.5 sm:p-3 rounded-lg border border-red-200 text-red-600 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-colors shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold !text-slate-900 group-hover:!text-red-600 transition-colors">
                  Member Access
                </h2>
                <p className="text-xs font-semibold !text-slate-600">
                  Check gym status, hours & membership
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 !text-slate-400 group-hover:!text-red-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>

          {/* Admin / Staff Access Button or Form */}
          {!showAdminLogin ? (
            <button
              type="button"
              onClick={() => setShowAdminLogin(true)}
              className="w-full !bg-white hover:!bg-slate-50 p-3.5 sm:p-4 rounded-lg !border-2 !border-slate-300 hover:!border-amber-600 shadow-sm active:scale-[0.99] transition-all flex items-center justify-between group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 p-2.5 sm:p-3 rounded-lg border border-amber-200 text-amber-600 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500 transition-colors shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold !text-slate-900 group-hover:!text-amber-600 transition-colors">
                    Staff / Admin Login
                  </h2>
                  <p className="text-xs font-semibold !text-slate-600">
                    Manage members, access, & settings
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 !text-slate-400 group-hover:!text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          ) : (
            <form
              onSubmit={handleAdminLogin}
              className="w-full !bg-white p-4 sm:p-5 rounded-lg !border-2 !border-slate-300 shadow-md space-y-3.5 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between text-slate-900 font-extrabold text-xs pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2 text-amber-600">
                  <KeyRound className="w-4 h-4" />
                  <span>Staff Authentication</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>SECURE</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Enter Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Hint: admin123"
                  className="w-full !bg-slate-50 px-3.5 py-2.5 !rounded-lg !border-2 !border-slate-300 !text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:!border-amber-600 font-extrabold text-sm placeholder:!text-slate-400 shadow-xs"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border-2 border-red-200 text-red-700 font-bold text-xs flex items-center gap-2">
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
                  className="flex-1 !bg-slate-200 hover:!bg-slate-300 !text-slate-800 py-2.5 !rounded-lg !border-0 font-extrabold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white py-2.5 !rounded-lg !border-0 font-extrabold text-xs shadow-sm transition cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Card Footer Detail */}
        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Portal Active</span>
          </div>
          <span>v2.4</span>
        </div>
      </div>
    </div>
  );
}


