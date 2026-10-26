"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Upload,
  Palette,
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

export default function SettingsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [gymName, setGymName] = useState("JLAB Fitness");
  const [selectedColor, setSelectedColor] = useState("#EF4444");
  const [logoPreview, setLogoPreview] = useState<string | null>("/jlab-logo.svg");
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gym Schedule & Live Status state
  const [schedule, setSchedule] = useState<GymSchedule>(initialSchedule);
  const [showAddClosedModal, setShowAddClosedModal] = useState(false);
  const [newClosedDate, setNewClosedDate] = useState("");
  const [newClosedReason, setNewClosedReason] = useState("");

  const presetColors = [
    { name: "Crimson Red", hex: "#EF4444" },
    { name: "Scarlet Red", hex: "#DC2626" },
    { name: "Blood Red", hex: "#991B1B" },
    { name: "Dark Charcoal", hex: "#27272A" },
    { name: "Dark Silver", hex: "#71717A" },
  ];

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
          if (parsed.schedule?.regular_hours?.length > 0) {
            setSchedule(parsed.schedule);
          }
        } else {
          const savedSchedule = localStorage.getItem("gym_schedule_data");
          if (savedSchedule) {
            const parsed = JSON.parse(savedSchedule);
            if (parsed?.regular_hours?.length > 0) setSchedule(parsed);
          }
        }
      } catch (e) {
        console.error("Error reading gym_settings_data from localStorage", e);
      }

      // 2. Fetch remote DB settings
      const { data, error } = await getGymSettings();
      if (error) {
        console.warn("Supabase loadSettings warning:", error);
      } else if (data) {
        const localSettingsRaw = localStorage.getItem("gym_settings_data");
        if (!localSettingsRaw) {
          if (data.name) setGymName(data.name);
          if (data.theme_color) setSelectedColor(data.theme_color);
          if (data.logo_url !== undefined) setLogoPreview(data.logo_url);
          if (data.schedule && data.schedule.regular_hours && data.schedule.regular_hours.length > 0) {
            setSchedule(data.schedule);
          }
        }
      }

      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const saveScheduleToStorage = (updatedSchedule: GymSchedule) => {
    setSchedule(updatedSchedule);
    try {
      localStorage.setItem("gym_schedule_data", JSON.stringify(updatedSchedule));
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
    const updatedHours = [...schedule.regular_hours];
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
    const updated: GymSchedule = {
      ...schedule,
      special_closed_dates: [...schedule.special_closed_dates, newItem],
    };
    saveScheduleToStorage(updated);
    setNewClosedDate("");
    setNewClosedReason("");
    setShowAddClosedModal(false);
  };

  const handleRemoveClosedDate = (id: string) => {
    const updated: GymSchedule = {
      ...schedule,
      special_closed_dates: schedule.special_closed_dates.filter((item) => item.id !== id),
    };
    saveScheduleToStorage(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: gymName,
      theme_color: selectedColor,
      logo_url: logoPreview,
      schedule: schedule,
    };

    // 1. Immediately save full customization payload to localStorage
    try {
      localStorage.setItem("gym_settings_data", JSON.stringify(payload));
      localStorage.setItem("gym_schedule_data", JSON.stringify(schedule));
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

  if (!isMounted) {
    return (
      <div className="space-y-8" suppressHydrationWarning>
        <BackButton />
        <div className="bg-[#121214] p-6 sm:p-8 rounded-2xl border-2 border-zinc-800 text-zinc-300 font-bold text-center">
          Loading gym settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl" suppressHydrationWarning>
      <BackButton />

      {/* Toast Alert */}
      {isSaved && (
        <div className="fixed top-6 right-6 z-50 bg-zinc-900 text-zinc-100 px-6 py-4 rounded-xl shadow-soft-lg flex items-center gap-3 border-2 border-red-500 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-extrabold text-sm">
            Customization settings & operating schedule saved successfully! ✨
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121214] p-6 sm:p-8 rounded-2xl shadow-md border border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-zinc-800 text-zinc-300 text-xs font-extrabold mb-2 border border-zinc-700">
            <Sparkles className="w-3.5 h-3.5 text-red-500" /> Customization & Schedule
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100">
            Customization & Schedule Controls
          </h1>
          <p className="text-zinc-400 font-medium text-sm mt-1">
            Manage your gym logo asset, theme color accents, live status, broadcast notices, and operating hours.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 font-extrabold text-xs">
          Notice: {errorMsg}
        </div>
      )}

      {/* Main Settings Form Container */}
      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* SECTION 1: LOGO ASSET & THEME COLOR */}
        <div className="bg-[#121214] p-6 sm:p-8 rounded-2xl shadow-md border border-zinc-800 space-y-8">
          {/* Gym Name Input Section */}
          <div className="space-y-3">
            <h2 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-red-500" /> Gym Brand Name
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
              className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border-2 border-zinc-700 text-zinc-100 text-sm font-extrabold focus:outline-none focus:border-red-500 shadow-sm"
            />
          </div>

          {/* Logo Upload Section */}
          <div className="space-y-4 pt-6 border-t border-zinc-800">
            <h2 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-red-500" /> Gym Logo Asset
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
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Dumbbell className="w-10 h-10 text-red-500" />
                )}
              </div>

              <div className="flex-1 w-full space-y-3">
                <label className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-extrabold text-xs cursor-pointer transition w-full sm:w-auto border-2 border-zinc-700">
                  <ImageIcon className="w-4 h-4 text-red-500" />
                  <span>Upload New Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {logoPreview && logoPreview !== "/jlab-logo.svg" && (
                  <button
                    type="button"
                    onClick={() => setLogoPreview("/jlab-logo.svg")}
                    className="block text-xs text-red-400 font-extrabold hover:underline"
                  >
                    Reset to default JLAB Fitness logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Primary Theme Color Selection */}
          <div className="space-y-4 pt-6 border-t border-zinc-800">
            <h2 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2">
              <Palette className="w-5 h-5 text-red-500" /> Primary Theme Accent Color
            </h2>
            <p className="text-xs font-bold text-zinc-400">
              Choose a primary theme accent color for navigation, buttons, and badges.
            </p>

            {/* Preset Color Swatches */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {presetColors.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setSelectedColor(color.hex)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedColor === color.hex
                      ? "border-red-500 bg-zinc-800 text-zinc-100 shadow-sm"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 text-zinc-300"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-zinc-600 shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-xs font-extrabold">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Hex Custom Color Picker */}
            <div className="flex items-center gap-3 pt-3">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-11 h-11 rounded-xl border-2 border-zinc-700 cursor-pointer p-0.5 bg-zinc-900"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="px-4 py-3 rounded-xl bg-zinc-900 border-2 border-zinc-700 text-xs font-extrabold text-zinc-100 w-36 focus:outline-none focus:border-red-500"
              />
              <span className="text-xs font-extrabold text-zinc-400">Custom Hex Code</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: LIVE GYM STATUS & OPERATING SCHEDULE */}
        <div className="bg-[#121214] p-6 sm:p-8 rounded-2xl shadow-md border border-zinc-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-zinc-800 text-zinc-300 text-xs font-extrabold mb-2 border border-zinc-700">
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Live Status
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-zinc-100 flex items-center gap-2">
                <Clock className="w-6 h-6 text-red-500" /> Operating Status & Schedule
              </h2>
              <p className="text-xs sm:text-sm font-medium text-zinc-400 mt-1">
                Toggle live operating status instantly and configure regular weekly matrix hours & holiday dates.
              </p>
            </div>

            {/* Prominent Live Status Toggle */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={toggleLiveOpenStatus}
                className={`w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm tracking-wide rounded-xl border-2 transition-all active:scale-95 shadow-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer ${
                  schedule.is_open_now
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                    : "bg-red-600 hover:bg-red-500 text-white border-red-500"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${schedule.is_open_now ? "bg-white animate-pulse" : "bg-white"}`} />
                <span>{schedule.is_open_now ? "GYM IS OPEN NOW" : "GYM IS CLOSED NOW"}</span>
              </button>
            </div>
          </div>

          {/* Broadcast Announcement */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-extrabold text-zinc-300 uppercase tracking-wide flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" /> Broadcast Announcement Notice
            </label>
            <input
              type="text"
              value={schedule.announcement || ""}
              onChange={(e) => handleAnnouncementChange(e.target.value)}
              placeholder='e.g. "Closing at 5:00 PM today for deep cleaning"'
              className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border-2 border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-red-500 font-bold"
            />
          </div>

          {/* Weekly Hours Matrix */}
          <div className="space-y-4 pt-6 border-t border-zinc-800">
            <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" /> Weekly Operating Hours Matrix
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {schedule.regular_hours.map((dayItem, idx) => (
                <div
                  key={dayItem.day}
                  className={`p-4 sm:p-5 rounded-xl border-2 flex flex-col justify-between ${
                    dayItem.is_closed ? "bg-zinc-950/40 border-zinc-800/80 opacity-70" : "bg-zinc-950 border-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                    <span className="font-extrabold text-sm text-zinc-100">{dayItem.day}</span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dayItem.is_closed}
                        onChange={(e) => handleDayHourChange(idx, "is_closed", e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-zinc-700 text-red-600 focus:ring-0 cursor-pointer bg-zinc-900"
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
                          className="w-full h-11 px-3 rounded-lg border-2 border-zinc-700 bg-zinc-900 font-bold text-sm text-zinc-100 focus:border-red-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-400 uppercase font-extrabold block mb-1">Close</span>
                        <input
                          type="time"
                          value={dayItem.close}
                          onChange={(e) => handleDayHourChange(idx, "close", e.target.value)}
                          className="w-full h-11 px-3 rounded-lg border-2 border-zinc-700 bg-zinc-900 font-bold text-sm text-zinc-100 focus:border-red-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-950/40 text-red-400 px-4 py-3 rounded-lg font-bold w-full text-center border border-red-900/50 text-xs">
                      Closed All Day
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Special Closed Dates / Holidays */}
          <div className="space-y-4 pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" /> Special Closed Dates & Holidays
                </h3>
                <p className="text-xs font-medium text-zinc-400">
                  Override regular schedule for holidays, maintenance, or special occasions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddClosedModal(true)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-extrabold text-xs border border-zinc-700 flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-red-500" /> Add Closed Date
              </button>
            </div>

            {schedule.special_closed_dates.length === 0 ? (
              <p className="text-xs font-bold text-zinc-500 italic bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                No special closed dates configured. Click "Add Closed Date" to schedule holiday closures.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {schedule.special_closed_dates.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-red-950/30 rounded-xl border border-red-800/60 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="block font-black text-xs text-red-400">{item.date}</span>
                      <span className="block text-xs font-bold text-zinc-300">{item.reason}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveClosedDate(item.id)}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-red-950 text-red-400 border border-zinc-700 transition cursor-pointer"
                      title="Remove date"
                    >
                      <Trash2 className="w-4 h-4" />
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white font-extrabold text-sm rounded-xl shadow-soft border-2 border-red-500 transition-all disabled:opacity-50 min-h-[52px] bg-red-600 hover:bg-red-700 cursor-pointer"
            style={{ backgroundColor: selectedColor }}
          >
            <Save className="w-5 h-5" /> {isSubmitting ? "Saving..." : "Save Customization Settings"}
          </button>
        </div>
      </form>

      {/* Modal: Add Special Closed Date */}
      {showAddClosedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121214] border-2 border-zinc-700 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" /> Add Closed Date / Holiday
              </h3>
              <button
                type="button"
                onClick={() => setShowAddClosedModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
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
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border-2 border-zinc-700 text-zinc-100 font-bold text-sm focus:outline-none focus:border-red-500"
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
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border-2 border-zinc-700 text-zinc-100 font-bold text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClosedModal(false)}
                  className="w-1/2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-extrabold text-xs border border-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs border border-red-500 shadow-soft cursor-pointer"
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
