"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Compass,
  Zap,
  ShieldCheck,
  MessageSquare,
  Users,
  QrCode,
  Calendar,
  TrendingUp,
  Plus,
  Edit3,
  AlertTriangle,
  Ban,
  Percent,
  Send,
  Image as ImageIcon,
  Award,
  Search,
  Building2,
  Clock,
  Check,
  Phone,
  Tag
} from "lucide-react";

export interface TutorialStep {
  id: string;
  viewType: "portal" | "dashboard" | "members" | "subscriptions" | "retention" | "settings";
  targetSelector: string;
  title: string;
  targetTag: string;
  category: "Member Portal" | "Admin Core" | "Operations";
  whatIsIt: string;
  whyAdded: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // --- MEMBER PORTAL STEPS ---
  {
    id: "portal-card",
    viewType: "portal",
    targetSelector: "#tutorial-portal-card",
    title: "Member Pass",
    targetTag: "Member Pass Card",
    category: "Member Portal",
    whatIsIt: "This shows your member name, plan, and when your gym pass ends.",
    whyAdded: "So members can easily check how many days they have left on their pass."
  },
  {
    id: "portal-badges",
    viewType: "portal",
    targetSelector: "#tutorial-portal-badges",
    title: "Student Discount Badge",
    targetTag: "Student Badge (50% Off)",
    category: "Member Portal",
    whatIsIt: "This shows discount badges like the Student badge (50% Off).",
    whyAdded: "So students like Virgilio Flor E. Guaño get half-price discounts."
  },
  {
    id: "portal-schedule",
    viewType: "portal",
    targetSelector: "#tutorial-portal-schedule",
    title: "Gym Operating Hours",
    targetTag: "Live Schedule",
    category: "Member Portal",
    whatIsIt: "This shows gym opening and closing times for each day.",
    whyAdded: "So members know if the gym is open before going."
  },

  // --- ADMIN DASHBOARD STEPS ---
  {
    id: "dashboard-metrics",
    viewType: "dashboard",
    targetSelector: "#tutorial-metrics-grid",
    title: "Gym Numbers & Income",
    targetTag: "Overview Stats",
    category: "Admin Core",
    whatIsIt: "This shows total members, expiring passes, and monthly gym income.",
    whyAdded: "Helps gym owners see how well the gym is doing every day."
  },
  {
    id: "dashboard-actions",
    viewType: "dashboard",
    targetSelector: "#tutorial-quick-actions",
    title: "Quick Buttons",
    targetTag: "Action Shortcuts",
    category: "Admin Core",
    whatIsIt: "Shortcuts to quickly add new members or open pages.",
    whyAdded: "Helps front desk staff register new walk-in members in seconds."
  },

  // --- MEMBER MANAGEMENT STEPS ---
  {
    id: "members-list",
    viewType: "members",
    targetSelector: "#tutorial-members-table",
    title: "Member Roster",
    targetTag: "All Members List",
    category: "Admin Core",
    whatIsIt: "List of all registered gym members, like student member Virgilio Flor E. Guaño.",
    whyAdded: "Keeps all member phone numbers, plans, and badges saved in one place."
  },
  {
    id: "members-actions",
    viewType: "members",
    targetSelector: "#tutorial-members-actions",
    title: "Member Action Buttons",
    targetTag: "Edit, Warn & Ban",
    category: "Admin Core",
    whatIsIt: "Buttons to edit member info, send warning strikes, or ban users.",
    whyAdded: "Helps staff fix member details or handle rule violations."
  },

  // --- SUBSCRIPTIONS STEPS ---
  {
    id: "subscriptions-plans",
    viewType: "subscriptions",
    targetSelector: "#tutorial-plans-grid",
    title: "Pass Prices & Plans",
    targetTag: "1 Month (1200 PHP)",
    category: "Operations",
    whatIsIt: "Sets pass prices and duration, like 1 Month for 1200 Pesos.",
    whyAdded: "Allows gym owners to set custom plan costs and validity days."
  },
  {
    id: "subscriptions-badges",
    viewType: "subscriptions",
    targetSelector: "#tutorial-badges-grid",
    title: "Discount Tags",
    targetTag: "Discount Badges",
    category: "Operations",
    whatIsIt: "Create discount tags like Student (50% Off) or VIP.",
    whyAdded: "Automatically calculates lower prices when adding students."
  },

