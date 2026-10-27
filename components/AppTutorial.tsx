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
  Calendar,
  TrendingUp,
  Plus,
  Edit3,
  AlertTriangle,
  Ban,
  Percent,
  Award,
  Search,
  Building2,
  Clock,
  Check,
  Phone,
  Tag,
  DollarSign,
  ArrowUpRight,
  ShieldAlert,
  Megaphone
} from "lucide-react";

export interface TutorialStep {
  id: string;
  viewType: "portal" | "dashboard" | "members" | "subscriptions" | "settings";
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
    whatIsIt: "This shows your member name, phone number, plan status, and expiry countdown.",
    whyAdded: "So members like Virgilio Flor E. Guaño can easily check their remaining pass days."
  },
  {
    id: "portal-badges",
    viewType: "portal",
    targetSelector: "#tutorial-portal-badges",
    title: "Student Discount Badge",
    targetTag: "Student Badge (50% Off)",
    category: "Member Portal",
    whatIsIt: "This displays discount badges assigned to your account, like Student (50% Off).",
    whyAdded: "So eligible students get 50% discount applied to regular rates."
  },
  {
    id: "portal-schedule",
    viewType: "portal",
    targetSelector: "#tutorial-portal-schedule",
    title: "Gym Operating Hours",
    targetTag: "Live Schedule",
    category: "Member Portal",
    whatIsIt: "This displays gym opening/closing hours and scheduled holiday closures.",
    whyAdded: "So members can verify live opening hours before visiting the gym."
  },

  // --- ADMIN DASHBOARD STEPS ---
  {
    id: "dashboard-metrics",
    viewType: "dashboard",
    targetSelector: "#tutorial-metrics-grid",
    title: "Gym Metrics & Revenue",
    targetTag: "Overview Stats",
    category: "Admin Core",
    whatIsIt: "Shows active member count, estimated monthly income, annual projection, and expiring passes.",
    whyAdded: "Helps gym owners monitor financial revenue and active membership growth."
  },
  {
    id: "dashboard-actions",
    viewType: "dashboard",
    targetSelector: "#tutorial-quick-actions",
    title: "Expiring Member Follow-up",
    targetTag: "Pass Expiration Alert",
    category: "Admin Core",
    whatIsIt: "Highlights members expiring within 7 days requiring renewal follow-up.",
    whyAdded: "Allows front desk staff to quickly identify members who need to renew their pass."
  },

  // --- MEMBER MANAGEMENT STEPS ---
  {
    id: "members-list",
    viewType: "members",
    targetSelector: "#tutorial-members-table",
    title: "Member Directory",
    targetTag: "All Members List",
    category: "Admin Core",
    whatIsIt: "Complete list of registered members with contact info, assigned plans, and badges.",
    whyAdded: "Keeps member contact numbers, subscription plans, and student discounts organized."
  },
  {
    id: "members-actions",
    viewType: "members",
    targetSelector: "#tutorial-members-actions",
    title: "Member Control Actions",
    targetTag: "Edit, Strike & Ban",
    category: "Admin Core",
    whatIsIt: "Action buttons to edit member details, issue warning strikes, or restrict accounts.",
    whyAdded: "Helps staff maintain gym discipline, update contact info, or handle violations."
  },

  // --- SUBSCRIPTIONS STEPS ---
  {
    id: "subscriptions-plans",
    viewType: "subscriptions",
    targetSelector: "#tutorial-plans-grid",
    title: "Pass Rates & Plans",
    targetTag: "Plans & Pricing",
    category: "Operations",
    whatIsIt: "Configures subscription costs and validity duration, like 1 Month (₱1,200).",
    whyAdded: "Enables gym management to set custom rates for monthly or annual passes."
  },
  {
    id: "subscriptions-badges",
    viewType: "subscriptions",
    targetSelector: "#tutorial-badges-grid",
    title: "Custom Discount Badges",
    targetTag: "Discount Tags",
    category: "Operations",
    whatIsIt: "Creates discount tags like Student (50% Off) or Senior Discount.",
    whyAdded: "Automates price deductions whenever special badges are assigned to members."
  },

  // --- SETTINGS STEPS ---
  {
    id: "settings-branding",
    viewType: "settings",
    targetSelector: "#tutorial-settings-branding",
    title: "Gym Branding & Title",
    targetTag: "Brand Customization",
    category: "Operations",
    whatIsIt: "Customizes your official gym name and uploads custom logo graphics.",
    whyAdded: "Ensures the web app reflects your exact gym business branding and logo."
  }
];

