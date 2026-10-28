"use client";

import React, { useState, useEffect, useCallback } from "react";
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

export function AppTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [tutorialPhase, setTutorialPhase] = useState<
    "idle" | "admin_prompt" | "admin_tour" | "member_prompt" | "member_tour"
  >("idle");
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const activeSteps = tutorialPhase === "member_tour" ? MEMBER_STEPS : ADMIN_STEPS;
  const currentStep = activeSteps[currentStepIdx] || activeSteps[0];

  // Listen for trigger events
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

    window.addEventListener("start-app-tutorial" as any, handleStartEvent);
    return () => {
      window.removeEventListener("start-app-tutorial" as any, handleStartEvent);
    };
  }, []);

  // Dynamically attach tutorial elements directly to target DOM feature
  useEffect(() => {
    if (!isOpen || (tutorialPhase !== "admin_tour" && tutorialPhase !== "member_tour")) {
      setTargetEl(null);
      return;
    }

    if (!currentStep) return;

    // Navigate to correct page route if needed
    const targetPath = VIEW_ROUTES[currentStep.viewType];
    if (targetPath && pathname !== targetPath) {
      router.push(targetPath);
    }

    let attempts = 0;
    let prevOverflow = "";

    const interval = setInterval(() => {
      attempts++;
      const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
      if (el) {
        // Ensure element supports relative positioning & non-clipped overflow for anchored tutorial callout
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.position === "static") {
          el.style.position = "relative";
        }
        if (computedStyle.overflow === "hidden") {
          prevOverflow = el.style.overflow;
          el.style.overflow = "visible";
        }

        setTargetEl(el);
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        clearInterval(interval);
      } else if (attempts > 30) {
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (targetEl && prevOverflow !== undefined) {
        targetEl.style.overflow = prevOverflow;
      }
    };
  }, [isOpen, tutorialPhase, currentStepIdx, currentStep, pathname, router]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (tutorialPhase === "admin_tour") {
      if (currentStepIdx < ADMIN_STEPS.length - 1) {
        setCurrentStepIdx((prev) => prev + 1);
      } else {
        setTutorialPhase("member_prompt");
        setTargetEl(null);
      }
    } else if (tutorialPhase === "member_tour") {
      if (currentStepIdx < MEMBER_STEPS.length - 1) {
        setCurrentStepIdx((prev) => prev + 1);
      } else {
        setTutorialPhase("idle");
        setIsOpen(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setTutorialPhase("idle");
    setIsOpen(false);
  };

  return (
    <>
      {/* ADMIN PROMPT MODAL */}
      {tutorialPhase === "admin_prompt" && (
        <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121214] border-2 border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-8 text-zinc-100 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
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
        <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121214] border-2 border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-8 text-zinc-100 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
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

      {/* SINGLE-LAYER ANCHORED TUTORIAL COMPONENTS (NATURAL DOM SCROLLING) */}
      {targetEl &&
        (tutorialPhase === "admin_tour" || tutorialPhase === "member_tour") &&
        createPortal(
          <div className="tutorial-single-layer-anchor">
            {/* Target Highlight Outline */}
            <div className="absolute -inset-2.5 rounded-2xl border-2 border-blue-400 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.5)] pointer-events-none z-30 animate-pulse">
              <div className="absolute -top-3.5 left-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-black tracking-wider text-white uppercase shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" /> Target Feature
              </div>
            </div>

            {/* Instructional Chat Bubble & Directional Indicator */}
            <div className="absolute z-40 top-full mt-4 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] max-w-[calc(100vw-2rem)] mx-auto text-left pointer-events-auto">
              {/* Directional Indicator (Pointer Caret) */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-blue-500 z-50" />

              {/* Chat Bubble Card */}
              <div className="bg-zinc-900/98 border-2 border-blue-500/80 rounded-2xl shadow-2xl p-4 sm:p-5 text-zinc-100 backdrop-blur-xl space-y-3.5 max-h-[80vh] overflow-y-auto">
                {/* Header */}
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

                {/* Explanations */}
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

                {/* Footer Navigation */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
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
          </div>,
          targetEl
        )}
    </>
  );
}

/** Helper function to open tutorial from anywhere */
export function startAppTutorial(stepId?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("start-app-tutorial", { detail: { stepId } }));
  }
}
