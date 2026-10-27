"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Compass,
  Play,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  Zap,
  Tag,
  Calendar,
  Layers,
  Settings as SettingsIcon,
  Bot
} from "lucide-react";

export interface TutorialStep {
  id: string;
  route: string;
  targetSelector: string; // CSS selector or data-attribute
  title: string;
  targetTag: string;
  category: "Landing & Portal" | "Admin Core" | "Operations";
  whatIsIt: string;
  whyAdded: string;
  tip?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // --- LANDING PAGE STEPS ---
  {
    id: "landing-header",
    route: "/",
    targetSelector: "#tutorial-landing-header",
    title: "JLAB Gym Gateway & Branding",
    targetTag: "Landing Page Header",
    category: "Landing & Portal",
    whatIsIt: "The welcoming header showing the official JLAB Fitness Gym logo and title.",
    whyAdded: "Establishes instant white-label brand trust and identity for members and staff entering the system."
  },
  {
    id: "member-lookup",
    route: "/",
    targetSelector: "#tutorial-member-lookup",
    title: "Instant Member Access",
    targetTag: "Member Phone Lookup",
    category: "Landing & Portal",
    whatIsIt: "A quick phone search form for members to check their subscription and status.",
    whyAdded: "Allows gym members to verify their active plan, expiration date, and student discounts without needing a login password."
  },
  {
    id: "admin-login-btn",
    route: "/",
    targetSelector: "#tutorial-admin-btn",
    title: "Staff & Admin Access",
    targetTag: "Admin Access Toggle",
    category: "Landing & Portal",
    whatIsIt: "A secure login portal button reserved for gym owners and desk administrators.",
    whyAdded: "Keeps public member checks separate from administrative management, financial records, and member editing tools."
  },

  // --- MEMBER PORTAL STEPS ---
  {
    id: "portal-card",
    route: "/portal",
    targetSelector: "#tutorial-portal-card",
    title: "Digital Member Pass",
    targetTag: "Member Status Overview",
    category: "Landing & Portal",
    whatIsIt: "Displays active membership details for members like Virgilio Flor E. Guaño.",
    whyAdded: "Provides members real-time proof of membership, exact expiration countdown, and subscription status (Active, Expiring, or Overdue)."
  },
  {
    id: "portal-badges",
    route: "/portal",
    targetSelector: "#tutorial-portal-badges",
    title: "Badges & Discount Verification",
    targetTag: "Student Badge & Promo",
    category: "Landing & Portal",
    whatIsIt: "Highlights verified tags like the Student badge with custom discount percentages (50% Off).",
    whyAdded: "Automatically applies discount promos during check-in/renewal while showing members their applied discount perks transparently."
  },
  {
    id: "portal-schedule",
    route: "/portal",
    targetSelector: "#tutorial-portal-schedule",
    title: "Live Gym Operating Hours",
    targetTag: "Live Open/Closed Status",
    category: "Landing & Portal",
    whatIsIt: "Shows live operating hours, holiday closures, and real-time open/closed gym status.",
    whyAdded: "Prevents unnecessary trips by informing members when the gym is open or closed for maintenance/holidays."
  },

  // --- ADMIN DASHBOARD STEPS ---
  {
    id: "dashboard-metrics",
    route: "/dashboard",
    targetSelector: "#tutorial-metrics-grid",
    title: "Gym Health & Metrics",
    targetTag: "Dashboard Metrics Cards",
    category: "Admin Core",
    whatIsIt: "At-a-glance stat cards displaying total active members, expiring counts, monthly revenue, and active alerts.",
    whyAdded: "Gives gym management an instant financial and operational overview every morning without digging through reports."
  },
  {
    id: "dashboard-actions",
    route: "/dashboard",
    targetSelector: "#tutorial-quick-actions",
    title: "Quick Operation Hub",
    targetTag: "Quick Action Shortcuts",
    category: "Admin Core",
    whatIsIt: "One-click shortcut buttons to register members, modify plans, or run AI retention.",
    whyAdded: "Accelerates daily front-desk operations so staff can register new walk-in members in under 10 seconds."
  },

  // --- MEMBER MANAGEMENT STEPS ---
  {
    id: "members-list",
    route: "/members",
    targetSelector: "#tutorial-members-table",
    title: "Member Directory & Roster",
    targetTag: "Member Records & Badges",
    category: "Admin Core",
    whatIsIt: "Central database of all gym members including permanent student member Virgilio Flor E. Guaño.",
    whyAdded: "Tracks member phone numbers, assigned subscription plans, custom discount badges, and warning histories in real time."
  },
  {
    id: "members-actions",
    route: "/members",
    targetSelector: "#tutorial-members-actions",
    title: "Member Control & Compliance",
    targetTag: "Edit, Warn & Ban Tools",
    category: "Admin Core",
    whatIsIt: "Tools to update subscriptions, issue warning strikes, or ban policy violators.",
    whyAdded: "Maintains gym discipline and accurate billing by allowing staff to record rule violations or extend plans easily."
  },