export function AppTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
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
      <div ref={containerRef} className="w-full h-full overflow-y-auto p-4 sm:p-8 space-y-6 opacity-95">
        {/* Sandbox Navigation Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-zinc-800 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-zinc-950 border-2 border-zinc-700 flex items-center justify-center font-black text-red-500 text-sm overflow-hidden shadow-md">
              <span className="text-red-500 font-extrabold">JLAB</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-zinc-100 tracking-tight">
                JLAB Fitness Gym
              </h1>
              <p className="text-xs text-zinc-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Interactive Guided Tour
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition ${
                currentStep.viewType === "portal"
                  ? "bg-red-600 border-red-500 text-white shadow-md"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400"
              }`}
            >
              Member Portal
            </span>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition ${
                currentStep.viewType === "dashboard"
                  ? "bg-red-600 border-red-500 text-white shadow-md"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400"
              }`}
            >
              Dashboard
            </span>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition ${
                currentStep.viewType === "members"
                  ? "bg-red-600 border-red-500 text-white shadow-md"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400"
              }`}
            >
              Members Roster
            </span>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition ${
                currentStep.viewType === "subscriptions"
                  ? "bg-red-600 border-red-500 text-white shadow-md"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400"
              }`}
            >
              Subscriptions & Badges
            </span>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 transition ${
                currentStep.viewType === "settings"
                  ? "bg-red-600 border-red-500 text-white shadow-md"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400"
              }`}
            >
              Customization
            </span>
          </div>
        </div>

        {/* --- REPLICA VIEW 1: MEMBER PORTAL --- */}
        {currentStep.viewType === "portal" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Gym Status Banner */}
            <div className="p-4 sm:p-5 rounded-xl border-2 bg-emerald-950/90 border-emerald-700/80 text-emerald-100 flex items-center justify-between shadow-soft">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h2 className="text-base sm:text-lg font-black text-zinc-100 leading-tight flex items-center gap-2">
                    <span>Gym is OPEN NOW</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </h2>
                  <p className="text-xs font-extrabold text-zinc-200 mt-0.5 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Welcome to JLAB Fitness Gym Member Portal</span>
                  </p>
                </div>
              </div>
              <div className="hidden sm:block text-xs font-extrabold text-zinc-300 bg-zinc-900/80 px-3.5 py-1.5 rounded-lg border border-zinc-700">
                Welcome, <span className="text-zinc-100 font-black">Virgilio Flor E. Guaño</span>
              </div>
            </div>

            {/* Member Pass Card */}
            <div
              id="tutorial-portal-card"
              className="bg-[#121318] p-5 sm:p-7 rounded-xl border-2 border-zinc-700/80 shadow-soft space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-zinc-950 border-2 border-zinc-700 flex items-center justify-center font-black text-xl text-zinc-200 shadow-xs">
                    V
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-100">
                      Virgilio Flor E. Guaño
                    </h2>
                    <p className="text-xs font-extrabold text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" /> 09754100345
                    </p>
                  </div>
                </div>

                <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-950/80 text-emerald-300 font-extrabold text-xs border border-emerald-700 uppercase tracking-wider inline-flex items-center gap-1 shadow-xs self-start sm:self-auto">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Active Pass
                </span>
              </div>

              {/* Plan Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-zinc-950 p-4 rounded-lg border-2 border-zinc-800 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-zinc-500 block">
                    Membership Plan
                  </span>
                  <p className="text-base font-black text-zinc-100">1 Month Regular Plan</p>
                </div>

                <div className="bg-zinc-950 p-4 rounded-lg border-2 border-zinc-800 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-zinc-500 block">
                    Start Date
                  </span>
                  <p className="text-sm font-extrabold text-zinc-300">Oct 01, 2026</p>
                </div>

                <div className="bg-zinc-950 p-4 rounded-lg border-2 border-zinc-800 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-zinc-500 block">
                    Expiration Date
                  </span>
                  <p className="text-sm font-extrabold text-zinc-300">Oct 31, 2026</p>
                </div>
              </div>

              {/* Countdown Banner */}
              <div className="p-4 rounded-lg border-2 border-red-500/60 flex items-center justify-between gap-3 text-white shadow-soft bg-red-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-extrabold uppercase">Plan Countdown</span>
                </div>
                <span className="text-sm sm:text-base font-black bg-black/40 px-3 py-1.5 rounded-lg border border-white/30">
                  4 Days Remaining
                </span>
              </div>

              {/* Student Discount Badge Container */}
              <div
                id="tutorial-portal-badges"
                className="space-y-3 pt-2 p-3 bg-zinc-950 rounded-xl border-2 border-emerald-500/80 shadow-md"
              >
                <span className="text-xs font-extrabold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" /> Assigned Member Badges
                </span>

                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 rounded-lg font-extrabold text-xs border border-emerald-500 bg-emerald-950/90 text-emerald-300 flex items-center gap-1.5 shadow-xs">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Student Badge (50% OFF)</span>
                    <span className="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded-md border border-red-700">
                      50% OFF
                    </span>
                  </div>
                </div>
              </div>

              {/* Disciplinary Standing */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-extrabold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Disciplinary Standing
                </span>
                <div className="p-3.5 bg-emerald-950/80 rounded-lg border-2 border-emerald-700/80 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-extrabold text-xs text-emerald-200">
                      Good Standing (0 warnings)
                    </p>
                    <p className="text-[11px] font-semibold text-zinc-400">
                      Thank you for adhering to all gym etiquette and rules!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Schedule */}
            <div
              id="tutorial-portal-schedule"
              className="bg-[#121318] p-5 sm:p-7 rounded-xl border-2 border-zinc-700/80 shadow-soft space-y-4"
            >
              <h2 className="text-lg font-black text-zinc-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" /> Operating Schedule & Holiday Closures
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-950 border-2 border-zinc-700 space-y-1">
                  <span className="block font-black text-zinc-300">Mon</span>
                  <span className="block text-[10px] font-extrabold text-emerald-400">6:00 AM - 10:00 PM</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border-2 border-zinc-700 space-y-1">
                  <span className="block font-black text-zinc-300">Tue</span>
                  <span className="block text-[10px] font-extrabold text-emerald-400">6:00 AM - 10:00 PM</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border-2 border-zinc-700 space-y-1">
                  <span className="block font-black text-zinc-300">Wed</span>
                  <span className="block text-[10px] font-extrabold text-emerald-400">6:00 AM - 10:00 PM</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border-2 border-zinc-700 space-y-1">
                  <span className="block font-black text-zinc-300">Thu</span>
                  <span className="block text-[10px] font-extrabold text-emerald-400">6:00 AM - 10:00 PM</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border-2 border-zinc-700 space-y-1">
                  <span className="block font-black text-zinc-300">Fri</span>
                  <span className="block text-[10px] font-extrabold text-emerald-400">6:00 AM - 10:00 PM</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border-2 border-zinc-700 space-y-1">
                  <span className="block font-black text-zinc-300">Sat</span>
                  <span className="block text-[10px] font-extrabold text-emerald-400">7:00 AM - 9:00 PM</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950 border-2 border-zinc-700 space-y-1">
                  <span className="block font-black text-zinc-300">Sun</span>
                  <span className="block text-[10px] font-extrabold text-emerald-400">8:00 AM - 6:00 PM</span>
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="p-5 rounded-2xl bg-[#121214] text-zinc-100 shadow-md border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-400">Active Members</span>
                  <div className="p-3 rounded-2xl bg-zinc-800 text-red-500 border border-zinc-700">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100">24</div>
                <p className="text-xs font-medium text-zinc-400">vs last month</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#121214] text-zinc-100 shadow-md border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-400">Est. Monthly Income</span>
                  <div className="p-3 rounded-2xl bg-zinc-800 text-emerald-400 border border-zinc-700">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100">₱28,800</div>
                <p className="text-xs font-medium text-zinc-400">vs last month</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#121214] text-zinc-100 shadow-md border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-400">Projected Annual</span>
                  <div className="p-3 rounded-2xl bg-zinc-800 text-purple-400 border border-zinc-700">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100">₱345,600</div>
                <p className="text-xs font-medium text-zinc-400">12-month projection</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#121214] text-zinc-100 shadow-md border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-400">Expiring This Week</span>
                  <div className="p-3 rounded-2xl bg-zinc-800 text-amber-400 border border-zinc-700">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">3</span>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-2xl border bg-amber-950/80 text-amber-300 border-amber-700">
                    Needs attention
                  </span>
                </div>
                <p className="text-xs font-medium text-zinc-400">Requires renewal follow-up</p>
              </div>
            </div>

            {/* Expiring Follow-up Card */}
            <div
              id="tutorial-quick-actions"
              className="p-6 rounded-2xl bg-[#121214] border-2 border-zinc-800 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-amber-950/80 text-amber-300 text-xs font-extrabold border border-amber-700">
                  <Clock className="w-3.5 h-3.5" /> Needs Renewal Follow-up
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-2xl bg-zinc-800 text-zinc-200 border border-zinc-700">
                  3 Members
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-zinc-100">Expiring Soon (Within 7 Days)</h3>
                <p className="text-xs font-medium text-zinc-400 mt-1">
                  Follow up with members who are expiring soon or already expired.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-700 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-sm text-amber-200">Virgilio Flor E. Guaño</p>
                  <p className="text-xs font-medium text-amber-300 mt-0.5">Expires in 4 days (Phone: 09754100345)</p>
                </div>
                <button className="px-3 py-1.5 bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1">
                  View Pass <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- REPLICA VIEW 3: MEMBERS ROSTER --- */}
        {currentStep.viewType === "members" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Members Directory</h2>
                <p className="text-xs text-zinc-400 font-semibold">Registered gym members & subscription records</p>
              </div>

              <div className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shrink-0">
                <Plus className="w-4 h-4" /> Add Member
              </div>
            </div>

            {/* Search & Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  placeholder="Search by name or phone..."
                  value="Virgilio"
                  className="w-full px-4 py-2.5 pl-10 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-bold"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
                <span className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white font-black">All</span>
                <span className="px-3 py-1.5 rounded-lg text-zinc-400">Active</span>
                <span className="px-3 py-1.5 rounded-lg text-zinc-400">Expiring</span>
                <span className="px-3 py-1.5 rounded-lg text-zinc-400">Banned</span>
              </div>
            </div>

            {/* Member Table */}
            <div
              id="tutorial-members-table"
              className="bg-[#121214] border-2 border-zinc-800 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-950 border-b-2 border-zinc-800 text-zinc-400 font-extrabold uppercase tracking-wider">
                      <th className="py-3.5 px-5">Member Details</th>
                      <th className="py-3.5 px-5">Phone Number</th>
                      <th className="py-3.5 px-5">Active Plan</th>
                      <th className="py-3.5 px-5">Status & Badges</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-200 font-medium">
                    {/* Row 1: Virgilio Flor E. Guaño */}
                    <tr className="bg-zinc-900/40">
                      <td className="py-4 px-5 font-extrabold text-white">
                        <div className="text-sm font-black text-white">Virgilio Flor E. Guaño</div>
                        <div className="text-[10px] text-zinc-400">Joined: Oct 01, 2026</div>
                      </td>
                      <td className="py-4 px-5 font-bold text-zinc-300">
                        09754100345
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-white">1 Month Regular Plan</div>
                        <div className="text-[10px] font-bold text-emerald-400">₱600 (50% Student Off)</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-600 text-emerald-300 font-black text-[10px]">
                            Active
                          </span>
                          <span className="px-2.5 py-1 rounded-md bg-red-950 border border-red-600 text-red-300 font-black text-[10px]">
                            Student (50% Off)
                          </span>
                        </div>
                      </td>
                      {/* Action buttons target */}
                      <td id="tutorial-members-actions" className="py-4 px-5 text-right">
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
                      <td className="py-4 px-5 font-extrabold text-white">
                        <div className="text-sm font-black text-zinc-200">Maria Santos</div>
                        <div className="text-[10px] text-zinc-500">Joined: Sep 15, 2026</div>
                      </td>
                      <td className="py-4 px-5 text-zinc-400 font-bold">09171234567</td>
                      <td className="py-4 px-5 text-zinc-300 font-extrabold">1 Year VIP Pass</td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-600 text-emerald-300 font-black text-[10px]">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right opacity-50">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[10px] font-bold text-zinc-500">Standard Actions</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
                <div className="p-6 rounded-2xl bg-[#121214] border-2 border-zinc-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-red-950 border border-red-800 text-red-400 text-xs font-black uppercase">
                      Regular Plan
                    </span>
                    <span className="text-2xl font-black text-white">₱1,200</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">1 Month Regular Plan</h4>
                    <p className="text-xs text-zinc-400 font-semibold">Valid for 30 consecutive calendar days</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#121214] border-2 border-zinc-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-950 border border-blue-800 text-blue-400 text-xs font-black uppercase">
                      Annual VIP
                    </span>
                    <span className="text-2xl font-black text-white">₱10,000</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">1 Year Full Pass</h4>
                    <p className="text-xs text-zinc-400 font-semibold">Valid for 365 days with full access</p>
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
                <div className="p-6 rounded-2xl bg-[#121214] border-2 border-emerald-500/80 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-black">
                      Student Badge (50% OFF)
                    </span>
                    <span className="text-xs font-extrabold text-emerald-400">50% Price Reduction</span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-300">
                    Applied to students with valid student ID like Virgilio Flor E. Guaño.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#121214] border-2 border-zinc-800 space-y-2 shadow-xl">
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

        {/* --- REPLICA VIEW 5: CUSTOMIZATION / SETTINGS --- */}
        {currentStep.viewType === "settings" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div
              id="tutorial-settings-branding"
              className="p-6 sm:p-8 rounded-2xl bg-[#121214] border-2 border-zinc-800 space-y-6 shadow-xl"
            >
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
                <Building2 className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="text-xl font-black text-white">Gym Branding & Customization</h3>
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
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-extrabold text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-zinc-300">Gym Logo Graphic</label>
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-black text-red-500 text-lg">
                      JLAB
                    </div>
                    <div>
                      <div className="text-xs font-black text-zinc-200">jlab-logo.svg</div>
                      <div className="text-[10px] font-bold text-emerald-400">Active Official Graphic</div>
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
          className="fixed border-2 border-blue-400 rounded-2xl shadow-[0_0_35px_rgba(59,130,246,0.85)] pointer-events-none transition-all duration-300 ease-out bg-blue-500/10 animate-pulse z-[99998]"
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
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
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
              className="px-3 py-1.5 rounded-lg text-xs font-extrabold border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1 shadow-md shadow-blue-600/30 cursor-pointer"
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
