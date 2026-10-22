"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BellRing,
  Palette,
  Dumbbell,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { getGymSettings } from "@/app/actions/settings";

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [gymName, setGymName] = useState("PowerFit Studio");
  const [themeColor, setThemeColor] = useState("#3B82F6");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadGym() {
      const { data } = await getGymSettings();
      if (data) {
        if (data.name) setGymName(data.name);
        if (data.theme_color) setThemeColor(data.theme_color);
        if (data.logo_url !== undefined) setLogoUrl(data.logo_url);
      }
    }
    loadGym();
  }, [pathname]);

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
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
      name: "Notify",
      href: "/retention",
      icon: BellRing,
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
      <div className="lg:hidden flex items-center justify-between bg-[#E2E8F0] border-b-4 border-slate-700 px-5 py-4 shadow-soft sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold border-3 border-slate-700 shadow-soft overflow-hidden"
            style={{ backgroundColor: themeColor }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt={gymName} className="w-full h-full object-cover" />
            ) : (
              <Dumbbell className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h1 className="font-extrabold text-base text-slate-900 leading-none">{gymName}</h1>
            <span className="text-xs font-extrabold" style={{ color: themeColor }}>
              Front-Desk Portal
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 border-3 border-slate-700 transition min-h-[48px] min-w-[48px] flex items-center justify-center font-bold"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#E2E8F0] border-r-4 border-slate-700 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-soft-lg ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 px-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white border-3 border-slate-700 shadow-soft overflow-hidden"
              style={{ backgroundColor: themeColor }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={gymName} className="w-full h-full object-cover" />
              ) : (
                <Dumbbell className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900 leading-tight">{gymName}</h1>
              <div className="flex items-center gap-1 text-xs font-extrabold" style={{ color: themeColor }}>
                <Sparkles className="w-3 h-3" /> Gym Management
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3.5 min-h-[52px] rounded-2xl font-bold text-sm transition-all duration-200 border-3 ${
                    isActive
                      ? "shadow-soft border-slate-700"
                      : "text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-700/60 hover:border-slate-700"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${themeColor}25`,
                          color: themeColor,
                          borderColor: "#334155",
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className="w-5 h-5 shrink-0"
                      style={{ color: isActive ? themeColor : "#475569" }}
                    />
                    <span className="leading-snug">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs px-2.5 py-1 rounded-2xl font-extrabold border-2 border-slate-700 ${
                        item.badgeStyle || "bg-slate-200 text-slate-700"
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

        {/* Tenant Info Footer */}
        <div
          className="p-4 rounded-2xl border-3 border-slate-700 space-y-2 shadow-soft"
          style={{
            backgroundColor: `${themeColor}20`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-extrabold uppercase tracking-wider"
              style={{ color: themeColor }}
            >
              Gym Active
            </span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-700 animate-pulse" />
          </div>
          <p className="text-sm font-extrabold text-slate-900">{gymName}</p>
          <p className="text-xs text-slate-600 font-bold">Front-Desk Thumb Optimized</p>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Thumb Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#E2E8F0] border-t-4 border-slate-700 px-2 py-2 shadow-soft-lg flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl min-w-[70px] min-h-[56px] border-2 transition-all ${
                isActive
                  ? "bg-slate-900 text-white border-slate-700 shadow-soft"
                  : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" style={{ color: isActive ? themeColor : "#475569" }} />
              <span className="text-[10px] font-extrabold truncate max-w-[65px]">{item.name.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

