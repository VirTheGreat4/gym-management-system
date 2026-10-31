"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Upload,
  CheckCircle2,
  Dumbbell,
  Sparkles,
  Save,
  Image as ImageIcon,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Megaphone,
  Radio,
  X,
} from "lucide-react";
import { getGymSettings, updateGymSettings } from "@/app/actions/settings";
import { BackButton } from "@/components/BackButton";
import { GymSchedule, ScheduleDay, SpecialClosedDate } from "@/types/database";
import { DEFAULT_GYM_NAME, DEFAULT_LOGO_URL, DEFAULT_THEME_COLOR } from "@/lib/config";
import { isSpecialClosedDateExpired } from "@/lib/dateUtils";

const defaultDays: ScheduleDay[] = [
  { day: "Monday", open: "06:00", close: "22:00", is_closed: false },
  { day: "Tuesday", open: "06:00", close: "22:00", is_closed: false },
  { day: "Wednesday", open: "06:00", close: "22:00", is_closed: false },
  { day: "Thursday", open: "06:00", close: "22:00", is_closed: false },
  { day: "Friday", open: "06:00", close: "22:00", is_closed: false },
  { day: "Saturday", open: "08:00", close: "20:00", is_closed: false },
  { day: "Sunday", open: "08:00", close: "18:00", is_closed: true },
];

const initialSchedule: GymSchedule = {
  is_open_now: true,
  manual_override: false,
  announcement: "",
  regular_hours: defaultDays,
  special_closed_dates: [],
};

function sanitizeSchedule(rawSchedule: any): GymSchedule {
  if (!rawSchedule || typeof rawSchedule !== "object") return initialSchedule;
  return {
    is_open_now: typeof rawSchedule.is_open_now === "boolean" ? rawSchedule.is_open_now : true,
    manual_override: Boolean(rawSchedule.manual_override),
    announcement: typeof rawSchedule.announcement === "string" ? rawSchedule.announcement : "",
    regular_hours: Array.isArray(rawSchedule.regular_hours) && rawSchedule.regular_hours.length > 0
      ? rawSchedule.regular_hours.map((item: any, i: number) => ({
          day: item?.day || defaultDays[i]?.day || `Day ${i + 1}`,
          open: item?.open || defaultDays[i]?.open || "06:00",
          close: item?.close || defaultDays[i]?.close || "22:00",
          is_closed: Boolean(item?.is_closed),
        }))
      : defaultDays,
    special_closed_dates: Array.isArray(rawSchedule.special_closed_dates)
      ? rawSchedule.special_closed_dates.filter(
          (item: any) =>
            item &&
            typeof item === "object" &&
            item.id &&
            item.date &&
            !isSpecialClosedDateExpired(item.date)
        )
      : [],
  };
}

