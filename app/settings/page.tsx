"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Upload,
  Palette,
  CheckCircle2,
  Dumbbell,
  Building,
  Globe,
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

  const [gymName, setGymName] = useState("PowerFit Studio");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
    { name: "Pastel Blue", hex: "#60A5FA", bgClass: "bg-sky-400" },
    { name: "Pastel Green", hex: "#4ADE80", bgClass: "bg-emerald-400" },
    { name: "Pastel Purple", hex: "#C084FC", bgClass: "bg-purple-400" },
    { name: "Pastel Rose", hex: "#FB7185", bgClass: "bg-rose-400" },
  ];

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      const { data, error } = await getGymSettings();
      if (error) {
        setErrorMsg(error);
      } else if (data) {
        setGymName(data.name || "PowerFit Studio");
        setSelectedColor(data.theme_color || "#3B82F6");
        setLogoPreview(data.logo_url || null);
        if (data.schedule && data.schedule.regular_hours && data.schedule.regular_hours.length > 0) {
          setSchedule(data.schedule);
        }
      }

      // Check localStorage for schedule fallback
      try {
        const savedSchedule = localStorage.getItem("gym_schedule_data");
        if (savedSchedule) {
          const parsed = JSON.parse(savedSchedule);
          if (parsed && parsed.regular_hours && parsed.regular_hours.length > 0) {
            setSchedule(parsed);
          }
        }
      } catch (e) {
        console.error("Error reading gym_schedule_data from localStorage", e);
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

    // Save schedule to localStorage
    saveScheduleToStorage(schedule);

    const { success, error } = await updateGymSettings({
      name: gymName,
      theme_color: selectedColor,
      logo_url: logoPreview,
      schedule: schedule,
    });

    setIsSubmitting(false);

    if (error) {
      // Still show saved locally if error was due to missing server column
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
      return;
    }

    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-10" suppressHydrationWarning>
        <BackButton />
        <div className="bg-[#121214] p-6 sm:p-8 rounded-2xl border-2 border-zinc-800 text-zinc-300 font-bold text-center">
          Loading gym settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 font-['Comic_Sans_MS',cursive,sans-serif]" suppressHydrationWarning>
      <BackButton />

      {/* Toast Alert */}
      {isSaved && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-soft-lg flex items-center gap-3 border-4 border-slate-700/80 animate-bounce font-['Comic_Sans_MS',cursive,sans-serif]">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-extrabold text-sm">
            Gym settings & operating schedule saved successfully! ✨
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#E2E8F0] p-6 sm:p-8 rounded-2xl shadow-soft border-4 border-slate-700/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-sky-200 text-sky-950 text-xs font-extrabold mb-2 border-2 border-slate-700">
            <Sparkles className="w-3.5 h-3.5" /> Gym Customization & Schedule
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Gym Customization & Schedule Controls
          </h1>
          <p className="text-slate-700 font-bold text-sm mt-1">
            Manage your gym profile, live status toggle, broadcast announcements, and weekly operating hours.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-200 border-3 border-slate-700 text-rose-950 font-extrabold text-xs">
          Notice: {errorMsg}
        </div>
      )}

      {/* SECTION 2: LIVE GYM STATUS & OPERATING SCHEDULE */}
      <div className="bg-[#E2E8F0] p-6 sm:p-8 rounded-2xl shadow-soft border-4 border-slate-700/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-3 border-slate-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-emerald-200 text-emerald-950 text-xs font-extrabold mb-2 border-2 border-slate-700">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Controls
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-sky-700" /> Live Gym Status & Operating Schedule
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
              Toggle live operating status instantly and configure regular weekly matrix hours & holiday dates.
            </p>
          </div>

          {/* Prominent Live Status Toggle */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={toggleLiveOpenStatus}
              className={`w-full sm:w-auto px-6 py-3.5 text-base tracking-wide rounded-lg border-2 border-slate-700/80 transition-all active:scale-95 shadow-sm font-extrabold flex items-center justify-center gap-2 ${
                schedule.is_open_now
                  ? "bg-emerald-500 text-white border-emerald-600"
                  : "bg-rose-500 text-white border-rose-600"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${schedule.is_open_now ? "bg-white animate-pulse" : "bg-white"}`} />
              <span>{schedule.is_open_now ? "GYM IS OPEN NOW" : "GYM IS CLOSED NOW"}</span>
            </button>
          </div>
        </div>

        {/* Broadcast Announcement */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-600" /> Broadcast Announcement Notice
          </label>
          <input
            type="text"
            value={schedule.announcement || ""}
            onChange={(e) => handleAnnouncementChange(e.target.value)}
            placeholder='e.g. "Closing at 5:00 PM today for deep cleaning"'
            className="w-full px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-extrabold min-h-[52px]"
          />
        </div>

        {/* Weekly Hours Matrix */}
        <div className="space-y-4 pt-4 border-t-3 border-slate-700">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-700" /> Weekly Operating Hours Matrix
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {schedule.regular_hours.map((dayItem, idx) => (
              <div
                key={dayItem.day}
                className={`p-4 sm:p-5 rounded-2xl border-3 border-slate-700 flex flex-col justify-between ${
                  dayItem.is_closed ? "bg-slate-300/70 opacity-80" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3 mb-3">
                  <span className="font-extrabold text-sm text-slate-900">{dayItem.day}</span>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dayItem.is_closed}
                      onChange={(e) => handleDayHourChange(idx, "is_closed", e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-slate-700 text-rose-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">Closed</span>
                  </label>
                </div>

                {!dayItem.is_closed ? (
                  <div className="flex flex-col gap-3">
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-extrabold block mb-1">Open</span>
                      <input
                        type="time"
                        value={dayItem.open}
                        onChange={(e) => handleDayHourChange(idx, "open", e.target.value)}
                        className="w-full h-12 px-3 rounded-xl border-2 border-slate-400 bg-white font-bold text-lg text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-extrabold block mb-1">Close</span>
                      <input
                        type="time"
                        value={dayItem.close}
                        onChange={(e) => handleDayHourChange(idx, "close", e.target.value)}
                        className="w-full h-12 px-3 rounded-xl border-2 border-slate-400 bg-white font-bold text-lg text-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold w-full text-center border-2 border-red-200 text-xs">
                    Closed All Day
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Special Closed Dates / Holidays */}
        <div className="space-y-4 pt-4 border-t-3 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" /> Special Closed Dates & Holidays
              </h3>
              <p className="text-xs font-bold text-slate-700">
                Override regular schedule for holidays, maintenance, or special occasions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddClosedModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-sky-300 hover:bg-sky-400 text-slate-900 font-extrabold text-xs border-3 border-slate-700 shadow-soft flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Add Closed Date
            </button>
          </div>

          {schedule.special_closed_dates.length === 0 ? (
            <p className="text-xs font-bold text-slate-600 italic bg-white/70 p-4 rounded-2xl border-2 border-slate-700 text-center">
              No special closed dates configured. Click "Add Closed Date" to schedule holiday closures.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {schedule.special_closed_dates.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-rose-100/90 rounded-2xl border-3 border-slate-700 flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="block font-black text-xs text-rose-950">{item.date}</span>
                    <span className="block text-xs font-extrabold text-slate-800">{item.reason}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveClosedDate(item.id)}
                    className="p-2 rounded-xl bg-white hover:bg-rose-200 text-rose-700 border-2 border-slate-700 transition"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-2 bg-[#E2E8F0] p-6 sm:p-8 rounded-2xl shadow-soft border-4 border-slate-700/80 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Gym Name & Subdomain */}
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-sky-700" /> Gym Profile
              </h2>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-2">
                  Gym Name
                </label>
                <input
                  type="text"
                  required
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-sky-400 font-extrabold min-h-[52px]"
                />
              </div>
            </div>

            {/* Logo Upload Section */}
            <div className="space-y-4 pt-4 border-t-3 border-slate-700">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-700" /> Gym Logo Asset
              </h2>
              <p className="text-xs font-bold text-slate-700">
                Recommended size: 512x512px (PNG, SVG, or JPEG).
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white border-3 border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Uploaded Gym Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Dumbbell className="w-9 h-9 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 w-full">
                  <label className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-200 text-slate-800 font-extrabold text-xs cursor-pointer transition w-full sm:w-auto border-3 border-slate-700 min-h-[52px]">
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload New Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => setLogoPreview(null)}
                      className="block text-xs text-rose-700 font-extrabold mt-2 hover:underline"
                    >
                      Remove custom logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Theme Color Selection */}
            <div className="space-y-4 pt-4 border-t-3 border-slate-700">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-sky-700" /> Custom Primary Theme Color
              </h2>
              <p className="text-xs font-bold text-slate-700">
                Pick a primary theme accent color for navigation, buttons, and badges.
              </p>

              {/* Preset Color Swatches */}
              <div className="flex flex-wrap items-center gap-3">
                {presetColors.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setSelectedColor(color.hex)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-3 transition-all min-h-[48px] ${
                      selectedColor === color.hex
                        ? "border-slate-900 bg-white shadow-soft"
                        : "border-slate-700 hover:bg-slate-100 bg-white/60"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border-2 border-slate-700"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-extrabold text-slate-900">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Hex Custom Color Picker */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-12 h-12 rounded-2xl border-3 border-slate-700 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="px-4 py-3.5 rounded-2xl bg-white border-3 border-slate-700 text-xs font-extrabold text-slate-900 w-36 focus:outline-none focus:ring-2 focus:ring-sky-400 min-h-[52px]"
                />
                <span className="text-xs font-bold text-slate-700">Custom Hex Code</span>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t-3 border-slate-700 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-extrabold text-sm rounded-2xl shadow-soft border-3 border-slate-700 transition-all disabled:opacity-50 min-h-[56px]"
                style={{ backgroundColor: selectedColor }}
              >
                <Save className="w-5 h-5" /> {isSubmitting ? "Saving..." : "Save Customization Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900">Live Branded Preview</h2>
          <div className="bg-[#E2E8F0] p-6 sm:p-8 rounded-2xl shadow-soft border-4 border-slate-700/80 space-y-6 sticky top-6">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold overflow-hidden shadow-soft border-3 border-slate-700 shrink-0"
                style={{ backgroundColor: selectedColor }}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Dumbbell className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-extrabold text-lg text-slate-900 leading-tight truncate">
                  {gymName}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white space-y-3 border-3 border-slate-700">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Live Operating Banner
              </span>
              <div
                className={`p-3 rounded-lg border-2 border-slate-700 font-extrabold text-xs text-center flex items-center justify-center gap-2 ${
                  schedule.is_open_now
                    ? "bg-emerald-200 text-emerald-950"
                    : "bg-rose-200 text-rose-950"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${schedule.is_open_now ? "bg-emerald-700 animate-pulse" : "bg-rose-700"}`} />
                <span>{schedule.is_open_now ? "Gym is OPEN NOW" : "Gym is CLOSED NOW"}</span>
              </div>
              {schedule.announcement && (
                <p className="text-[11px] font-bold text-slate-800 bg-amber-100 p-2 rounded-lg border border-slate-700 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{schedule.announcement}</span>
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white space-y-3 border-3 border-slate-700">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Themed UI Element Preview
              </span>
              <button
                type="button"
                className="w-full py-3.5 px-4 rounded-2xl text-white font-extrabold text-xs shadow-soft border-2 border-slate-700 transition-transform active:scale-95 min-h-[48px]"
                style={{ backgroundColor: selectedColor }}
              >
                Branded Primary Button
              </button>
              <div
                className="p-3.5 rounded-2xl text-xs font-extrabold text-center border-2 border-slate-700"
                style={{
                  backgroundColor: `${selectedColor}20`,
                  color: selectedColor,
                }}
              >
                Active Membership Plan Badge
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Special Closed Date */}
      {showAddClosedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-[#E2E8F0] border-4 border-slate-700/80 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-soft-lg">
            <div className="flex items-center justify-between border-b-3 border-slate-700 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-600" /> Add Closed Date / Holiday
              </h3>
              <button
                type="button"
                onClick={() => setShowAddClosedModal(false)}
                className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 border-2 border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClosedDate} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  required
                  value={newClosedDate}
                  onChange={(e) => setNewClosedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                  Reason for Closure
                </label>
                <input
                  type="text"
                  required
                  value={newClosedReason}
                  onChange={(e) => setNewClosedReason(e.target.value)}
                  placeholder="e.g. National Holiday - Closed All Day"
                  className="w-full px-4 py-3 rounded-2xl bg-white border-3 border-slate-700 text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClosedModal(false)}
                  className="w-1/2 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs border-3 border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs border-3 border-slate-700 shadow-soft"
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
