"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Compass,
  Zap,
  ShieldCheck,
  MessageSquare
} from "lucide-react";

export interface TutorialStep {
  id: string;
  route: string;
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
    route: "/portal",
    targetSelector: "#tutorial-portal-card",
    title: "Member Pass",
    targetTag: "Member Pass Card",
    category: "Member Portal",
    whatIsIt: "This shows your member name, plan, and when your gym pass ends.",
    whyAdded: "So members can easily check how many days they have left on their pass."
  },
  {
    id: "portal-badges",
    route: "/portal",
    targetSelector: "#tutorial-portal-badges",
    title: "Student Discount Badge",
    targetTag: "Student Badge (50% Off)",
    category: "Member Portal",
    whatIsIt: "This shows discount badges like the Student badge (50% Off).",
    whyAdded: "So students like Virgilio Flor E. Guaño get half-price discounts."
  },
  {
    id: "portal-schedule",
    route: "/portal",
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
    route: "/dashboard",
    targetSelector: "#tutorial-metrics-grid",
    title: "Gym Numbers & Income",
    targetTag: "Overview Stats",
    category: "Admin Core",
    whatIsIt: "This shows total members, expiring passes, and monthly gym income.",
    whyAdded: "Helps gym owners see how well the gym is doing every day."
  },
  {
    id: "dashboard-actions",
    route: "/dashboard",
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
    route: "/members",
    targetSelector: "#tutorial-members-table",
    title: "Member Roster",
    targetTag: "All Members List",
    category: "Admin Core",
    whatIsIt: "List of all registered gym members, like student member Virgilio Flor E. Guaño.",
    whyAdded: "Keeps all member phone numbers, plans, and badges saved in one place."
  },
  {
    id: "members-actions",
    route: "/members",
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
    route: "/subscriptions",
    targetSelector: "#tutorial-plans-grid",
    title: "Pass Prices & Plans",
    targetTag: "1 Month (1200 PHP)",
    category: "Operations",
    whatIsIt: "Sets pass prices and duration, like 1 Month for 1200 Pesos.",
    whyAdded: "Allows gym owners to set custom plan costs and validity days."
  },
  {
    id: "subscriptions-badges",
    route: "/subscriptions",
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
    route: "/retention",
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
    route: "/settings",
    targetSelector: "#tutorial-settings-branding",
    title: "Gym Name & Logo",
    targetTag: "Brand Settings",
    category: "Operations",
    whatIsIt: "Change your gym logo image and gym name here.",
    whyAdded: "Customizes the web app with your gym's official logo and name."
  }
];

export function AppTutorial() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = TUTORIAL_STEPS[currentStepIdx] || TUTORIAL_STEPS[0];

  // Global listener to trigger tutorial
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

  // Update spotlight & element bounds
  const updateSpotlightPosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    if (pathname !== currentStep.route) {
      router.push(currentStep.route);
      return;
    }

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
    const timer = setTimeout(updateSpotlightPosition, 250);
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

  // Compute Bubble Position & Arrow Pointer Offset
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  const bubbleWidth = Math.min(420, viewportWidth - 32);
  let placement: "bottom" | "top" | "center" = "center";
  let bubbleStyle: React.CSSProperties = {};
  let arrowLeft = bubbleWidth / 2;

  if (targetRect) {
    const spaceBelow = viewportHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const targetCenterX = targetRect.left + targetRect.width / 2;

    if (spaceBelow >= 260 || spaceBelow > spaceAbove) {
      placement = "bottom";
      const topPos = Math.min(viewportHeight - 320, targetRect.bottom + 16);
      let leftPos = targetCenterX - bubbleWidth / 2;
      leftPos = Math.max(16, Math.min(viewportWidth - bubbleWidth - 16, leftPos));

      arrowLeft = Math.max(24, Math.min(bubbleWidth - 24, targetCenterX - leftPos));
      bubbleStyle = {
        top: `${topPos}px`,
        left: `${leftPos}px`,
        width: `${bubbleWidth}px`
      };
    } else if (spaceAbove >= 260) {
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
  } else {
    placement = "center";
    bubbleStyle = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: `${bubbleWidth}px`
    };
  }

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-auto overflow-hidden select-none">
      {/* Dark Blurred Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-all duration-300" />

      {/* Target Element Glowing Pulse Box */}
      {targetRect && (
        <div
          className="absolute border-2 border-amber-400 sm:border-blue-400 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.9)] pointer-events-none transition-all duration-300 ease-out bg-blue-500/10 animate-pulse"
          style={{
            top: `${Math.max(8, targetRect.top - 6)}px`,
            left: `${Math.max(8, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`
          }}
        >
          <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-black tracking-wider text-white uppercase shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" /> Target Feature
          </div>
        </div>
      )}

      {/* Chat Bubble Box */}
      <div
        className="fixed z-20 bg-zinc-900/98 border-2 border-blue-500/80 rounded-2xl shadow-2xl shadow-black/95 p-5 text-zinc-100 backdrop-blur-xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
        style={bubbleStyle}
      >
        {/* Chat Bubble Arrow Pointer */}
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

        {/* Super Simple Explanations */}
        <div className="space-y-2.5">
          {/* What is this? */}
          <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-0.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-blue-400" /> What is this?
            </div>
            <p className="text-xs font-semibold text-zinc-200 leading-snug">
              {currentStep.whatIsIt}
            </p>
          </div>

          {/* Why was it added? */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 space-y-0.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Why is this added?
            </div>
            <p className="text-xs font-semibold text-zinc-300 leading-snug">
              {currentStep.whyAdded}
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
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
