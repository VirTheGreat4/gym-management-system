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
  HelpCircle,
} from "lucide-react";
import { startAppTutorial } from "@/components/AppTutorial";
import { getMembers } from "@/app/actions/members";
import { getGymSettings } from "@/app/actions/settings";
import { getCustomBadges } from "@/app/actions/badges";
import { BackButton } from "@/components/BackButton";
import { Member, GymSchedule, ScheduleDay, CustomBadge } from "@/types/database";
import { getBadgeColorStyle } from "@/app/subscriptions/page";
import { DEFAULT_GYM_NAME, DEFAULT_LOGO_URL } from "@/lib/config";

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
  const [gymName, setGymName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSettings = localStorage.getItem("gym_settings_data");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.name && parsed.name !== "JLAB Fitness") return parsed.name;
        }
      } catch (e) {}
    }
    return DEFAULT_GYM_NAME;
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSettings = localStorage.getItem("gym_settings_data");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.logo_url) {
            return parsed.logo_url;
          }
        }
      } catch (e) {}
    }
    return DEFAULT_LOGO_URL;
  });
  const [schedule, setSchedule] = useState<GymSchedule>(fallbackSchedule);
  const [customBadges, setCustomBadges] = useState<CustomBadge[]>([]);

  // Passwordless session state
  const [inputName, setInputName] = useState("");
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Member Search Autocomplete state
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFetchingMembers, setIsFetchingMembers] = useState(false);
  const suggestionContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle click outside autocomplete suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionContainerRef.current &&
        !suggestionContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch member directory list for recommendations
  const fetchMembersDirectory = async () => {
    if (allMembers.length > 0 || isFetchingMembers) return;
    setIsFetchingMembers(true);
    try {
      const { data } = await getMembers();
      if (data) {
        setAllMembers(data);
      }
    } catch (err) {
      console.error("Error fetching members directory", err);
    } finally {
      setIsFetchingMembers(false);
    }
  };

  // Filtered members for recommendations dropdown
  const filteredSuggestions = React.useMemo(() => {
    const query = inputName.trim().toLowerCase();
    if (!query) return allMembers.slice(0, 6);
    return allMembers
      .filter((m) => m.name.toLowerCase().includes(query))
      .slice(0, 6);
  }, [allMembers, inputName]);

  const handleSelectSuggestion = (name: string) => {
    setInputName(name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(filteredSuggestions[selectedIndex].name);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Load gym info, schedule, badges & restore session
  useEffect(() => {
    function loadLocalSettings() {
      try {
        const savedSettings = localStorage.getItem("gym_settings_data");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.name && parsed.name !== "JLAB Fitness") setGymName(parsed.name);
          else setGymName(DEFAULT_GYM_NAME);

          if (parsed.logo_url) {
            setLogoUrl(parsed.logo_url);
          } else {
            setLogoUrl(DEFAULT_LOGO_URL);
          }
          if (parsed.schedule?.regular_hours?.length > 0) setSchedule(parsed.schedule);
        } else {
          const savedSchedule = localStorage.getItem("gym_schedule_data");
          if (savedSchedule) {
            const parsed = JSON.parse(savedSchedule);
            if (parsed?.regular_hours?.length > 0) setSchedule(parsed);
          }
        }
      } catch (e) {
        console.error("Error loading settings from localStorage in Portal", e);
      }
    }

    loadLocalSettings();

    async function initPortal() {
      // 1. Fetch gym settings & badges
      const [settingsRes, badgesRes] = await Promise.all([
        getGymSettings(),
        getCustomBadges(),
      ]);

      if (settingsRes.data) {
        const savedSettings = localStorage.getItem("gym_settings_data");
        if (!savedSettings) {
          if (settingsRes.data.name && settingsRes.data.name !== "JLAB Fitness") setGymName(settingsRes.data.name);
          else setGymName(DEFAULT_GYM_NAME);

          if (settingsRes.data.logo_url) {
            setLogoUrl(settingsRes.data.logo_url);
          } else {
            setLogoUrl(DEFAULT_LOGO_URL);
          }
          if (settingsRes.data.schedule) setSchedule(settingsRes.data.schedule);
        }
      }
      if (badgesRes.data) {
        setCustomBadges(badgesRes.data);
      }

      // 2. Restore session if stored
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

    const handleRealtime = async () => {
      const badgesRes = await getCustomBadges();
      if (badgesRes.data) setCustomBadges(badgesRes.data);

      if (activeMember) {
        const membersRes = await getMembers();
        if (membersRes.data) {
          const updated = membersRes.data.find(
            (m) => m.name.trim().toLowerCase() === activeMember.name.trim().toLowerCase()
          );
          if (updated) setActiveMember(updated);
        }
      }
    };

    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        if (e.detail.name && e.detail.name !== "JLAB Fitness") setGymName(e.detail.name);
        else if (e.detail.name) setGymName(DEFAULT_GYM_NAME);

        if (e.detail.logo_url) {
          setLogoUrl(e.detail.logo_url);
        } else if (e.detail.logo_url !== undefined) {
          setLogoUrl(DEFAULT_LOGO_URL);
        }
        if (e.detail.schedule) setSchedule(e.detail.schedule);
      } else {
        loadLocalSettings();
      }
    };

    window.addEventListener("supabase-realtime-update", handleRealtime);
    window.addEventListener("gym-settings-updated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("supabase-realtime-update", handleRealtime);
      window.removeEventListener("gym-settings-updated", handleSettingsUpdate);
    };
  }, [activeMember?.name]);

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
      <div className="space-y-6 sm:space-y-8" suppressHydrationWarning>
        <BackButton />
        <div className="bg-zinc-900 p-8 rounded-2xl border-3 border-zinc-700 text-zinc-300 font-bold text-center">
          Loading Member Portal...
        </div>
      </div>
    );
  }

  // Get member status pill styling
  const getStatusPill = (member: Member) => {
    if (member.is_banned) {
      return (
        <span className="px-3.5 py-1.5 rounded-2xl bg-red-600 text-white font-extrabold text-xs border border-red-500 uppercase tracking-wider inline-flex items-center gap-1 shadow-xs animate-pulse">
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
        <span className="px-3.5 py-1.5 rounded-2xl bg-rose-950/80 text-rose-300 font-extrabold text-xs border border-rose-700 uppercase tracking-wider inline-flex items-center gap-1 shadow-xs">
          Expired
        </span>
      );
    } else if (diffDays <= 7) {
      return (
        <span className="px-3.5 py-1.5 rounded-2xl bg-amber-950/80 text-amber-300 font-extrabold text-xs border border-amber-700 uppercase tracking-wider inline-flex items-center gap-1 shadow-xs">
          Expiring Soon
        </span>
      );
    } else {
      return (
        <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-950/80 text-emerald-300 font-extrabold text-xs border border-emerald-700 uppercase tracking-wider inline-flex items-center gap-1 shadow-xs">
          Active
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto" suppressHydrationWarning>
      <div className="flex items-center justify-between gap-4">
        <BackButton />
        {activeMember && (
          <button
            type="button"
            onClick={() => startAppTutorial('portal-card')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-white" />
            <span>Interactive Tutorial</span>
          </button>
        )}
      </div>

      {/* VIEW A: PASSWORDLESS LOOKUP (When Not Logged In) */}
      {!activeMember ? (
        <div className="bg-[#121318] p-6 sm:p-9 rounded-xl border-2 border-zinc-700/80 shadow-2xl space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-zinc-950 border-2 border-zinc-700 shadow-md overflow-hidden mx-auto">
              {logoUrl ? (
                <img src={logoUrl} alt={gymName} className="w-full h-full object-contain p-1" />
              ) : (
                <Dumbbell className="w-8 h-8 text-red-500" />
              )}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs font-extrabold border border-zinc-700">
              <Sparkles className="w-3.5 h-3.5 text-red-500" /> Passwordless Member Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-100">
              Welcome to {gymName} Member Portal
            </h1>
            <p className="text-xs sm:text-sm font-medium text-zinc-400 max-w-md mx-auto">
              Check your active plan status, expiry countdown, database badges, and live operating hours without needing a password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLookup} className="space-y-4 max-w-md mx-auto pt-2">
            <div className="relative" ref={suggestionContainerRef}>
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-wide mb-2">
                Enter your Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={inputName}
                  onFocus={() => {
                    fetchMembersDirectory();
                    setShowSuggestions(true);
                  }}
                  onChange={(e) => {
                    setInputName(e.target.value);
                    setShowSuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="e.g. John Doe"
                  className="w-full px-5 py-3.5 pl-12 rounded-lg bg-zinc-950 border-2 border-zinc-700 text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-red-500 font-extrabold min-h-[52px] shadow-xs"
                />
                <User className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>

              {/* Autocomplete Dropdown Menu */}
              {showSuggestions && (
                <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-zinc-900 border-2 border-zinc-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-zinc-800">
                  {isFetchingMembers && allMembers.length === 0 ? (
                    <div className="p-3 text-xs text-zinc-400 text-center font-medium">
                      Loading member directory...
                    </div>
                  ) : filteredSuggestions.length > 0 ? (
                    <div>
                      <div className="px-3 py-1.5 bg-zinc-950/90 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 flex items-center justify-between">
                        <span>Select Your Registered Name</span>
                        <span>{filteredSuggestions.length} recommendation{filteredSuggestions.length > 1 ? "s" : ""}</span>
                      </div>
                      {filteredSuggestions.map((member, idx) => {
                        const isSelected = idx === selectedIndex;
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleSelectSuggestion(member.name)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-red-600/20 text-white font-black"
                                : "hover:bg-zinc-800/80 text-zinc-200 font-bold"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <User className={`w-4 h-4 ${isSelected ? "text-red-400" : "text-zinc-500"}`} />
                              <span className="text-sm">{member.name}</span>
                            </div>
                            {member.plan_type && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">
                                {member.plan_type}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 text-xs text-zinc-400 text-center font-medium">
                      No registered members matching "{inputName}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {lookupError && (
              <div className="p-3.5 rounded-lg bg-red-950/80 border-2 border-red-700 text-red-300 font-extrabold text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{lookupError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-3.5 px-6 rounded-lg text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-soft border-2 border-red-500/60 transition-transform active:scale-[0.98] disabled:opacity-50 min-h-[52px] flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              {isSearching ? "Searching Records..." : "View My Membership"}
            </button>
          </form>

          {/* Help Note */}
          <p className="text-center text-[11px] font-extrabold text-zinc-500 pt-4 border-t border-zinc-800">
            Need help? Ask our front desk team to confirm your registered full name.
          </p>
        </div>
      ) : (
        /* VIEW B: MEMBER SELF-SERVICE INTERFACE (When Logged In) */
        <div className="space-y-6">
          {/* Gym Status Header Banner */}
          <div
            className={`p-5 sm:p-6 rounded-xl border-2 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              schedule.is_open_now
                ? "bg-emerald-950/90 text-emerald-100 border-emerald-700/80"
                : "bg-rose-950/90 text-rose-100 border-rose-700/80"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`p-3 rounded-lg border flex items-center justify-center shrink-0 ${
                  schedule.is_open_now
                    ? "bg-emerald-900/80 border-emerald-600 text-emerald-300"
                    : "bg-rose-900/80 border-rose-600 text-rose-300"
                }`}
              >
                {schedule.is_open_now ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-400" />
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-zinc-100 leading-tight flex items-center gap-2">
                  <span>Gym is {schedule.is_open_now ? "OPEN NOW" : "CLOSED NOW"}</span>
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      schedule.is_open_now ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                    }`}
                  />
                </h2>
                {schedule.announcement && (
                  <p className="text-xs font-extrabold text-zinc-200 mt-1 inline-flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1 rounded-lg border border-zinc-700">
                    <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{schedule.announcement}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs font-extrabold text-zinc-300 bg-zinc-900/80 px-4 py-2 rounded-lg border border-zinc-700">
              Welcome back, <span className="text-zinc-100 font-black">{activeMember.name}</span>!
            </div>
          </div>

          {/* My Membership Card */}
          <div id="tutorial-portal-card" className="bg-[#121318] p-5 sm:p-7 rounded-xl border-2 border-zinc-700/80 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-zinc-950 border-2 border-zinc-700 flex items-center justify-center font-black text-xl text-zinc-200 shadow-xs">
                  {activeMember.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-100">
                    {activeMember.name}
                  </h2>
                  <p className="text-xs font-extrabold text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    {activeMember.phone || "No phone provided"}
                  </p>
                </div>
              </div>

              <div>{getStatusPill(activeMember)}</div>
            </div>

            {/* Banned Alert Notice if Banned */}
            {activeMember.is_banned && (
              <div className="p-4 rounded-lg bg-red-950/80 border-2 border-red-700 text-red-200 font-extrabold text-xs space-y-1">
                <div className="flex items-center gap-2 text-sm font-black text-red-300">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <span>Account Banned / Restricted</span>
                </div>
                <p>Reason: {activeMember.ban_reason || "Violation of gym regulations."}</p>
                <p className="text-[11px] text-red-400">Please speak directly with gym management.</p>
              </div>
            )}

            {/* Plan Details & Countdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="bg-zinc-950 p-4 rounded-lg border-2 border-zinc-800 space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-zinc-500 block">
                  Membership Plan
                </span>
                <p className="text-base font-black text-zinc-100">
                  {activeMember.plan_type || "Standard Access"}
                </p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-lg border-2 border-zinc-800 space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-zinc-500 block">
                  Start Date
                </span>
                <p className="text-sm font-extrabold text-zinc-300">
                  {activeMember.join_date || "N/A"}
                </p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-lg border-2 border-zinc-800 space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-zinc-500 block">
                  Expiration Date
                </span>
                <p className="text-sm font-extrabold text-zinc-300">
                  {activeMember.expiration_date || "N/A"}
                </p>
              </div>
            </div>

            {/* Countdown Banner */}
            <div className="p-4 rounded-lg border-2 border-red-500/60 flex items-center justify-between gap-3 text-white shadow-soft bg-red-600">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 shrink-0" />
                <span className="text-xs font-extrabold uppercase">Plan Countdown</span>
              </div>
              <span className="text-sm sm:text-base font-black bg-black/40 px-3 py-1.5 rounded-lg border border-white/30">
                {calculateCountdown(activeMember.expiration_date)}
              </span>
            </div>

            {/* Assigned Badges */}
            <div id="tutorial-portal-badges" className="space-y-3 pt-2 p-2 rounded-xl transition">
              <span className="text-xs font-extrabold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-4 h-4 text-red-500" /> Assigned Member Badges
              </span>

              {activeMember.badges && activeMember.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeMember.badges.map((badgeName, idx) => {
                    const foundBadge = customBadges.find((b) => b.name === badgeName || b.id === badgeName);
                    const colorStyle = foundBadge ? getBadgeColorStyle(foundBadge.color) : "bg-zinc-800 text-zinc-300 border-zinc-700";
                    return (
                      <div
                        key={idx}
                        className={`px-3 py-1.5 rounded-lg font-extrabold text-xs border shadow-2xs flex items-center gap-1.5 ${colorStyle}`}
                      >
                        <Tag className="w-3.5 h-3.5 text-red-500" />
                        <span>{foundBadge ? foundBadge.name : badgeName}</span>
                        {foundBadge?.discount_percent ? (
                          <span className="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded-md border border-red-700">
                            {foundBadge.discount_percent}% OFF
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-zinc-950 rounded-lg border-2 border-zinc-800 text-xs font-semibold text-zinc-400">
                  No custom badges assigned yet. Contact front desk for promotional discount badges!
                </div>
              )}
            </div>

            {/* Disciplinary Standing */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-extrabold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Disciplinary Standing
              </span>

              {(!activeMember.warning_count || activeMember.warning_count === 0) &&
              !activeMember.violation_notes ? (
                <div className="p-3.5 bg-emerald-950/80 rounded-lg border-2 border-emerald-700/80 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-extrabold text-xs text-emerald-200">
                      Good Standing (0 warnings)
                    </p>
                    <p className="text-[11px] font-semibold text-zinc-400">
                      Thank you for adhering to all gym etiquette and policies!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-950/80 rounded-lg border-2 border-amber-700/80 space-y-1">
                  <div className="flex items-center gap-2 font-extrabold text-xs text-amber-200">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Warning Count: {activeMember.warning_count || 0}</span>
                  </div>
                  {activeMember.violation_notes && (
                    <p className="text-xs font-semibold text-zinc-300">
                      Notes: {activeMember.violation_notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Gym Schedule & Calendar Card */}
          <div id="tutorial-portal-schedule" className="bg-[#121318] p-5 sm:p-7 rounded-xl border-2 border-zinc-700/80 shadow-soft space-y-6">
            <h2 className="text-lg sm:text-xl font-black text-zinc-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" /> Operating Schedule & Holiday Closures
            </h2>

            {/* Weekly Hours */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {schedule.regular_hours.map((day) => (
                <div
                  key={day.day}
                  className={`p-3 rounded-lg border-2 text-center space-y-1 ${
                    day.is_closed ? "bg-zinc-950 text-zinc-500 border-zinc-800" : "bg-zinc-950 text-zinc-200 border-zinc-700"
                  }`}
                >
                  <span className="block text-xs font-black">{day.day.substring(0, 3)}</span>
                  {day.is_closed ? (
                    <span className="block text-[10px] font-extrabold text-red-400 bg-red-950/80 rounded-md p-0.5 border border-red-700">
                      Closed
                    </span>
                  ) : (
                    <span className="block text-[10px] font-extrabold text-emerald-400">
                      {day.open} - {day.close}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Upcoming Closed Dates */}
            {schedule.special_closed_dates.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-extrabold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-500" /> Scheduled Holiday Closures
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {schedule.special_closed_dates.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-red-950/80 rounded-lg border-2 border-red-700 text-xs"
                    >
                      <span className="block font-black text-red-200">{item.date}</span>
                      <span className="block font-semibold text-zinc-300">{item.reason}</span>
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
              className="px-5 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-xs shadow-soft border-2 border-zinc-700 flex items-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" /> Log Out / Switch Member
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
