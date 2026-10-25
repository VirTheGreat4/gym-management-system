"use client";

import React, { useState, useEffect } from "react";
import {
  Dumbbell,
  User,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Clock,
  Megaphone,
  LogOut,
  Search,
  Award,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { getMembers } from "@/app/actions/members";
import { getGymSettings } from "@/app/actions/settings";
import { BackButton } from "@/components/BackButton";
import { Member, GymSchedule, ScheduleDay } from "@/types/database";

const defaultDays: ScheduleDay[] = [
  { day: "Monday", open: "06:00", close: "22:00", is_closed: false },
  { day: "Tuesday", open: "06:00", close: "22:00", is_closed: false },
  { day: "Wednesday", open: "06:00", close: "22:00", is_closed: false },
  { day: "Thursday", open: "06:00", close: "22:00", is_closed: false },
  { day: "Friday", open: "06:00", close: "22:00", is_closed: false },
  { day: "Saturday", open: "08:00", close: "20:00", is_closed: false },
  { day: "Sunday", open: "08:00", close: "18:00", is_closed: true },
];

const fallbackSchedule: GymSchedule = {
  is_open_now: true,
  manual_override: false,
  announcement: "",
  regular_hours: defaultDays,
  special_closed_dates: [],
};

function calculateCountdown(expirationDateStr: string): string {
  if (!expirationDateStr) return "N/A";
  const exp = new Date(expirationDateStr);
  const now = new Date();
  exp.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return `Expired ${absDays} ${absDays === 1 ? "day" : "days"} ago`;
  } else if (diffDays === 0) {
    return "Expires today";
  } else {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} remaining`;
  }
}

export default function MemberPortalPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [gymName, setGymName] = useState("PowerFit Studio");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState("#3B82F6");
  const [schedule, setSchedule] = useState<GymSchedule>(fallbackSchedule);

  // Passwordless session state
  const [inputName, setInputName] = useState("");
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load gym info, schedule & restore session
  useEffect(() => {
    async function initPortal() {
      // 1. Fetch gym settings
      const { data: settings } = await getGymSettings();
      if (settings) {
        if (settings.name) setGymName(settings.name);
        if (settings.logo_url) setLogoUrl(settings.logo_url);
        if (settings.theme_color) setThemeColor(settings.theme_color);
        if (settings.schedule) setSchedule(settings.schedule);
      }

      // 2. Check localStorage for schedule fallback
      try {
        const savedSchedule = localStorage.getItem("gym_schedule_data");
        if (savedSchedule) {
          setSchedule(JSON.parse(savedSchedule));
        }
      } catch (e) {
        console.error("Error loading schedule from localStorage", e);
      }

      // 3. Restore session if stored
      try {
        const sessionName = localStorage.getItem("gym_member_portal_session");
        if (sessionName) {
          setIsSearching(true);
          const { data: membersList } = await getMembers();
          if (membersList && membersList.length > 0) {
            const found = membersList.find(
              (m) => m.name.trim().toLowerCase() === sessionName.trim().toLowerCase()
            );
            if (found) {
              setActiveMember(found);
            }
          }
          setIsSearching(false);
        }
      } catch (e) {
        console.error("Error restoring session", e);
        setIsSearching(false);
      }
    }

    initPortal();
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    if (!inputName.trim()) {
      setLookupError("Please enter your full name.");
      return;
    }

    setIsSearching(true);
    const { data: membersList, error } = await getMembers();
    setIsSearching(false);

    if (error) {
      setLookupError("Unable to fetch membership records right now. Please try again.");
      return;
    }

    if (membersList) {
      const found = membersList.find(
        (m) => m.name.trim().toLowerCase() === inputName.trim().toLowerCase()
      );

      if (found) {
        setActiveMember(found);
        try {
          localStorage.setItem("gym_member_portal_session", found.name);
        } catch (e) {
          console.error("Error saving portal session", e);
        }
      } else {
        setLookupError("No membership found under that name. Please verify with front desk.");
      }
    } else {
      setLookupError("No membership found under that name. Please verify with front desk.");
    }
  };

  const handleLogout = () => {
    setActiveMember(null);
    setInputName("");
    setLookupError(null);
    try {
      localStorage.removeItem("gym_member_portal_session");
    } catch (e) {
      console.error("Error clearing portal session", e);
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-6 sm:space-y-8 font-['Comic_Sans_MS',cursive,sans-serif]" suppressHydrationWarning>
        <BackButton />
        <div className="bg-[#E2E8F0] p-8 rounded-2xl border-4 border-slate-700/80 font-bold text-center">
          Loading Member Portal...
        </div>
      </div>
    );
  }

  // Get member status pill styling
  const getStatusPill = (member: Member) => {
    if (member.is_banned) {
      return (
        <span className="px-3.5 py-1.5 rounded-2xl bg-red-600 text-white font-extrabold text-xs border-2 border-slate-700 uppercase tracking-wider inline-flex items-center gap-1 shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5" /> Banned
        </span>
      );
    }

    const exp = new Date(member.expiration_date);
    const now = new Date();
    exp.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="px-3.5 py-1.5 rounded-2xl bg-rose-200 text-rose-950 font-extrabold text-xs border-2 border-slate-700 uppercase tracking-wider inline-flex items-center gap-1 shadow-xs">
          Expired
        </span>
      );
    } else if (diffDays <= 7) {
      return (
        <span className="px-3.5 py-1.5 rounded-2xl bg-amber-200 text-amber-950 font-extrabold text-xs border-2 border-slate-700 uppercase tracking-wider inline-flex items-center gap-1 shadow-xs">
          Expiring Soon
        </span>
      );
    } else {
      return (
        <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-200 text-emerald-950 font-extrabold text-xs border-2 border-slate-700 uppercase tracking-wider inline-flex items-center gap-1 shadow-xs">
          Active
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto font-['Comic_Sans_MS',cursive,sans-serif]" suppressHydrationWarning>
      <BackButton />

      {/* VIEW A: PASSWORDLESS LOOKUP (When Not Logged In) */}
      {!activeMember ? (
        <div className="bg-[#E2E8F0] p-6 sm:p-10 rounded-2xl border-4 border-slate-700/80 shadow-soft-lg space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border-4 border-slate-700/80 shadow-soft overflow-hidden mx-auto">
              {logoUrl ? (
                <img src={logoUrl} alt={gymName} className="w-full h-full object-cover" />
              ) : (
                <Dumbbell className="w-10 h-10 text-slate-800" />
              )}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-sky-200 text-sky-950 text-xs font-extrabold border-2 border-slate-700">
              <Sparkles className="w-3.5 h-3.5" /> Passwordless Member Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Welcome to {gymName} Member Portal
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-700 max-w-md mx-auto">
              Check your active plan status, expiry countdown, badges, and live operating hours without needing a password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLookup} className="space-y-4 max-w-md mx-auto pt-2">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-2">
                Enter your Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-5 py-4 pl-12 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-base focus:outline-none focus:ring-3 focus:ring-sky-400 font-extrabold min-h-[56px] shadow-xs"
                />
                <User className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {lookupError && (
              <div className="p-4 rounded-2xl bg-rose-200 border-3 border-slate-700 text-rose-950 font-extrabold text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-4 px-6 rounded-2xl text-white font-black text-sm uppercase tracking-wider shadow-soft border-3 border-slate-700/80 transition-transform active:scale-95 disabled:opacity-50 min-h-[56px] flex items-center justify-center gap-2"
              style={{ backgroundColor: themeColor }}
            >
              <Search className="w-5 h-5" />
              {isSearching ? "Searching Records..." : "View My Membership"}
            </button>
          </form>

          {/* Help Note */}
          <p className="text-center text-[11px] font-extrabold text-slate-600 pt-4 border-t-2 border-slate-300">
            Need help? Ask our front desk team to confirm your registered full name.
          </p>
        </div>
      ) : (
        /* VIEW B: MEMBER SELF-SERVICE INTERFACE (When Logged In) */
        <div className="space-y-6">
          {/* Gym Status Header Banner */}
          <div
            className={`p-5 sm:p-6 rounded-2xl border-4 border-slate-700/80 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              schedule.is_open_now ? "bg-emerald-200/90" : "bg-rose-200/90"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{schedule.is_open_now ? "🟢" : "🔴"}</span>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {schedule.is_open_now ? "🟢 Gym is OPEN NOW" : "🔴 Gym is CLOSED NOW"}
                </h2>
                {schedule.announcement && (
                  <p className="text-xs font-extrabold text-slate-900 mt-1 inline-flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-xl border-2 border-slate-700">
                    <Megaphone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{schedule.announcement}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs font-extrabold text-slate-800 bg-white/70 px-4 py-2 rounded-2xl border-2 border-slate-700">
              Welcome back, <span className="text-slate-900 font-black">{activeMember.name}</span>!
            </div>
          </div>

          {/* My Membership Card */}
          <div className="bg-[#E2E8F0] p-6 sm:p-8 rounded-2xl border-4 border-slate-700/80 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-3 border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white border-3 border-slate-700 flex items-center justify-center font-black text-xl text-slate-800 shadow-xs">
                  {activeMember.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {activeMember.name}
                  </h2>
                  <p className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    {activeMember.phone || "No phone provided"}
                  </p>
                </div>
              </div>

              <div>{getStatusPill(activeMember)}</div>
            </div>

            {/* Banned Alert Notice if Banned */}
            {activeMember.is_banned && (
              <div className="p-4 rounded-2xl bg-red-200 border-3 border-slate-700 text-red-950 font-extrabold text-xs space-y-1">
                <div className="flex items-center gap-2 text-sm font-black text-red-900">
                  <ShieldAlert className="w-5 h-5 text-red-700" />
                  <span>Account Banned / Restricted</span>
                </div>
                <p>Reason: {activeMember.ban_reason || "Violation of gym regulations."}</p>
                <p className="text-[11px] text-red-800">Please speak directly with gym management.</p>
              </div>
            )}

            {/* Plan Details & Countdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border-3 border-slate-700 space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-slate-500 block">
                  Membership Plan
                </span>
                <p className="text-base font-black text-slate-900">
                  {activeMember.plan_type || "Standard Access"}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border-3 border-slate-700 space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-slate-500 block">
                  Start Date
                </span>
                <p className="text-sm font-extrabold text-slate-900">
                  {activeMember.join_date || "N/A"}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border-3 border-slate-700 space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-slate-500 block">
                  Expiration Date
                </span>
                <p className="text-sm font-extrabold text-slate-900">
                  {activeMember.expiration_date || "N/A"}
                </p>
              </div>
            </div>

            {/* Countdown Banner */}
            <div
              className="p-4 rounded-2xl border-3 border-slate-700 flex items-center justify-between gap-3 text-white shadow-soft"
              style={{ backgroundColor: themeColor }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 shrink-0" />
                <span className="text-xs font-extrabold uppercase">Plan Countdown</span>
              </div>
              <span className="text-sm sm:text-base font-black bg-slate-900/40 px-3 py-1.5 rounded-xl border border-white/30">
                {calculateCountdown(activeMember.expiration_date)}
              </span>
            </div>

            {/* Assigned Badges */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-4 h-4 text-sky-700" /> Assigned Member Badges
              </span>

              {activeMember.badges && activeMember.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeMember.badges.map((badge, idx) => (
                    <div
                      key={idx}
                      className="px-3.5 py-2 rounded-2xl bg-sky-200 text-sky-950 font-extrabold text-xs border-2 border-slate-700 shadow-xs flex items-center gap-1.5"
                    >
                      <Tag className="w-3.5 h-3.5 text-sky-800" />
                      <span>{badge}</span>
                      <span className="text-[10px] bg-sky-300 text-sky-950 px-1.5 py-0.5 rounded-lg border border-slate-700">
                        Special Perk
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-white/70 rounded-2xl border-2 border-slate-700 text-xs font-bold text-slate-600">
                  No custom badges assigned yet. Contact front desk for promotional discount badges!
                </div>
              )}
            </div>

            {/* Disciplinary Standing */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" /> Disciplinary Standing
              </span>

              {(!activeMember.warning_count || activeMember.warning_count === 0) &&
              !activeMember.violation_notes ? (
                <div className="p-3.5 bg-emerald-100 rounded-2xl border-3 border-slate-700 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <p className="font-extrabold text-xs text-emerald-950">
                      Good Standing (0 warnings)
                    </p>
                    <p className="text-[11px] font-bold text-slate-700">
                      Thank you for adhering to all gym etiquette and policies!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-100 rounded-2xl border-3 border-slate-700 space-y-1">
                  <div className="flex items-center gap-2 font-extrabold text-xs text-amber-950">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>Warning Count: {activeMember.warning_count || 0}</span>
                  </div>
                  {activeMember.violation_notes && (
                    <p className="text-xs font-bold text-slate-800">
                      Notes: {activeMember.violation_notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Gym Schedule & Calendar Card */}
          <div className="bg-[#E2E8F0] p-6 sm:p-8 rounded-2xl border-4 border-slate-700/80 shadow-soft space-y-6">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-sky-700" /> Operating Schedule & Holiday Closures
            </h2>

            {/* Weekly Hours */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {schedule.regular_hours.map((day) => (
                <div
                  key={day.day}
                  className={`p-3 rounded-2xl border-2 border-slate-700 text-center space-y-1 ${
                    day.is_closed ? "bg-slate-300 text-slate-600" : "bg-white text-slate-900"
                  }`}
                >
                  <span className="block text-xs font-black">{day.day.substring(0, 3)}</span>
                  {day.is_closed ? (
                    <span className="block text-[10px] font-extrabold text-rose-700 bg-rose-100 rounded-lg p-0.5 border border-slate-700">
                      Closed
                    </span>
                  ) : (
                    <span className="block text-[10px] font-extrabold">
                      {day.open} - {day.close}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Upcoming Closed Dates */}
            {schedule.special_closed_dates.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> Scheduled Holiday Closures
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {schedule.special_closed_dates.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-rose-100 rounded-2xl border-2 border-slate-700 text-xs"
                    >
                      <span className="block font-black text-rose-950">{item.date}</span>
                      <span className="block font-extrabold text-slate-800">{item.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-soft border-3 border-slate-700 flex items-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" /> Log Out / Switch Member
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