export default function SettingsPage() {
  const [gymName, setGymName] = useState(DEFAULT_GYM_NAME);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_THEME_COLOR);
  const [logoPreview, setLogoPreview] = useState<string | null>(DEFAULT_LOGO_URL);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gym Schedule & Live Status state
  const [schedule, setSchedule] = useState<GymSchedule>(initialSchedule);
  const [showAddClosedModal, setShowAddClosedModal] = useState(false);
  const [newClosedDate, setNewClosedDate] = useState("");
  const [newClosedReason, setNewClosedReason] = useState("");

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);

      // 1. Load from client localStorage cache first (instant display, no flicker)
      try {
        const savedSettings = localStorage.getItem("gym_settings_data");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.name) setGymName(parsed.name);
          if (parsed.theme_color) setSelectedColor(parsed.theme_color);
          if (parsed.logo_url !== undefined) setLogoPreview(parsed.logo_url);
          if (parsed.schedule) {
            setSchedule(sanitizeSchedule(parsed.schedule));
          }
        } else {
          const savedSchedule = localStorage.getItem("gym_schedule_data");
          if (savedSchedule) {
            const parsed = JSON.parse(savedSchedule);
            setSchedule(sanitizeSchedule(parsed));
          }
        }
      } catch (e) {
        console.error("Error reading gym_settings_data from localStorage", e);
      }

      // 2. Fetch remote DB settings (server-filtered)
      const { data, error } = await getGymSettings();
      if (error) {
        console.warn("Supabase loadSettings warning:", error);
      } else if (data) {
        if (data.name) setGymName(data.name);
        if (data.theme_color) setSelectedColor(data.theme_color);
        if (data.logo_url !== undefined) setLogoPreview(data.logo_url);
        if (data.schedule) {
          const sanitized = sanitizeSchedule(data.schedule);
          setSchedule(sanitized);
          try {
            localStorage.setItem("gym_schedule_data", JSON.stringify(sanitized));
          } catch (e) {
            // ignore
          }
        }
      }

      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const saveScheduleToStorage = (updatedSchedule: GymSchedule) => {
    const sanitized = sanitizeSchedule(updatedSchedule);
    setSchedule(sanitized);
    try {
      localStorage.setItem("gym_schedule_data", JSON.stringify(sanitized));
    } catch (e) {
      console.error("Failed to save schedule to localStorage", e);
    }
  };

  const toggleLiveOpenStatus = () => {
    const updated: GymSchedule = {
      ...schedule,
      is_open_now: !schedule.is_open_now,
      manual_override: true,
    };
    saveScheduleToStorage(updated);
  };

  const handleAnnouncementChange = (val: string) => {
    const updated: GymSchedule = {
      ...schedule,
      announcement: val,
    };
    saveScheduleToStorage(updated);
  };

  const handleDayHourChange = (index: number, field: keyof ScheduleDay, value: any) => {
    const currentHours = schedule.regular_hours || defaultDays;
    const updatedHours = [...currentHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    const updated: GymSchedule = {
      ...schedule,
      regular_hours: updatedHours,
    };
    saveScheduleToStorage(updated);
  };

  const handleAddClosedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClosedDate) return;
    const newItem: SpecialClosedDate = {
      id: Date.now().toString(),
      date: newClosedDate,
      reason: newClosedReason || "Closed All Day",
    };
    const currentClosed = schedule.special_closed_dates || [];
    const updated: GymSchedule = {
      ...schedule,
      special_closed_dates: [...currentClosed, newItem],
    };
    saveScheduleToStorage(updated);
    setNewClosedDate("");
    setNewClosedReason("");
    setShowAddClosedModal(false);
  };

  const handleRemoveClosedDate = (id: string) => {
    const currentClosed = schedule.special_closed_dates || [];
    const updated: GymSchedule = {
      ...schedule,
      special_closed_dates: currentClosed.filter((item) => item.id !== id),
    };
    saveScheduleToStorage(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 400;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setLogoPreview(canvas.toDataURL("image/png"));
          } else {
            setLogoPreview(rawUrl);
          }
        };
        img.onerror = () => setLogoPreview(rawUrl);
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const sanitizedSched = sanitizeSchedule(schedule);
    const payload = {
      name: gymName,
      theme_color: selectedColor,
      logo_url: logoPreview,
      schedule: sanitizedSched,
    };

    // 1. Save full customization payload to localStorage
    try {
      localStorage.setItem("gym_settings_data", JSON.stringify(payload));
      localStorage.setItem("gym_schedule_data", JSON.stringify(sanitizedSched));
    } catch (err) {
      console.error("Failed to store settings in localStorage:", err);
    }

    // 2. Broadcast custom event to update Sidebar, Portal, Landing Gateway instantly
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("gym-settings-updated", { detail: payload })
      );
    }

    // 3. Persist to Supabase DB
    const { success, error } = await updateGymSettings(payload);

    setIsSubmitting(false);

    if (error) {
      console.warn("Supabase save warning (saved locally):", error);
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const regularHoursList = schedule.regular_hours || defaultDays;
  const specialClosedList = schedule.special_closed_dates || [];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl touch-manipulation w-full overflow-x-hidden" suppressHydrationWarning>
      <BackButton />

      {/* Toast Alert */}
      {isSaved && (
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 bg-zinc-900 text-zinc-100 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl shadow-soft-lg flex items-center gap-3 border-2 border-red-500 animate-bounce max-w-[calc(100vw-2rem)]">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-extrabold text-xs sm:text-sm truncate">
            Customization settings & operating schedule saved successfully! ✨
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121214] p-5 sm:p-8 rounded-2xl shadow-md border border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-800 text-zinc-300 text-xs font-extrabold mb-2 border border-zinc-700">
            <Sparkles className="w-3.5 h-3.5 text-red-500 shrink-0" /> Customization & Schedule
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Customization & Schedule Controls
          </h1>
          <p className="text-zinc-400 font-medium text-xs sm:text-sm mt-1">
            Manage your gym logo asset, live status, broadcast notices, and operating hours.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 font-extrabold text-xs">
          Notice: {errorMsg}
        </div>
      )}

      {/* Main Settings Form Container */}
      <form onSubmit={handleSaveSettings} className="space-y-6 sm:space-y-8 w-full">
        {/* SECTION 1: BRAND NAME & LOGO ASSET */}
        <div id="tutorial-settings-branding" className="bg-[#121214] p-5 sm:p-8 rounded-2xl shadow-md border border-zinc-800 space-y-6 sm:space-y-8">
          {/* Gym Name Input Section */}
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-extrabold text-zinc-100 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-red-500 shrink-0" /> Gym Brand Name
            </h2>
            <p className="text-xs font-bold text-zinc-400">
              Set the official display name for your gym across the portal, sidebar, and headers.
            </p>
            <input
              type="text"
              required
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              placeholder="e.g. JLAB Fitness"
              inputMode="text"
              enterKeyHint="next"
              className="w-full px-4 py-3.5 rounded-2xl bg-zinc-900 border-2 border-zinc-700 text-zinc-100 text-base sm:text-sm font-extrabold focus:outline-none focus:border-red-500 shadow-sm min-h-[48px]"
            />
          </div>

          {/* Logo Upload Section */}
          <div className="space-y-4 pt-6 border-t border-zinc-800">
            <h2 className="text-base sm:text-lg font-extrabold text-zinc-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-red-500 shrink-0" /> Gym Logo Asset
            </h2>
            <p className="text-xs font-bold text-zinc-400">
              Upload your gym logo or use the default JLAB Fitness logo asset (PNG, SVG, or JPEG).
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              <div className="w-24 h-24 rounded-2xl bg-zinc-950 border-2 border-zinc-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Gym Logo"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Dumbbell className="w-10 h-10 text-red-500 shrink-0" />
                )}
              </div>

              <div className="flex-1 w-full space-y-3">
                <label className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-100 font-extrabold text-xs cursor-pointer transition w-full sm:w-auto border-2 border-zinc-700 min-h-[48px] touch-manipulation">
                  <ImageIcon className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Upload New Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {logoPreview && logoPreview !== DEFAULT_LOGO_URL && (
                  <button
                    type="button"
                    onClick={() => setLogoPreview(DEFAULT_LOGO_URL)}
                    className="block text-xs text-red-400 font-extrabold hover:underline cursor-pointer"
                  >
                    Reset to default gym logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: LIVE GYM STATUS & OPERATING SCHEDULE */}
        <div className="bg-[#121214] p-5 sm:p-8 rounded-2xl shadow-md border border-zinc-800 space-y-6 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-800 text-zinc-300 text-xs font-extrabold mb-2 border border-zinc-700">
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" /> Live Status
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-zinc-100 flex items-center gap-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 shrink-0" /> Operating Status & Schedule
              </h2>
              <p className="text-xs sm:text-sm font-medium text-zinc-400 mt-1">
                Toggle live operating status instantly and configure regular weekly matrix hours & holiday dates.
              </p>
            </div>

            {/* Prominent Live Status Toggle */}
            <div className="shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={toggleLiveOpenStatus}
                className={`w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm tracking-wide rounded-2xl border-2 transition-all active:scale-[0.98] shadow-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer min-h-[48px] touch-manipulation ${
                  schedule.is_open_now
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                    : "bg-red-600 hover:bg-red-500 text-white border-red-500"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${schedule.is_open_now ? "bg-white animate-pulse" : "bg-white"}`} />
                <span>{schedule.is_open_now ? "GYM IS OPEN NOW" : "GYM IS CLOSED NOW"}</span>
              </button>
            </div>
          </div>

          {/* Broadcast Announcement */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-extrabold text-zinc-300 uppercase tracking-wide flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500 shrink-0" /> Broadcast Announcement Notice
            </label>
            <input
              type="text"
              value={schedule.announcement || ""}
              onChange={(e) => handleAnnouncementChange(e.target.value)}
              placeholder='e.g. "Closing at 5:00 PM today for deep cleaning"'
              inputMode="text"
              enterKeyHint="done"
              className="w-full px-4 py-3.5 rounded-2xl bg-zinc-900 border-2 border-zinc-700 text-zinc-100 text-base sm:text-sm focus:outline-none focus:border-red-500 font-bold min-h-[48px]"
            />
          </div>

          {/* Weekly Hours Matrix */}
          <div className="space-y-4 pt-6 border-t border-zinc-800">
            <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500 shrink-0" /> Weekly Operating Hours Matrix
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 w-full">
              {regularHoursList.map((dayItem, idx) => (
                <div
                  key={dayItem.day}
                  className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col justify-between ${
                    dayItem.is_closed ? "bg-zinc-950/40 border-zinc-800/80 opacity-70" : "bg-zinc-950 border-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                    <span className="font-extrabold text-sm text-zinc-100">{dayItem.day}</span>
                    <label className="inline-flex items-center gap-2 cursor-pointer py-1 min-h-[36px]">
                      <input
                        type="checkbox"
                        checked={dayItem.is_closed}
                        onChange={(e) => handleDayHourChange(idx, "is_closed", e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-zinc-700 text-red-600 focus:ring-0 cursor-pointer bg-zinc-900"
                      />
                      <span className="text-xs font-bold text-zinc-400">Closed</span>
                    </label>
                  </div>

                  {!dayItem.is_closed ? (
                    <div className="flex flex-col gap-3">
                      <div>
                        <span className="text-[11px] text-zinc-400 uppercase font-extrabold block mb-1">Open</span>
                        <input
                          type="time"
                          value={dayItem.open}
                          onChange={(e) => handleDayHourChange(idx, "open", e.target.value)}
                          className="w-full h-12 px-3 rounded-xl border-2 border-zinc-700 bg-zinc-900 font-bold text-base sm:text-sm text-zinc-100 focus:border-red-500 focus:outline-none min-h-[44px] scheme-dark [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-400 uppercase font-extrabold block mb-1">Close</span>
                        <input
                          type="time"
                          value={dayItem.close}
                          onChange={(e) => handleDayHourChange(idx, "close", e.target.value)}
                          className="w-full h-12 px-3 rounded-xl border-2 border-zinc-700 bg-zinc-900 font-bold text-base sm:text-sm text-zinc-100 focus:border-red-500 focus:outline-none min-h-[44px] scheme-dark [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-950/40 text-red-400 px-4 py-3 rounded-xl font-bold w-full text-center border border-red-900/50 text-xs">
                      Closed All Day
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Special Closed Dates / Holidays */}
          <div className="space-y-4 pt-6 border-t border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" /> Special Closed Dates & Holidays
                </h3>
                <p className="text-xs font-medium text-zinc-400 mt-0.5">
                  Override regular schedule for holidays, maintenance, or special occasions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddClosedModal(true)}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-100 font-extrabold text-xs border border-zinc-700 flex items-center justify-center gap-2 transition cursor-pointer min-h-[44px] touch-manipulation"
              >
                <Plus className="w-4 h-4 text-red-500 shrink-0" /> Add Closed Date
              </button>
            </div>

            {specialClosedList.length === 0 ? (
              <p className="text-xs font-bold text-zinc-500 italic bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center">
                No special closed dates configured. Click "Add Closed Date" to schedule holiday closures.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
                {specialClosedList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-red-950/30 rounded-2xl border border-red-800/60 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="block font-black text-xs text-red-400">{item.date}</span>
                      <span className="block text-xs font-bold text-zinc-300">{item.reason}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveClosedDate(item.id)}
                      className="p-2.5 rounded-xl bg-zinc-900 hover:bg-red-950 text-red-400 border border-zinc-700 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                      title="Remove date"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-white font-extrabold text-sm rounded-2xl shadow-soft border-2 border-red-500 transition-all active:scale-[0.98] disabled:opacity-50 min-h-[48px] sm:min-h-[52px] bg-red-600 hover:bg-red-700 cursor-pointer touch-manipulation"
          >
            <Save className="w-5 h-5 shrink-0" /> {isSubmitting ? "Saving..." : "Save Customization Settings"}
          </button>
        </div>
      </form>

      {/* Modal: Add Special Closed Date */}
      {showAddClosedModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121214] border-t-2 sm:border-2 border-zinc-700 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base sm:text-lg font-extrabold text-zinc-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500 shrink-0" /> Add Closed Date / Holiday
              </h3>
              <button
                type="button"
                onClick={() => setShowAddClosedModal(false)}
                className="p-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <form onSubmit={handleAddClosedDate} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-zinc-300 uppercase mb-1.5">
                  Select Date
                </label>
                <input
                  type="date"
                  required
                  value={newClosedDate}
                  onChange={(e) => setNewClosedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border-2 border-zinc-700 text-zinc-100 font-bold text-base sm:text-sm focus:outline-none focus:border-red-500 min-h-[48px] scheme-dark [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-300 uppercase mb-1.5">
                  Reason for Closure
                </label>
                <input
                  type="text"
                  required
                  value={newClosedReason}
                  onChange={(e) => setNewClosedReason(e.target.value)}
                  placeholder="e.g. National Holiday - Closed All Day"
                  inputMode="text"
                  enterKeyHint="done"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border-2 border-zinc-700 text-zinc-100 font-bold text-base sm:text-sm focus:outline-none focus:border-red-500 min-h-[48px]"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClosedModal(false)}
                  className="w-full sm:w-1/2 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-300 font-extrabold text-xs border border-zinc-700 cursor-pointer min-h-[48px] touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-1/2 py-3 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-extrabold text-xs border border-red-500 shadow-soft cursor-pointer min-h-[48px] touch-manipulation"
                >
                  Add Closed Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
