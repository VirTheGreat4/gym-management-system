"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
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

export const ADMIN_STEPS: TutorialStep[] = [
  {
    id: "dashboard-metrics",
    viewType: "dashboard",
    targetSelector: "#tutorial-metrics-grid",
    title: "Gym Metrics & Revenue",
    targetTag: "Overview Stats",
    category: "Admin Core",
    whatIsIt: "Shows active member count, estimated monthly income, annual projection, and expiring passes.",
    whyAdded: "Helps gym owners monitor financial revenue and active membership growth.",
  },
  {
    id: "dashboard-actions",
    viewType: "dashboard",
    targetSelector: "#tutorial-quick-actions",
    title: "Expiring Member Follow-up",
    targetTag: "Pass Expiration Alert",
    category: "Admin Core",
    whatIsIt: "Highlights members expiring within 7 days requiring renewal follow-up.",
    whyAdded: "Allows front desk staff to quickly identify members who need to renew their pass.",
  },
  {
    id: "members-list",
    viewType: "members",
    targetSelector: "#tutorial-members-table",
    title: "Member Directory",
    targetTag: "All Members List",
    category: "Admin Core",
    whatIsIt: "Complete list of registered members with contact info, assigned plans, and badges.",
    whyAdded: "Keeps member contact numbers, subscription plans, and student discounts organized.",
  },
  {
    id: "members-actions",
    viewType: "members",
    targetSelector: "#tutorial-members-actions",
    title: "Member Control Actions",
    targetTag: "Edit, Strike & Ban",
    category: "Admin Core",
    whatIsIt: "Action buttons to edit member details, issue warning strikes, or restrict accounts.",
    whyAdded: "Helps staff maintain gym discipline, update contact info, or handle violations.",
  },
  {
    id: "subscriptions-plans",
    viewType: "subscriptions",
    targetSelector: "#tutorial-plans-grid",
    title: "Pass Rates & Plans",
    targetTag: "Plans & Pricing",
    category: "Operations",
    whatIsIt: "Configures subscription costs and validity duration, like 1 Month (₱1,200).",
    whyAdded: "Enables gym management to set custom rates for monthly or annual passes.",
  },
  {
    id: "subscriptions-badges",
    viewType: "subscriptions",
    targetSelector: "#tutorial-badges-grid",
    title: "Custom Discount Badges",
    targetTag: "Discount Tags",
    category: "Operations",
    whatIsIt: "Creates discount tags like Student (50% Off) or Senior Discount.",
    whyAdded: "Automates price deductions whenever special badges are assigned to members.",
  },
  {
    id: "settings-branding",
    viewType: "settings",
    targetSelector: "#tutorial-settings-branding",
    title: "Gym Branding & Title",
    targetTag: "Brand Customization",
    category: "Operations",
    whatIsIt: "Customizes your official gym name and uploads custom logo graphics.",
    whyAdded: "Ensures the web app reflects your exact gym business branding and logo.",
  },
];

export const MEMBER_STEPS: TutorialStep[] = [
  {
    id: "portal-card",
    viewType: "portal",
    targetSelector: "#tutorial-portal-card",
    title: "Member Pass",
    targetTag: "Member Pass Card",
    category: "Member Portal",
    whatIsIt: "This shows your member name, phone number, plan status, and expiry countdown.",
    whyAdded: "So members like Virgilio Flor E. Guaño can easily check their remaining pass days.",
  },
  {
    id: "portal-badges",
    viewType: "portal",
    targetSelector: "#tutorial-portal-badges",
    title: "Student Discount Badge",
    targetTag: "Student Badge (50% Off)",
    category: "Member Portal",
    whatIsIt: "This displays discount badges assigned to your account, like Student (50% Off).",
    whyAdded: "So eligible students get 50% discount applied to regular rates.",
  },
  {
    id: "portal-schedule",
    viewType: "portal",
    targetSelector: "#tutorial-portal-schedule",
    title: "Gym Operating Hours",
    targetTag: "Live Schedule",
    category: "Member Portal",
    whatIsIt: "This displays gym opening/closing hours and scheduled holiday closures.",
    whyAdded: "So members can verify live opening hours before visiting the gym.",
  },
];