  // --- RETENTION STEPS ---
  {
    id: "retention-hub",
    viewType: "retention",
    targetSelector: "#tutorial-retention-hub",
    title: "Text Message Reminders",
    targetTag: "SMS Renewal Alerts",
    category: "Operations",
    whatIsIt: "Finds members whose passes expire in 0-3 days.",
    whyAdded: "Sends text messages so members renew their passes on time."
  },

  // --- SETTINGS STEPS ---
  {
    id: "settings-branding",
    viewType: "settings",
    targetSelector: "#tutorial-settings-branding",
    title: "Gym Name & Logo",
    targetTag: "Brand Settings",
    category: "Operations",
    whatIsIt: "Change your gym logo image and gym name here.",
    whyAdded: "Customizes the web app with your gym's official logo and name."
  }
];

export function AppTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = TUTORIAL_STEPS[currentStepIdx] || TUTORIAL_STEPS[0];

  // Listen for trigger event
  useEffect(() => {
    const handleStartEvent = (e: CustomEvent) => {
      const stepId = e.detail?.stepId;
      if (stepId) {
        const foundIdx = TUTORIAL_STEPS.findIndex((s) => s.id === stepId);
        if (foundIdx !== -1) setCurrentStepIdx(foundIdx);
      } else {
        setCurrentStepIdx(0);
      }
      setIsOpen(true);
    };

    window.addEventListener("start-app-tutorial" as any, handleStartEvent);
    return () => {
      window.removeEventListener("start-app-tutorial" as any, handleStartEvent);
    };
  }, []);

  // Update position of spotlight & bubble pointer
  const updateSpotlightPosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    updateSpotlightPosition();
    const timer = setTimeout(updateSpotlightPosition, 100);
    window.addEventListener("resize", updateSpotlightPosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateSpotlightPosition);
    };
  }, [updateSpotlightPosition, currentStepIdx, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIdx < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
  };

  // Viewport geometry for position logic
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  const isMobile = viewportWidth < 640;
  const bubbleWidth = Math.min(420, viewportWidth - 24);
  let placement: "bottom" | "top" | "center" = "center";
  let bubbleStyle: React.CSSProperties = {};
  let arrowLeft = bubbleWidth / 2;

  if (targetRect) {
    const spaceBelow = viewportHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const targetCenterX = targetRect.left + targetRect.width / 2;

    if (isMobile) {
      if (spaceBelow >= 210) {
        placement = "bottom";
        const topPos = Math.max(12, Math.min(viewportHeight - 260, targetRect.bottom + 12));
        const leftPos = Math.max(12, Math.min(viewportWidth - bubbleWidth - 12, targetCenterX - bubbleWidth / 2));
        arrowLeft = Math.max(20, Math.min(bubbleWidth - 20, targetCenterX - leftPos));
        bubbleStyle = {
          top: `${topPos}px`,
          left: `${leftPos}px`,
          width: `${bubbleWidth}px`,
          maxHeight: "82vh"
        };
      } else if (spaceAbove >= 210) {
        placement = "top";
        const bottomPos = Math.max(12, viewportHeight - targetRect.top + 12);
        const leftPos = Math.max(12, Math.min(viewportWidth - bubbleWidth - 12, targetCenterX - bubbleWidth / 2));
        arrowLeft = Math.max(20, Math.min(bubbleWidth - 20, targetCenterX - leftPos));
        bubbleStyle = {
          bottom: `${bottomPos}px`,
          left: `${leftPos}px`,
          width: `${bubbleWidth}px`,
          maxHeight: "82vh"
        };
      } else {
        placement = "center";
        bubbleStyle = {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `${bubbleWidth}px`,
          maxHeight: "85vh"
        };
      }
    } else {
      if (spaceBelow >= 250 || spaceBelow > spaceAbove) {
        placement = "bottom";
        const topPos = Math.min(viewportHeight - 310, targetRect.bottom + 16);
        let leftPos = targetCenterX - bubbleWidth / 2;
        leftPos = Math.max(16, Math.min(viewportWidth - bubbleWidth - 16, leftPos));

        arrowLeft = Math.max(24, Math.min(bubbleWidth - 24, targetCenterX - leftPos));
        bubbleStyle = {
          top: `${topPos}px`,
          left: `${leftPos}px`,
          width: `${bubbleWidth}px`
        };
      } else if (spaceAbove >= 250) {
        placement = "top";
        const bottomPos = Math.min(viewportHeight - 16, viewportHeight - targetRect.top + 16);
        let leftPos = targetCenterX - bubbleWidth / 2;
        leftPos = Math.max(16, Math.min(viewportWidth - bubbleWidth - 16, leftPos));

        arrowLeft = Math.max(24, Math.min(bubbleWidth - 24, targetCenterX - leftPos));
        bubbleStyle = {
          bottom: `${bottomPos}px`,
          left: `${leftPos}px`,
          width: `${bubbleWidth}px`
        };
      } else {
        placement = "center";
        bubbleStyle = {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `${bubbleWidth}px`
        };
      }
    }
  } else {
    placement = "center";
    bubbleStyle = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: `${bubbleWidth}px`,
      maxHeight: "85vh"
    };
  }

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-auto overflow-hidden select-none bg-[#09090B]">
      {/* Dynamic Sandbox Replica Background UI */}
      <div className="w-full h-full overflow-y-auto p-4 sm:p-8 space-y-6 opacity-90 filter blur-[0.5px]">
        {/* Sandbox Navigation Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center font-black text-red-500">
              JLAB
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-zinc-100 tracking-tight">
                JLAB Fitness Gym
              </h1>
              <p className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Interactive Guided Tour
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${currentStep.viewType === "portal" ? "bg-red-950 border-red-600 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>
              Member Portal
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${currentStep.viewType === "dashboard" ? "bg-red-950 border-red-600 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>
              Dashboard
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${currentStep.viewType === "members" ? "bg-red-950 border-red-600 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>
              Members Roster
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${currentStep.viewType === "subscriptions" ? "bg-red-950 border-red-600 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>
              Subscriptions & Badges
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${currentStep.viewType === "retention" ? "bg-red-950 border-red-600 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>
              SMS Retention
            </span>
          </div>
        </div>

        {/* --- REPLICA VIEW 1: MEMBER PORTAL --- */}
        {currentStep.viewType === "portal" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Member Pass Card */}
            <div
              id="tutorial-portal-card"
              className="bg-[#121214] border-2 border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Active Member Pass
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Virgilio Flor E. Guaño
                  </h2>
                  <p className="text-sm font-semibold text-zinc-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" /> 09754100345
                  </p>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3 shrink-0">
                  <QrCode className="w-10 h-10 text-red-500" />
                  <div>
                    <div className="text-[10px] font-black uppercase text-zinc-500">QR Member ID</div>
                    <div className="text-xs font-black text-zinc-200">JLAB-2026-9901</div>
                  </div>
                </div>
              </div>

              {/* Student Discount Badge Container */}
              <div
                id="tutorial-portal-badges"
                className="p-4 rounded-2xl bg-zinc-900/90 border-2 border-emerald-500/60 space-y-2"
              >
                <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" /> Active Student Discount Badge
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500/80 text-emerald-300 font-extrabold text-xs flex items-center gap-1.5 shadow-md">
                    <Tag className="w-3.5 h-3.5" /> Student Badge (50% OFF)
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    Half price discount applied to all regular subscriptions
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-xs font-extrabold text-zinc-400">Active Subscription</div>
                  <div className="text-lg font-black text-white">1 Month Regular Plan</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="text-xs font-extrabold text-zinc-400">Pass Expires In</div>
                  <div className="text-lg font-black text-amber-400">28 Days Remaining</div>
                </div>
              </div>
            </div>

            {/* Operating Schedule */}
            <div
              id="tutorial-portal-schedule"
              className="bg-[#121214] border-2 border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Clock className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-black text-white">Gym Operating Hours</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="font-extrabold text-zinc-400">Monday - Friday</div>
                  <div className="font-black text-zinc-100 text-sm pt-1">6:00 AM - 10:00 PM</div>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="font-extrabold text-zinc-400">Saturday</div>
                  <div className="font-black text-zinc-100 text-sm pt-1">7:00 AM - 9:00 PM</div>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="font-extrabold text-zinc-400">Sunday</div>
                  <div className="font-black text-zinc-100 text-sm pt-1">8:00 AM - 6:00 PM</div>
                </div>
                <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-800/50 flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-extrabold text-emerald-400 text-[10px]">Status</div>
                    <div className="font-black text-emerald-200">OPEN NOW</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- REPLICA VIEW 2: ADMIN DASHBOARD --- */}
        {currentStep.viewType === "dashboard" && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Overview Stats Grid */}
            <div
              id="tutorial-metrics-grid"
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="p-6 rounded-3xl bg-[#121214] border-2 border-zinc-800 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-zinc-400">Total Members</span>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-black text-white">24</div>
                <div className="text-xs font-semibold text-emerald-400">+4 registered this week</div>
              </div>

              <div className="p-6 rounded-3xl bg-[#121214] border-2 border-zinc-800 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-zinc-400">Expiring Soon</span>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-400">3</div>
                <div className="text-xs font-semibold text-amber-300">Requires SMS renewal reminders</div>
              </div>

              <div className="p-6 rounded-3xl bg-[#121214] border-2 border-zinc-800 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-zinc-400">Monthly Revenue</span>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-black text-emerald-400">₱28,800</div>
                <div className="text-xs font-semibold text-zinc-400">Calculated from active passes</div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div
              id="tutorial-quick-actions"
              className="p-6 sm:p-8 rounded-3xl bg-[#121214] border-2 border-zinc-800 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-500" /> Quick Staff Shortcuts
                </h3>
                <span className="text-xs font-bold text-zinc-400">Fast Front Desk Operations</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/20">
                  <Plus className="w-4 h-4" /> Register New Member
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-extrabold text-sm flex items-center justify-center gap-2">
                  <Send className="w-4 h-4 text-amber-400" /> View SMS Retention Alerts
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-extrabold text-sm flex items-center justify-center gap-2">
                  <Percent className="w-4 h-4 text-blue-400" /> Manage Badges & Plans
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- REPLICA VIEW 3: MEMBERS ROSTER --- */}
        {currentStep.viewType === "members" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Members Directory</h2>
                <p className="text-xs text-zinc-400 font-semibold">Active gym members & subscription records</p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Member
              </div>
            </div>

            {/* Member Table */}
            <div
              id="tutorial-members-table"
              className="bg-[#121214] border-2 border-zinc-800 rounded-3xl overflow-hidden shadow-xl"
            >
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-black uppercase tracking-wider">
                    <th className="py-4 px-6">Member Details</th>
                    <th className="py-4 px-6">Phone Number</th>
                    <th className="py-4 px-6">Active Plan</th>
                    <th className="py-4 px-6">Status & Badges</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-zinc-200 font-medium">
                  {/* Row 1: Virgilio Flor E. Guaño */}
                  <tr className="bg-zinc-900/40">
                    <td className="py-4 px-6 font-extrabold text-white">
                      <div className="text-sm font-black text-white">Virgilio Flor E. Guaño</div>
                      <div className="text-[10px] text-zinc-400">ID: JLAB-2026-9901</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-zinc-300">
                      09754100345
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-white">1 Month Regular Plan</div>
                      <div className="text-[10px] font-bold text-emerald-400">₱600 (50% Student Off)</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-600 text-emerald-300 font-black text-[10px]">
                          Active
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-950 border border-blue-600 text-blue-300 font-black text-[10px]">
                          Student (50% Off)
                        </span>
                      </div>
                    </td>
                    {/* Action buttons target */}
                    <td id="tutorial-members-actions" className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-[11px] flex items-center gap-1">
                          <Edit3 className="w-3 h-3 text-blue-400" /> Edit
                        </button>
                        <button className="px-2.5 py-1.5 rounded-lg bg-amber-950 border border-amber-800 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" /> Strike
                        </button>
                        <button className="px-2.5 py-1.5 rounded-lg bg-red-950 border border-red-800 text-red-300 font-bold text-[11px] flex items-center gap-1">
                          <Ban className="w-3 h-3 text-red-400" /> Ban
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2: Secondary Mock Member */}
                  <tr className="bg-zinc-950/20">
                    <td className="py-4 px-6 font-extrabold text-white">
                      <div className="text-sm font-black text-zinc-200">Maria Santos</div>
                      <div className="text-[10px] text-zinc-500">ID: JLAB-2026-8812</div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 font-bold">09171234567</td>
                    <td className="py-4 px-6 text-zinc-300 font-extrabold">1 Year VIP Pass</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-600 text-emerald-300 font-black text-[10px]">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right opacity-50">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[10px] font-bold text-zinc-500">Standard Actions</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- REPLICA VIEW 4: SUBSCRIPTIONS & BADGES --- */}
        {currentStep.viewType === "subscriptions" && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Plans Grid */}
            <div className="space-y-3">
              <h3 className="text-lg font-black text-white">1. Subscription Plans</h3>
              <div
                id="tutorial-plans-grid"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="p-6 rounded-3xl bg-[#121214] border-2 border-zinc-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-red-950 border border-red-800 text-red-400 text-xs font-black uppercase">
                      Regular Plan
                    </span>
                    <span className="text-2xl font-black text-white">₱1,200</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">1 Month Unlimited Pass</h4>
                    <p className="text-xs text-zinc-400 font-semibold">Valid for 30 consecutive calendar days</p>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-[#121214] border-2 border-zinc-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-950 border border-blue-800 text-blue-400 text-xs font-black uppercase">
                      Annual VIP
                    </span>
                    <span className="text-2xl font-black text-white">₱10,000</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">1 Year Full Membership</h4>
                    <p className="text-xs text-zinc-400 font-semibold">Valid for 365 days with free locker access</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="space-y-3 pt-2">
              <h3 className="text-lg font-black text-white">2. Custom Discount Badges</h3>
              <div
                id="tutorial-badges-grid"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="p-6 rounded-3xl bg-[#121214] border-2 border-emerald-500/80 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-black">
                      Student Badge (50% OFF)
                    </span>
                    <span className="text-xs font-extrabold text-emerald-400">50% Price Reduction</span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-300">
                    Applied to students with valid school ID like Virgilio Flor E. Guaño.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-[#121214] border-2 border-zinc-800 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-purple-950 border border-purple-800 text-purple-300 text-xs font-black">
                      Senior Discount (20% OFF)
                    </span>
                    <span className="text-xs font-extrabold text-purple-400">20% Price Reduction</span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-400">
                    Applied to senior citizens aged 60 and above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- REPLICA VIEW 5: RETENTION HUB --- */}
        {currentStep.viewType === "retention" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div
              id="tutorial-retention-hub"
              className="p-6 sm:p-8 rounded-3xl bg-[#121214] border-2 border-zinc-800 space-y-6 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Send className="w-5 h-5 text-amber-400" /> Retention SMS Center
                  </h3>
                  <p className="text-xs font-semibold text-zinc-400">
                    Find members expiring within 3 days and send text renewal notices
                  </p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-md">
                  Send All Reminders (1)
                </button>
              </div>

              {/* Expiring member item */}
              <div className="p-5 rounded-2xl bg-zinc-900 border-2 border-amber-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">Virgilio Flor E. Guaño</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 text-[10px] font-extrabold">
                      Expires in 2 Days
                    </span>
                  </div>
                  <div className="text-xs font-bold text-zinc-400">Phone: 09754100345</div>
                  <p className="text-xs italic text-zinc-300 pt-1">
                    "Hi Virgilio! Your JLAB Gym pass expires on Oct 29. Visit the front desk to renew!"
                  </p>
                </div>

                <button className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-md">
                  <Send className="w-3.5 h-3.5" /> Send SMS Alert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- REPLICA VIEW 6: SETTINGS --- */}
        {currentStep.viewType === "settings" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div
              id="tutorial-settings-branding"
              className="p-6 sm:p-8 rounded-3xl bg-[#121214] border-2 border-zinc-800 space-y-6 shadow-xl"
            >
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
                <Building2 className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="text-xl font-black text-white">Gym Branding & Title</h3>
                  <p className="text-xs font-semibold text-zinc-400">Customize official gym logo and business name</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-zinc-300">Official Gym Name</label>
                  <input
                    type="text"
                    readOnly
                    value="JLAB Fitness Gym"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-extrabold text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-zinc-300">Gym Logo</label>
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center font-black text-red-500 text-lg">
                      JLAB
                    </div>
                    <div>
                      <div className="text-xs font-black text-zinc-200">jlab-logo.svg</div>
                      <div className="text-[10px] font-bold text-emerald-400">Active Official Logo</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Element Glowing Pulse Box */}
      {targetRect && (
        <div
          className="fixed border-2 border-amber-400 sm:border-blue-400 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.9)] pointer-events-none transition-all duration-300 ease-out bg-blue-500/10 animate-pulse z-[99998]"
          style={{
            top: `${Math.max(4, targetRect.top - 6)}px`,
            left: `${Math.max(4, targetRect.left - 6)}px`,
            width: `${Math.min(viewportWidth - 8, targetRect.width + 12)}px`,
            height: `${targetRect.height + 12}px`
          }}
        >
          <div className="absolute -top-3 left-3 sm:left-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-black tracking-wider text-white uppercase shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" /> Target Feature
          </div>
        </div>
      )}

      {/* Interactive Chat Bubble Box */}
      <div
        className="fixed z-[100000] bg-zinc-900/98 border-2 border-blue-500/80 rounded-2xl shadow-2xl shadow-black/95 p-4 sm:p-5 text-zinc-100 backdrop-blur-xl space-y-3.5 sm:space-y-4 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto"
        style={bubbleStyle}
      >
        {/* Pointer Arrow Caret */}
        {placement === "bottom" && (
          <div
            className="absolute -top-3 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-blue-500"
            style={{ left: `${arrowLeft - 8}px` }}
          />
        )}
        {placement === "top" && (
          <div
            className="absolute -bottom-3 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-blue-500"
            style={{ left: `${arrowLeft - 8}px` }}
          />
        )}

        {/* Bubble Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-950 border border-blue-700/80 text-blue-300 text-[11px] font-black uppercase flex items-center gap-1">
                <Compass className="w-3 h-3 text-blue-400" />
                {currentStep.category}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[11px] font-bold">
                {currentStep.targetTag}
              </span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5 pt-0.5">
              <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
              {currentStep.title}
            </h2>
          </div>

          <button
            onClick={handleSkip}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Close Tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Simple Explanations */}
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-0.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-blue-400" /> What is this?
            </div>
            <p className="text-xs font-semibold text-zinc-200 leading-snug">
              {currentStep.whatIsIt}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 space-y-0.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Why is this added?
            </div>
            <p className="text-xs font-semibold text-zinc-300 leading-snug">
              {currentStep.whyAdded}
            </p>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <div className="text-[11px] font-extrabold text-zinc-400">
            Step <span className="text-blue-400">{currentStepIdx + 1}</span> / {TUTORIAL_STEPS.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-extrabold border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1 shadow-md shadow-blue-600/30"
            >
              {currentStepIdx === TUTORIAL_STEPS.length - 1 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Done
                </>
              ) : (
                <>
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Helper function to open tutorial from anywhere */
export function startAppTutorial(stepId?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("start-app-tutorial", { detail: { stepId } })
    );
  }
}