  // --- SUBSCRIPTIONS STEPS ---
  {
    id: "subscriptions-plans",
    route: "/subscriptions",
    targetSelector: "#tutorial-plans-grid",
    title: "Subscription Tier Builder",
    targetTag: "1 Month (1200 PHP) Plan",
    category: "Operations",
    whatIsIt: "Management dashboard for subscription duration and pricing (e.g., 1 Month @ 1200 Pesos).",
    whyAdded: "Allows owners to create custom pricing tiers, promotional packages, and regular monthly/daily passes."
  },
  {
    id: "subscriptions-badges",
    route: "/subscriptions",
    targetSelector: "#tutorial-badges-grid",
    title: "Custom Badge & Discount Engine",
    targetTag: "Custom Badge Discounts",
    category: "Operations",
    whatIsIt: "Create reusable badges (e.g., Student 50%, Senior, VIP) linked to automatic discounts.",
    whyAdded: "Eliminates manual pricing math for desk staff by auto-calculating discounted fees upon member enrollment."
  },

  // --- RETENTION STEPS ---
  {
    id: "retention-hub",
    route: "/retention",
    targetSelector: "#tutorial-retention-hub",
    title: "AI Member Retention Engine",
    targetTag: "Smart Renewal Reminders",
    category: "Operations",
    whatIsIt: "Automated AI tool that detects expiring members (0-3 days) and lapsed members (-1 to -3 days).",
    whyAdded: "Prevents membership drop-offs by generating targeted SMS/WhatsApp renewal messages to keep gym revenue steady."
  },

  // --- SETTINGS STEPS ---
  {
    id: "settings-branding",
    route: "/settings",
    targetSelector: "#tutorial-settings-branding",
    title: "White-Label Gym Customization",
    targetTag: "Logo & Theme Settings",
    category: "Operations",
    whatIsIt: "Upload custom gym logos, update gym name, and set brand colors.",
    whyAdded: "Ensures the system matches your gym's physical brand identity seamlessly."
  }
];

export function AppTutorial() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = TUTORIAL_STEPS[currentStepIdx] || TUTORIAL_STEPS[0];

  // Global listener to trigger tutorial from anywhere
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

  // Update position & navigate if route changes
  const updateSpotlightPosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    // Check if we need to navigate first
    if (pathname !== currentStep.route) {
      router.push(currentStep.route);
      return;
    }

    // Locate element on DOM
    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep, pathname, router]);

  useEffect(() => {
    updateSpotlightPosition();
    const timer = setTimeout(updateSpotlightPosition, 300);
    window.addEventListener("resize", updateSpotlightPosition);
    window.addEventListener("scroll", updateSpotlightPosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateSpotlightPosition);
      window.removeEventListener("scroll", updateSpotlightPosition);
    };
  }, [updateSpotlightPosition, currentStepIdx, pathname]);

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

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-auto overflow-hidden">
      {/* Dark Blurred Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md transition-all duration-300" />

      {/* Target Element Spotlight Highlight */}
      {targetRect && (
        <div
          className="absolute border-2 border-blue-500/90 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.75)] pointer-events-none transition-all duration-300 ease-out bg-blue-500/10 animate-pulse"
          style={{
            top: `${Math.max(10, targetRect.top - 8)}px`,
            left: `${Math.max(10, targetRect.left - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
        >
          <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-black tracking-widest text-white uppercase shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" /> Highlighted Feature
          </div>
        </div>
      )}

      {/* Tutorial Explanation Card Box */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl bg-zinc-900/95 border-2 border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/90 p-6 sm:p-8 backdrop-blur-xl relative space-y-6 text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Header & Progress */}
          <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-700/60 text-blue-300 text-xs font-black uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  {currentStep.category}
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-xs font-extrabold">
                  {currentStep.targetTag}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 pt-1">
                {currentStep.title}
              </h2>
            </div>

            <button
              onClick={handleSkip}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition border border-transparent hover:border-zinc-700"
              title="Close Tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Simple Direct Explanation Cards */}
          <div className="space-y-4">
            {/* What is it */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-400" /> What is this?
              </div>
              <p className="text-sm font-medium text-zinc-200 leading-relaxed">
                {currentStep.whatIsIt}
              </p>
            </div>

            {/* Why it was added */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Why is this added as a feature?
              </div>
              <p className="text-sm font-medium text-zinc-300 leading-relaxed">
                {currentStep.whyAdded}
              </p>
            </div>
          </div>

          {/* Bottom Bar: Steps Indicator & Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-zinc-800">
            {/* Step Counter */}
            <div className="flex items-center gap-3">
              <div className="text-xs font-bold text-zinc-400">
                Step <span className="text-blue-400 font-extrabold">{currentStepIdx + 1}</span> of{" "}
                <span className="text-zinc-200">{TUTORIAL_STEPS.length}</span>
              </div>
              {/* Progress Bar */}
              <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentStepIdx + 1) / TUTORIAL_STEPS.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
              >
                {currentStepIdx === TUTORIAL_STEPS.length - 1 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Finish Tour
                  </>
                ) : (
                  <>
                    Next Step <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
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
