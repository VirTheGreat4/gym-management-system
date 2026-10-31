"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Palette,
  Dumbbell,
  Menu,
  X,
  Sparkles,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { getGymSettings } from "@/app/actions/settings";
import { logoutAdmin } from "@/app/actions/auth";
import { DEFAULT_GYM_NAME, DEFAULT_LOGO_URL } from "@/lib/config";
import { startAppTutorial } from "@/components/AppTutorial";

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
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
        console.error("Error reading gym_settings_data in Sidebar", e);
      }
    }

    // 1. Initial check from localStorage
    loadLocalSettings();

    // 2. Fetch remote DB
    async function loadGym() {
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
    loadGym();

    // 3. Listen for live customization updates
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
  }, [pathname]);

  const handleLogout = async () => {
    await logoutAdmin();
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: null as string | null,
      badgeStyle: null as string | null,
    },
    {
      name: "Members",
      href: "/members",
      icon: Users,
      badge: null as string | null,
      badgeStyle: null as string | null,
    },
    {
      name: "Subscriptions",
      href: "/subscriptions",
      icon: CreditCard,
      badge: null as string | null,
      badgeStyle: null as string | null,
    },
    {
      name: "Customization",
      href: "/settings",
      icon: Palette,
      badge: null as string | null,
      badgeStyle: null as string | null,
    },
  ];

  return (
    <>
      {/* Mobile Top App Bar */}
      <div className="lg:hidden flex items-center justify-between bg-zinc-900/95 border-b-2 border-zinc-700/80 px-3.5 sm:px-4 py-3 shadow-soft sticky top-0 z-40 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold border-2 border-zinc-700 bg-zinc-950 shadow-soft overflow-hidden shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={gymName} className="w-full h-full object-contain p-1" />
            ) : (
              <Dumbbell className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div>
            <h1 className="font-black text-xs sm:text-sm text-zinc-100 leading-none truncate max-w-[170px] sm:max-w-none">{gymName}</h1>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-red-500">
              Front-Desk Portal
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-2 border-zinc-700 transition min-h-[44px] min-w-[44px] flex items-center justify-center font-bold cursor-pointer active:scale-95"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden transform-gpu will-change-transform"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-68 bg-[#101116] border-r-2 border-zinc-800 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl transform-gpu will-change-transform pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-7">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white border-2 border-zinc-700 bg-zinc-950 shadow-md overflow-hidden shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={gymName} className="w-full h-full object-contain p-1" />
              ) : (
                <Dumbbell className="w-7 h-7 text-red-500" />
              )}
            </div>
            <div>
              <h1 className="font-black text-base text-zinc-100 leading-tight truncate max-w-[150px]">{gymName}</h1>
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-red-500">
                <Sparkles className="w-3 h-3 text-red-500" /> Gym Management
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 min-h-[48px] rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 border-2 active:scale-[0.98] ${
                    isActive
                      ? "bg-red-600 text-white border-red-500 shadow-soft"
                      : "text-zinc-300 bg-zinc-950/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? "text-white" : "text-zinc-400"}`}
                    />
                    <span className="leading-snug">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold border ${
                        item.badgeStyle || "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Tenant Info + Tutorial + Logout */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              startAppTutorial();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 transition-all duration-200 cursor-pointer active:scale-95 min-h-[44px]"
          >
            <HelpCircle className="w-4 h-4 text-white" />
            <span>Interactive Tutorial</span>
          </button>

          <div className="p-3 rounded-xl border-2 border-zinc-800 bg-zinc-950 space-y-1 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">
                Gym Active
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-zinc-700 animate-pulse" />
            </div>
            <p className="text-xs font-black text-zinc-100 truncate">{gymName}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-zinc-900 hover:bg-red-950/80 text-red-400 border-2 border-zinc-800 hover:border-red-800/80 font-extrabold text-xs shadow-sm transition-all duration-200 active:scale-95 min-h-[44px] cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Thumb Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101116]/95 backdrop-blur-md border-t-2 border-zinc-800 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-around transform-gpu">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-w-[64px] min-h-[48px] border-2 transition-all active:scale-95 ${
                isActive
                  ? "bg-red-600 text-white border-red-500 shadow-soft"
                  : "bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:bg-zinc-800"
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? "text-white" : "text-zinc-400"}`} />
              <span className="text-[10px] font-black truncate max-w-[60px]">{item.name.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export { Sidebar };
