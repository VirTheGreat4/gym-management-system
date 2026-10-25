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
} from "lucide-react";
import { getGymSettings } from "@/app/actions/settings";
import { logoutAdmin } from "@/app/actions/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [gymName, setGymName] = useState("PowerFit Studio");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadGym() {
      const { data } = await getGymSettings();
      if (data) {
        if (data.name) setGymName(data.name);
        if (data.logo_url !== undefined) setLogoUrl(data.logo_url);
      }
    }
    loadGym();
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
      <div className="lg:hidden flex items-center justify-between bg-zinc-900 border-b-3 border-zinc-700 px-5 py-4 shadow-soft sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold border-2 border-zinc-700 bg-zinc-950 shadow-soft overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={gymName} className="w-full h-full object-cover" />
            ) : (
              <Dumbbell className="w-6 h-6 text-red-500" />
            )}
          </div>
          <div>
            <h1 className="font-extrabold text-base text-zinc-100 leading-none">{gymName}</h1>
            <span className="text-xs font-extrabold text-red-500">
              Front-Desk Portal
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-2 border-zinc-700 transition min-h-[48px] min-w-[48px] flex items-center justify-center font-bold cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-zinc-900 border-r-3 border-zinc-700 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-soft-lg ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white border-2 border-zinc-700 bg-zinc-950 shadow-soft overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={gymName} className="w-full h-full object-cover" />
              ) : (
                <Dumbbell className="w-7 h-7 text-red-500" />
              )}
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-zinc-100 leading-tight">{gymName}</h1>
              <div className="flex items-center gap-1 text-xs font-extrabold text-red-500">
                <Sparkles className="w-3 h-3 text-red-500" /> Gym Management
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
                  className={`flex items-center justify-between px-4 py-3.5 min-h-[52px] rounded-2xl font-bold text-sm transition-all duration-200 border-2 ${
                    isActive
                      ? "bg-red-600 text-white border-red-500/80 shadow-soft"
                      : "text-zinc-300 bg-zinc-950/80 hover:bg-zinc-800 border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-zinc-400"}`}
                    />
                    <span className="leading-snug">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs px-2.5 py-1 rounded-2xl font-extrabold border ${
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

        {/* Bottom Section: Tenant Info + Logout */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl border-2 border-zinc-700 bg-zinc-950 space-y-2 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-500">
                Gym Active
              </span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-zinc-700 animate-pulse" />
            </div>
            <p className="text-sm font-extrabold text-zinc-100">{gymName}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-red-950 text-red-400 border-2 border-zinc-700 font-extrabold text-sm shadow-soft transition-all duration-200 active:translate-y-0.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Thumb Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t-3 border-zinc-700 px-2 py-2 shadow-soft-lg flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl min-w-[70px] min-h-[56px] border-2 transition-all ${
                isActive
                  ? "bg-red-600 text-white border-red-500 shadow-soft"
                  : "bg-zinc-950 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-white" : "text-zinc-400"}`} />
              <span className="text-[10px] font-extrabold truncate max-w-[65px]">{item.name.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export { Sidebar };