const VIEW_ROUTES: Record<string, string> = {
  dashboard: "/dashboard",
  members: "/members",
  subscriptions: "/subscriptions",
  settings: "/settings",
  portal: "/portal",
};

export const TUTORIAL_STORAGE_KEY = "gym_tutorial_active_state";

interface PopoverPos {
  highlightRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  placement: "top" | "bottom" | "center";
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
  pointerLeft: number;
}

export function AppTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [tutorialPhase, setTutorialPhase] = useState<
    "idle" | "admin_prompt" | "admin_tour" | "member_prompt" | "member_tour"
  >("idle");
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  const [popoverPos, setPopoverPos] = useState<PopoverPos | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const activeSteps = tutorialPhase === "member_tour" ? MEMBER_STEPS : ADMIN_STEPS;
  const currentStep = activeSteps[currentStepIdx] || activeSteps[0];

  const lastScrolledStepRef = useRef<string | null>(null);
  const prevTargetStyleRef = useRef<{ el: HTMLElement; position: string; overflow: string } | null>(null);

  // Restore modified styles on previous target element to prevent layout side-effects
  const restorePrevTargetStyle = useCallback(() => {
    if (prevTargetStyleRef.current) {
      const { el, position, overflow } = prevTargetStyleRef.current;
      if (typeof document !== "undefined" && document.body.contains(el)) {
        el.style.position = position;
        el.style.overflow = overflow;
      }
      prevTargetStyleRef.current = null;
    }
  }, []);

  // Complete cleanup and dismissal function to unlock state and reset overlays
  const dismissTutorial = useCallback(() => {
    restorePrevTargetStyle();
    setIsOpen(false);
    setTutorialPhase("idle");
    setCurrentStepIdx(0);
    setTargetEl(null);
    setPopoverPos(null);
    lastScrolledStepRef.current = null;

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(TUTORIAL_STORAGE_KEY);
        sessionStorage.removeItem(TUTORIAL_STORAGE_KEY);
      } catch (e) {
        // Ignore storage errors
      }
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    }
  }, [restorePrevTargetStyle]);

  // Dynamic collision detection and position calculation for target highlight & chat bubble
  const updatePopoverPosition = useCallback(() => {
    if (!targetEl || !document.body.contains(targetEl)) {
      setPopoverPos(null);
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    // Highlight frame clamped inside viewport bounds
    const hTop = Math.max(4, rect.top - 8);
    const hLeft = Math.max(4, rect.left - 8);
    const hWidth = Math.min(vw - hLeft - 4, Math.max(10, rect.width + 16));
    const hHeight = Math.min(vh - hTop - 4, Math.max(10, rect.height + 16));

    // Popover bubble responsive width & position
    const width = Math.min(420, vw - 24);
    const centerX = rect.left + rect.width / 2;
    let left = centerX - width / 2;
    left = Math.max(12, Math.min(vw - width - 12, left));

    let pointerLeft = centerX - left;
    pointerLeft = Math.max(20, Math.min(width - 20, pointerLeft));

    const spaceBelow = vh - rect.bottom - 16;
    const spaceAbove = rect.top - 16;

    let placement: "top" | "bottom" | "center" = "bottom";

    if (spaceBelow >= 240) {
      placement = "bottom";
    } else if (spaceAbove >= 240) {
      placement = "top";
    } else if (spaceBelow >= spaceAbove) {
      placement = "bottom";
    } else {
      placement = "top";
    }

    // Fallback centered placement if screen space is severely constrained
    if (spaceBelow < 160 && spaceAbove < 160) {
      placement = "center";
    }

    if (placement === "center") {
      const maxHeight = Math.min(380, vh - 48);
      const top = Math.max(24, (vh - maxHeight) / 2);
      setPopoverPos({
        highlightRect: { top: hTop, left: hLeft, width: hWidth, height: hHeight },
        placement: "bottom",
        top,
        left,
        width,
        maxHeight,
        pointerLeft: width / 2,
      });
      return;
    }

    if (placement === "top") {
      const bottom = Math.max(12, vh - rect.top + 12);
      const maxHeight = Math.min(380, Math.max(180, rect.top - 24));
      setPopoverPos({
        highlightRect: { top: hTop, left: hLeft, width: hWidth, height: hHeight },
        placement,
        bottom,
        left,
        width,
        maxHeight,
        pointerLeft,
      });
    } else {
      const top = Math.max(12, Math.min(vh - 180, rect.bottom + 12));
      const maxHeight = Math.min(380, Math.max(180, vh - top - 16));
      setPopoverPos({
        highlightRect: { top: hTop, left: hLeft, width: hWidth, height: hHeight },
        placement,
        top,
        left,
        width,
        maxHeight,
        pointerLeft,
      });
    }
  }, [targetEl]);

  // Continuous Position Observer (ResizeObserver, MutationObserver, RAF & Scroll)
  useEffect(() => {
    if (!isOpen || (tutorialPhase !== "admin_tour" && tutorialPhase !== "member_tour")) {
      return;
    }

    updatePopoverPosition();

    // 1. ResizeObserver for target element and root document
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updatePopoverPosition();
      });
      if (targetEl) {
        resizeObserver.observe(targetEl);
      }
      resizeObserver.observe(document.documentElement);
    }

    // 2. MutationObserver on document body to detect async database loading or DOM shifts
    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(() => {
        if (!targetEl || !document.body.contains(targetEl)) {
          if (currentStep) {
            const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
            if (el) setTargetEl(el);
          }
        }
        updatePopoverPosition();
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }

    // 3. Scroll & Resize event listeners
    const handleUpdate = () => {
      updatePopoverPosition();
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    // 4. Interval polling fallback for dynamic layout shifts during async data loading
    const interval = setInterval(() => {
      updatePopoverPosition();
    }, 150);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
      clearInterval(interval);
    };
  }, [isOpen, tutorialPhase, targetEl, currentStep, updatePopoverPosition]);

  // Listen for trigger and dismissal/logout/storage events
  useEffect(() => {
    const handleStartEvent = (e: CustomEvent) => {
      const stepId = e.detail?.stepId;
      if (stepId) {
        const adminIdx = ADMIN_STEPS.findIndex((s) => s.id === stepId);
        if (adminIdx !== -1) {
          setTutorialPhase("admin_tour");
          setCurrentStepIdx(adminIdx);
        } else {
          const memberIdx = MEMBER_STEPS.findIndex((s) => s.id === stepId);
          if (memberIdx !== -1) {
            setTutorialPhase("member_tour");
            setCurrentStepIdx(memberIdx);
          } else {
            setTutorialPhase("admin_prompt");
            setCurrentStepIdx(0);
          }
        }
      } else {
        setTutorialPhase("admin_prompt");
        setCurrentStepIdx(0);
      }
      setIsOpen(true);
    };

    const handleDismissEvent = () => {
      dismissTutorial();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TUTORIAL_STORAGE_KEY && !e.newValue) {
        dismissTutorial();
      }
    };

    window.addEventListener("start-app-tutorial" as any, handleStartEvent);
    window.addEventListener("dismiss-app-tutorial" as any, handleDismissEvent);
    window.addEventListener("app-logout" as any, handleDismissEvent);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("start-app-tutorial" as any, handleStartEvent);
      window.removeEventListener("dismiss-app-tutorial" as any, handleDismissEvent);
      window.removeEventListener("app-logout" as any, handleDismissEvent);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dismissTutorial]);

  // Lifecycle listeners for pagehide and beforeunload to guarantee tab closure/reloads clear locked state
  useEffect(() => {
    const handleUnload = () => {
      dismissTutorial();
    };

    window.addEventListener("pagehide", handleUnload);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("pagehide", handleUnload);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [dismissTutorial]);

  // Route changes audit: automatically dismiss overlay when landing on root/gateway or during session transitions
  useEffect(() => {
    if (pathname === "/") {
      dismissTutorial();
    }
  }, [pathname, dismissTutorial]);

  // Dynamically attach tutorial elements directly to target DOM feature and auto-scroll
  useEffect(() => {
    if (!isOpen || (tutorialPhase !== "admin_tour" && tutorialPhase !== "member_tour")) {
      restorePrevTargetStyle();
      setTargetEl(null);
      lastScrolledStepRef.current = null;
      return;
    }

    if (!currentStep) return;

    // Navigate to correct page route if needed
    const targetPath = VIEW_ROUTES[currentStep.viewType];
    if (targetPath && pathname !== targetPath) {
      router.push(targetPath);
    }

    let attempts = 0;

    const checkAndAttach = () => {
      const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
      if (el) {
        restorePrevTargetStyle();

        const computedStyle = window.getComputedStyle(el);
        prevTargetStyleRef.current = {
          el,
          position: el.style.position,
          overflow: el.style.overflow,
        };

        if (computedStyle.position === "static") {
          el.style.position = "relative";
        }
        if (computedStyle.overflow === "hidden") {
          el.style.overflow = "visible";
        }

        setTargetEl(el);

        // Auto-scroll target into view if entering new step or when element is off-screen
        const stepKey = `${tutorialPhase}-${currentStep.id}`;
        if (lastScrolledStepRef.current !== stepKey) {
          lastScrolledStepRef.current = stepKey;
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return true;
      }
      return false;
    };

    if (!checkAndAttach()) {
      const interval = setInterval(() => {
        attempts++;
        if (checkAndAttach() || attempts > 40) {
          clearInterval(interval);
        }
      }, 100);

      return () => {
        clearInterval(interval);
        restorePrevTargetStyle();
      };
    }
  }, [isOpen, tutorialPhase, currentStepIdx, currentStep, pathname, router, restorePrevTargetStyle]);

  // Final unmount cleanup safety guarantee
  useEffect(() => {
    return () => {
      restorePrevTargetStyle();
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    };
  }, [restorePrevTargetStyle]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (tutorialPhase === "admin_tour") {
      if (currentStepIdx < ADMIN_STEPS.length - 1) {
        setCurrentStepIdx((prev) => prev + 1);
      } else {
        setTutorialPhase("member_prompt");
        restorePrevTargetStyle();
        setTargetEl(null);
      }
    } else if (tutorialPhase === "member_tour") {
      if (currentStepIdx < MEMBER_STEPS.length - 1) {
        setCurrentStepIdx((prev) => prev + 1);
      } else {
        dismissTutorial();
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    dismissTutorial();
  };

  return (
    <>
      {/* ADMIN PROMPT MODAL */}
      {tutorialPhase === "admin_prompt" && (
        <div
          onClick={dismissTutorial}
          className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121214] border-2 border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-8 text-zinc-100 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200 cursor-default"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-950/80 border-2 border-red-700/80 text-red-500 flex items-center justify-center mx-auto shadow-md">
              <Compass className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Proceed with the Admin Tutorial?
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-zinc-300 leading-relaxed">
                Learn how to manage gym members, monitor monthly revenue, configure subscription plans, and customize gym branding.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSkip}
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-xs transition cursor-pointer"
              >
                No, Skip
              </button>
              <button
                onClick={() => {
                  setTutorialPhase("admin_tour");
                  setCurrentStepIdx(0);
                }}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition shadow-lg shadow-red-600/30 cursor-pointer flex items-center gap-1.5"
              >
                Yes, Proceed <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER PROMPT MODAL */}
      {tutorialPhase === "member_prompt" && (
        <div
          onClick={dismissTutorial}
          className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121214] border-2 border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-8 text-zinc-100 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200 cursor-default"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-950/80 border-2 border-blue-700/80 text-blue-400 flex items-center justify-center mx-auto shadow-md">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Proceed with the Member Tutorial?
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-zinc-300 leading-relaxed">
                Explore the member portal experience, check active pass cards, student discount badges, and gym operating schedules.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSkip}
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold text-xs transition cursor-pointer"
              >
                No, Finish
              </button>
              <button
                onClick={() => {
                  setTutorialPhase("member_tour");
                  setCurrentStepIdx(0);
                }}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition shadow-lg shadow-blue-600/30 cursor-pointer flex items-center gap-1.5"
              >
                Yes, Proceed <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEWPORT-CONTAINED ANCHORED TUTORIAL OVERLAY & CHAT BUBBLE */}
      {targetEl &&
        popoverPos &&
        (tutorialPhase === "admin_tour" || tutorialPhase === "member_tour") &&
        createPortal(
          <>
            {/* Backdrop click area for dismissing tutorial */}
            <div
              onClick={dismissTutorial}
              className="fixed inset-0 z-[99990] bg-black/20 backdrop-blur-[1px] pointer-events-auto"
            />

            {/* Target Highlight Outline */}
            <div
              style={{
                position: "fixed",
                top: popoverPos.highlightRect.top,
                left: popoverPos.highlightRect.left,
                width: popoverPos.highlightRect.width,
                height: popoverPos.highlightRect.height,
                zIndex: 99998,
                pointerEvents: "none",
              }}
              className="rounded-2xl border-2 border-blue-400 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-pulse"
            >
              <div className="absolute -top-3.5 left-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-black tracking-wider text-white uppercase shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" /> Target Feature
              </div>
            </div>

            {/* Instructional Chat Bubble & Directional Indicator */}
            <div
              style={{
                position: "fixed",
                top: popoverPos.placement === "bottom" ? popoverPos.top : undefined,
                bottom: popoverPos.placement === "top" ? popoverPos.bottom : undefined,
                left: popoverPos.left,
                width: popoverPos.width,
                zIndex: 99999,
              }}
              className="text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Directional Indicator (Pointer Caret) */}
              {popoverPos.placement === "bottom" ? (
                <div
                  style={{ left: popoverPos.pointerLeft }}
                  className="absolute -top-3 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-blue-500 z-50"
                />
              ) : (
                <div
                  style={{ left: popoverPos.pointerLeft }}
                  className="absolute -bottom-3 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-blue-500 z-50"
                />
              )}

              {/* Chat Bubble Card */}
              <div
                style={{ maxHeight: popoverPos.maxHeight }}
                className="bg-zinc-900/98 border-2 border-blue-500/80 rounded-2xl shadow-2xl p-4 sm:p-5 text-zinc-100 backdrop-blur-xl flex flex-col justify-between space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-zinc-800 pb-2.5 shrink-0">
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
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5 pt-0.5">
                      <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
                      {currentStep.title}
                    </h2>
                  </div>

                  <button
                    onClick={handleSkip}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer shrink-0"
                    title="Close Tutorial"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Explanations (Scrollable) */}
                <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 min-h-0">
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

                {/* Footer Navigation (Always Visible & Unclipped) */}
                <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800 shrink-0">
                  <div className="text-[11px] font-extrabold text-zinc-400">
                    {tutorialPhase === "admin_tour" ? "Admin" : "Member"} Step{" "}
                    <span className="text-blue-400">{currentStepIdx + 1}</span> / {activeSteps.length}
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
                      {currentStepIdx === activeSteps.length - 1 ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                          {tutorialPhase === "admin_tour" ? "Next: Member Tour" : "Done"}
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
          </>,
          document.body
        )}
    </>
  );
}

/** Helper function to dismiss tutorial from anywhere */
export function dismissAppTutorial() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(TUTORIAL_STORAGE_KEY);
      sessionStorage.removeItem(TUTORIAL_STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
    window.dispatchEvent(new CustomEvent("dismiss-app-tutorial"));
    window.dispatchEvent(new CustomEvent("app-logout"));
  }
}

/** Helper function to open tutorial from anywhere */
export function startAppTutorial(stepId?: string) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify({ active: true, stepId, timestamp: Date.now() }));
    } catch (e) {
      // Ignore
    }
    window.dispatchEvent(new CustomEvent("start-app-tutorial", { detail: { stepId } }));
  }
}
