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
} from "lucide-react";
import { getGymSettings, updateGymSettings } from "@/app/actions/settings";
import { BackButton } from "@/components/BackButton";

export default function SettingsPage() {
  const [gymName, setGymName] = useState("PowerFit Studio");
  const [gymDomain, setGymDomain] = useState("powerfit.gymsaas.io");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      }
      setIsLoading(false);
    }
    loadSettings();
  }, []);

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

    const { success, error } = await updateGymSettings({
      name: gymName,
      theme_color: selectedColor,
      logo_url: logoPreview,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error);
      return;
    }

    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <BackButton />

      {/* Toast Alert */}
      {isSaved && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-soft-lg flex items-center gap-3 border-4 border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-extrabold text-sm">
            Gym customization settings updated successfully! ✨
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#E2E8F0] p-5 sm:p-8 rounded-2xl shadow-soft border-4 border-slate-700">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-sky-200 text-sky-950 text-xs font-extrabold mb-2 border-2 border-slate-700">
            <Sparkles className="w-3.5 h-3.5" /> Gym Customization
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Gym Customization Settings
          </h1>
          <p className="text-slate-700 font-bold text-sm mt-1">
            As the gym owner, you can update your gym name, theme colors, and logo anytime independently.
          </p>
        </div>

        <div
          className="px-4 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 border-3 shadow-soft self-start md:self-auto"
          style={{
            backgroundColor: `${selectedColor}25`,
            color: selectedColor,
            borderColor: "#334155",
          }}
        >
          <Building className="w-4 h-4" /> Single-Gym Active
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-200 border-3 border-slate-700 text-rose-950 font-extrabold text-xs">
          Error: {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-2 bg-[#E2E8F0] p-5 sm:p-8 rounded-2xl shadow-soft border-4 border-slate-700 space-y-6">
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

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase mb-2">
                  Custom Domain or Subdomain
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-3.5 bg-slate-300 text-slate-700 rounded-l-2xl border-y-3 border-l-3 border-slate-700 text-sm font-extrabold flex items-center min-h-[52px]">
                    https://
                  </span>
                  <input
                    type="text"
                    required
                    value={gymDomain}
                    onChange={(e) => setGymDomain(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-r-2xl bg-white border-3 border-slate-700 text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-sky-400 font-extrabold min-h-[52px]"
                  />
                </div>
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
          <div className="bg-[#E2E8F0] p-6 rounded-2xl shadow-soft border-4 border-slate-700 space-y-6 sticky top-6">
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
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5 truncate">
                  <Globe className="w-3 h-3 shrink-0" /> {gymDomain}
                </p>
              </div>
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

            <div className="text-xs font-bold text-slate-700 space-y-1">
              <p>• Font: Comic Sans MS enforced</p>
              <p>• Minimum Border Radius: 20px (rounded-2xl)</p>
              <p>• Thick bold outlines & non-glare mid-tone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

