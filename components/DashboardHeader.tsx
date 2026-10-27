"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, UserPlus, Palette, Dumbbell, Sparkles } from "lucide-react";
import { getGymSettings } from "@/app/actions/settings";
import { DEFAULT_GYM_NAME, DEFAULT_LOGO_URL } from "@/lib/config";

interface DashboardHeaderProps {
  initialGymName?: string;
  initialLogoUrl?: string | null;
}

export default function DashboardHeader({
  initialGymName = DEFAULT_GYM_NAME,
  initialLogoUrl = DEFAULT_LOGO_URL,
}: DashboardHeaderProps) {
  const [gymName, setGymName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("gym_settings_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name && parsed.name !== "JLAB Fitness") return parsed.name;
        }
      } catch (e) {}
    }
    return initialGymName || DEFAULT_GYM_NAME;
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
    return initialLogoUrl || DEFAULT_LOGO_URL;
  });

  useEffect(() => {
    function loadLocalSettings() {
      try {
        const saved = localStorage.getItem("gym_settings_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name && parsed.name !== "JLAB Fitness") setGymName(parsed.name);
          else setGymName(DEFAULT_GYM_NAME);

          if (parsed.logo_url) {
            setLogoUrl(parsed.logo_url);
          } else {
            setLogoUrl(DEFAULT_LOGO_URL);
          }
        }
      } catch (e) {
        console.error("Error reading gym_settings_data in DashboardHeader", e);
      }
    }

    // 1. Check local cache first
    loadLocalSettings();

    // 2. Fetch fresh DB settings
    async function loadGym() {
      const { data } = await getGymSettings();
      if (data) {
        const saved = localStorage.getItem("gym_settings_data");
        if (!saved) {
          if (data.name && data.name !== "JLAB Fitness") setGymName(data.name);
          else setGymName(DEFAULT_GYM_NAME);

          if (data.logo_url) {
            setLogoUrl(data.logo_url);
          } else {
            setLogoUrl(DEFAULT_LOGO_URL);
          }
        }
      }
    }
    loadGym();

    // 3. Listen for live customization updates from Settings page
    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        if (e.detail.name && e.detail.name !== "JLAB Fitness") setGymName(e.detail.name);
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
    window.addEventListener("supabase-realtime-update", loadLocalSettings);

    return () => {
      window.removeEventListener("gym-settings-updated", handleSettingsUpdate);
      window.removeEventListener("supabase-realtime-update", loadLocalSettings);
    };
  }, []);

  return (
    <div className="bg-[#121214] p-5 sm:p-7 md:p-8 rounded-2xl shadow-xl border-2 border-zinc-800/90 relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Gym Logo Profile Card + Welcome Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Prominent Logo Profile Frame */}
          <div className="relative shrink-0 group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl bg-zinc-950 border-3 border-zinc-700 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-red-500/80 group-hover:shadow-red-950/40">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={gymName}
                  className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <Dumbbell className="w-12 h-12 text-red-500" />
              )}
            </div>

            {/* Active Indicator Badge */}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-zinc-900"></span>
            </span>
          </div>

          {/* Title & Info */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-zinc-900 text-zinc-300 text-xs font-extrabold border border-zinc-700 shadow-xs">
              <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Dashboard Overview</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-100 tracking-tight">
              Welcome back, Manager!
            </h1>

            <div className="flex items-center gap-2 text-zinc-400 font-semibold text-xs sm:text-sm">
              <span>Official Brand:</span>
              <span className="text-zinc-100 font-extrabold bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-zinc-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                {gymName}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-2 md:pt-0">
          <Link
            href="/settings"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-extrabold text-xs sm:text-sm border-2 border-zinc-700 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Palette className="w-4 h-4 text-red-500" />
            <span>Edit Branding</span>
          </Link>

          <Link
            href="/members"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-soft border-2 border-red-500 transition-all cursor-pointer active:scale-95 min-h-[48px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
