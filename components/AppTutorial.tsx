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
  Award,
  Search,
  Building2,
  Clock,
  Check,
  Phone,
  Tag,
  DollarSign,
  ArrowUpRight,
  Megaphone,
  LayoutDashboard,
  CreditCard,
  Palette,
  Dumbbell,
  Menu,
  HelpCircle,
  LogOut,
  Activity,
  UserPlus
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

export const MEMBER_STEPS: TutorialStep[] = [
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
  }
];

export function AppTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [tutorialPhase, setTutorialPhase] = useState<
    "idle" | "admin_prompt" | "admin_tour" | "member_prompt" | "member_tour"
  >("idle");
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const activeSteps = tutorialPhase === "member_tour" ? MEMBER_STEPS : ADMIN_STEPS;
  const currentStep = activeSteps[currentStepIdx] || activeSteps[0];

  // Listen for trigger event
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

  // Update position of spotlight & bubble pointer
  const updateSpotlightPosition = useCallback(() => {
    if (!isOpen || (tutorialPhase !== "admin_tour" && tutorialPhase !== "member_tour")) return;
    if (!currentStep) return;

    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, tutorialPhase, currentStep]);

  // Handle scroll and resize event listeners for dynamic stickiness
  useEffect(() => {
    if (!isOpen || (tutorialPhase !== "admin_tour" && tutorialPhase !== "member_tour")) return;

    const containerEl = containerRef.current;

    const handleScrollOrResize = () => {
      updateSpotlightPosition();
    };

    if (containerEl) {
      containerEl.addEventListener("scroll", handleScrollOrResize, { passive: true });
    }
    window.addEventListener("scroll", handleScrollOrResize, { passive: true, capture: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    return () => {
      if (containerEl) {
        containerEl.removeEventListener("scroll", handleScrollOrResize);
      }
      window.removeEventListener("scroll", handleScrollOrResize, { capture: true });
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, tutorialPhase, updateSpotlightPosition]);

  // Scroll into view & update spotlight on step changes
  useEffect(() => {
    if (!isOpen || (tutorialPhase !== "admin_tour" && tutorialPhase !== "member_tour")) return;

    const scrollTimer = setTimeout(() => {
      if (currentStep) {
        const el = document.querySelector(currentStep.targetSelector);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      updateSpotlightPosition();
    }, 80);

    const checkTimer = setTimeout(updateSpotlightPosition, 300);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(checkTimer);
    };
  }, [currentStepIdx, tutorialPhase, isOpen, updateSpotlightPosition, currentStep]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (tutorialPhase === "admin_tour") {
      if (currentStepIdx < ADMIN_STEPS.length - 1) {
        setCurrentStepIdx((prev) => prev + 1);
      } else {
        // Finished Admin Tour -> Show Member Prompt
        setTutorialPhase("member_prompt");
        setTargetRect(null);
      }
    } else if (tutorialPhase === "member_tour") {
      if (currentStepIdx < MEMBER_STEPS.length - 1) {
        setCurrentStepIdx((prev) => prev + 1);
      } else {
        // Finished Member Tour -> Close
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

  // Viewport geometry for position logic
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  const isMobile = viewportWidth < 768;
  const bubbleWidth = Math.min(420, viewportWidth - 24);
  let placement: "bottom" | "top" | "center" = "center";
  let bubbleStyle: React.CSSProperties = {};
  let arrowLeft = bubbleWidth / 2;

  if (targetRect && (tutorialPhase === "admin_tour" || tutorialPhase === "member_tour")) {
    const spaceBelow = viewportHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const targetCenterX = targetRect.left + targetRect.width / 2;

    if (isMobile) {
      if (spaceBelow >= 200) {
        placement = "bottom";
        const topPos = Math.max(10, Math.min(viewportHeight - 270, targetRect.bottom + 10));
        const leftPos = Math.max(10, Math.min(viewportWidth - bubbleWidth - 10, targetCenterX - bubbleWidth / 2));
        arrowLeft = Math.max(20, Math.min(bubbleWidth - 20, targetCenterX - leftPos));
        bubbleStyle = {
          top: `${topPos}px`,
          left: `${leftPos}px`,
          width: `${bubbleWidth}px`,
          maxHeight: "45vh"
        };
      } else if (spaceAbove >= 200) {
        placement = "top";
        const bottomPos = Math.max(10, viewportHeight - targetRect.top + 10);
        const leftPos = Math.max(10, Math.min(viewportWidth - bubbleWidth - 10, targetCenterX - bubbleWidth / 2));
        arrowLeft = Math.max(20, Math.min(bubbleWidth - 20, targetCenterX - leftPos));
        bubbleStyle = {
          bottom: `${bottomPos}px`,
          left: `${leftPos}px`,
          width: `${bubbleWidth}px`,
          maxHeight: "45vh"
        };
      } else {
        placement = "center";
        bubbleStyle = {
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          width: `${bubbleWidth}px`,
          maxHeight: "50vh"
        };
      }
    } else {
      if (spaceBelow >= 250 || spaceBelow > spaceAbove) {
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

      {/* Dynamic Sandbox Replica Background UI */}
      {(tutorialPhase === "admin_tour" || tutorialPhase === "member_tour") && (
        <div ref={containerRef} className="w-full h-full overflow-y-auto bg-[#09090B] text-zinc-100 relative">
          
          {/* ========================================================= */}
          {/* A. ADMIN TOUR - EXACT MATCH TO REAL ADMIN LAYOUT & SIDEBAR */}
          {/* ========================================================= */}
          {tutorialPhase === "admin_tour" && (
            <div className="flex flex-col lg:flex-row min-h-screen bg-[#09090B]">
              {/* Desktop Left Panel Sidebar (100% Match to Sidebar.tsx) */}
              <aside className="hidden lg:flex fixed top-0 bottom-0 left-0 z-30 w-68 bg-[#101116] border-r-2 border-zinc-800 p-5 flex-col justify-between shadow-2xl">
                <div className="space-y-7">
                  {/* Brand / Logo Header */}
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white border-2 border-zinc-700 bg-zinc-950 shadow-md overflow-hidden shrink-0">
                      <Dumbbell className="w-7 h-7 text-red-500" />
                    </div>
                    <div>
                      <h1 className="font-black text-base text-zinc-100 leading-tight">JLAB Fitness Gym</h1>
                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-red-500">
                        <Sparkles className="w-3 h-3 text-red-500" /> Gym Management
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links Left Panel Tabs */}
                  <nav className="space-y-2">
                    <div
                      className={`flex items-center justify-between px-3.5 py-3 min-h-[48px] rounded-lg font-extrabold text-xs sm:text-sm transition-all duration-200 border-2 ${
                        currentStep.viewType === "dashboard"
                          ? "bg-red-600 text-white border-red-500 shadow-soft"
                          : "text-zinc-300 bg-zinc-950/60 border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className={`w-5 h-5 shrink-0 ${currentStep.viewType === "dashboard" ? "text-white" : "text-zinc-400"}`} />
                        <span>Dashboard</span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center justify-between px-3.5 py-3 min-h-[48px] rounded-lg font-extrabold text-xs sm:text-sm transition-all duration-200 border-2 ${
                        currentStep.viewType === "members"
                          ? "bg-red-600 text-white border-red-500 shadow-soft"
                          : "text-zinc-300 bg-zinc-950/60 border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Users className={`w-5 h-5 shrink-0 ${currentStep.viewType === "members" ? "text-white" : "text-zinc-400"}`} />
                        <span>Members</span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center justify-between px-3.5 py-3 min-h-[48px] rounded-lg font-extrabold text-xs sm:text-sm transition-all duration-200 border-2 ${
                        currentStep.viewType === "subscriptions"
                          ? "bg-red-600 text-white border-red-500 shadow-soft"
                          : "text-zinc-300 bg-zinc-950/60 border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className={`w-5 h-5 shrink-0 ${currentStep.viewType === "subscriptions" ? "text-white" : "text-zinc-400"}`} />
                        <span>Subscriptions</span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center justify-between px-3.5 py-3 min-h-[48px] rounded-lg font-extrabold text-xs sm:text-sm transition-all duration-200 border-2 ${
                        currentStep.viewType === "settings"
                          ? "bg-red-600 text-white border-red-500 shadow-soft"
                          : "text-zinc-300 bg-zinc-950/60 border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Palette className={`w-5 h-5 shrink-0 ${currentStep.viewType === "settings" ? "text-white" : "text-zinc-400"}`} />
                        <span>Customization</span>
                      </div>
                    </div>
                  </nav>
                </div>

                {/* Left Panel Bottom Tenant & Logout Info */}
                <div className="space-y-2.5 pt-4 border-t border-zinc-800">
                  <div className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-blue-600 text-white font-extrabold text-xs shadow-md">
                    <HelpCircle className="w-4 h-4 text-white" />
                    <span>Interactive Tutorial</span>
                  </div>

                  <div className="p-3.5 rounded-lg border-2 border-zinc-800 bg-zinc-950 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">
                        Gym Active
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-zinc-700 animate-pulse" />
                    </div>
                    <p className="text-xs font-black text-zinc-100 truncate">JLAB Fitness Gym</p>
                  </div>

                  <div className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-zinc-900 text-red-400 border-2 border-zinc-800 font-extrabold text-xs">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Logout</span>
                  </div>
                </div>
              </aside>

              {/* Mobile Top App Bar (Mobile UI/UX) */}
              <div className="lg:hidden flex items-center justify-between bg-zinc-900/95 border-b-2 border-zinc-700/80 px-4 py-3 shadow-soft sticky top-0 z-30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold border-2 border-zinc-700 bg-zinc-950 shadow-soft overflow-hidden shrink-0">
                    <Dumbbell className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h1 className="font-black text-sm text-zinc-100 leading-none">JLAB Fitness Gym</h1>
                    <span className="text-[10px] font-extrabold text-red-500">
                      Front-Desk Portal
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <Menu className="w-5 h-5" />
                </div>
              </div>

              {/* Main Workspace Content (Shifted for Left Panel) */}
              <main className="flex-1 lg:pl-68 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full pb-24 lg:pb-8">
                
                {/* ADMIN REPLICA 1: DASHBOARD */}
                {currentStep.viewType === "dashboard" && (
                  <div className="space-y-6">
                    {/* Dashboard Header Component Replica */}
                    <div className="bg-[#121214] p-5 sm:p-7 md:p-8 rounded-2xl shadow-xl border-2 border-zinc-800/90 relative overflow-hidden">
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                          <div className="relative shrink-0">
                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-zinc-950 border-3 border-zinc-700 shadow-2xl flex items-center justify-center overflow-hidden">
                              <Dumbbell className="w-10 h-10 text-red-500" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-zinc-900"></span>
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-zinc-900 text-zinc-300 text-xs font-extrabold border border-zinc-700">
                              <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                              <span>Dashboard Overview</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
                              Welcome back, Manager!
                            </h1>
                            <div className="flex items-center gap-2 text-zinc-400 font-semibold text-xs sm:text-sm">
                              <span>Official Brand:</span>
                              <span className="text-zinc-100 font-extrabold bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-zinc-800 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                                JLAB Fitness Gym
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                          <div className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 text-zinc-200 font-extrabold text-xs sm:text-sm border-2 border-zinc-700">
                            <Palette className="w-4 h-4 text-red-500" />
                            <span>Edit Branding</span>
                          </div>
                          <div className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-extrabold text-xs sm:text-sm border-2 border-red-500">
                            <UserPlus className="w-4 h-4" />
                            <span>Add Member</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Target 1: Gym Metrics & Revenue Grid */}
                    <div
                      id="tutorial-metrics-grid"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2 rounded-2xl border-2 border-transparent"
                    >
                      <div className="p-5 rounded-2xl bg-[#121214] text-zinc-100 shadow-md border-2 border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-400">Active Members</span>
                          <div className="p-3 rounded-2xl bg-zinc-800 text-red-500 border border-zinc-700">
                            <Users className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100">24</div>
                        <p className="text-xs font-medium text-zinc-400">vs last month</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#121214] text-zinc-100 shadow-md border-2 border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-400">Est. Monthly Income</span>
                          <div className="p-3 rounded-2xl bg-zinc-800 text-emerald-400 border border-zinc-700">
                            <DollarSign className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100">₱28,800</div>
                        <p className="text-xs font-medium text-zinc-400">vs last month</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#121214] text-zinc-100 shadow-md border-2 border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-400">Projected Annual</span>
                          <div className="p-3 rounded-2xl bg-zinc-800 text-purple-400 border border-zinc-700">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100">₱345,600</div>
                        <p className="text-xs font-medium text-zinc-400">12-month projection</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#121214] text-zinc-100 shadow-md border-2 border-zinc-800 space-y-2">
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

                    {/* Target 2: Expiring Soon Follow-up Card */}
                    <div
                      id="tutorial-quick-actions"
                      className="p-6 sm:p-8 rounded-2xl bg-[#121214] border-2 border-zinc-800 space-y-5 shadow-xl"
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

                      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/80 border-2 border-amber-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="font-black text-base text-amber-100">Virgilio Flor E. Guaño</p>
                          <p className="text-xs font-bold text-amber-300 mt-0.5">Expires in 4 days (Phone: 09754100345)</p>
                        </div>
                        <div className="px-4 py-2 bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5 self-start sm:self-auto">
                          View Pass <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ADMIN REPLICA 2: MEMBERS ROSTER */}
                {currentStep.viewType === "members" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Members Directory</h2>
                        <p className="text-xs text-zinc-400 font-semibold mt-1">Registered gym members & subscription records</p>
                      </div>

                      <div className="px-5 py-3 rounded-xl bg-red-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shrink-0 self-start sm:self-auto">
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

                    {/* Target 3: Member Directory Table */}
                    <div
                      id="tutorial-members-table"
                      className="bg-[#121214] border-2 border-zinc-800 rounded-2xl overflow-hidden shadow-xl"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-zinc-950 border-b-2 border-zinc-800 text-zinc-400 font-extrabold uppercase tracking-wider">
                              <th className="py-4 px-5">Member Details</th>
                              <th className="py-4 px-5">Phone Number</th>
                              <th className="py-4 px-5">Active Plan</th>
                              <th className="py-4 px-5">Status & Badges</th>
                              <th className="py-4 px-5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800 text-zinc-200 font-medium">
                            {/* Row 1: Virgilio Flor E. Guaño */}
                            <tr className="bg-zinc-900/50">
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
                              {/* Target 4: Action Buttons */}
                              <td id="tutorial-members-actions" className="py-4 px-5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button className="px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-[11px] flex items-center gap-1">
                                    <Edit3 className="w-3.5 h-3.5 text-blue-400" /> Edit
                                  </button>
                                  <button className="px-2.5 py-1.5 rounded-lg bg-amber-950 border border-amber-800 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Strike
                                  </button>
                                  <button className="px-2.5 py-1.5 rounded-lg bg-red-950 border border-red-800 text-red-300 font-bold text-[11px] flex items-center gap-1">
                                    <Ban className="w-3.5 h-3.5 text-red-400" /> Ban
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Row 2: Secondary Mock Member */}
                            <tr className="bg-zinc-950/30">
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

                {/* ADMIN REPLICA 3: SUBSCRIPTIONS & BADGES */}
                {currentStep.viewType === "subscriptions" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Subscriptions & Custom Badges</h2>
                      <p className="text-xs text-zinc-400 font-semibold mt-1">Configure pricing plans and discount badges</p>
                    </div>

                    {/* Target 5: Subscription Plans Grid */}
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

                    {/* Target 6: Custom Badges Grid */}
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

                {/* ADMIN REPLICA 4: CUSTOMIZATION / SETTINGS */}
                {currentStep.viewType === "settings" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Gym Customization & Settings</h2>
                      <p className="text-xs text-zinc-400 font-semibold mt-1">Configure business name and custom logo</p>
                    </div>

                    {/* Target 7: Settings Branding */}
                    <div
                      id="tutorial-settings-branding"
                      className="p-6 sm:p-8 rounded-2xl bg-[#121214] border-2 border-zinc-800 space-y-6 shadow-xl"
                    >
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
                        <Building2 className="w-6 h-6 text-red-500" />
                        <div>
                          <h3 className="text-xl font-black text-white">Gym Branding & Graphics</h3>
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
                              <Dumbbell className="w-6 h-6 text-red-500" />
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
              </main>

              {/* Mobile Sticky Bottom Thumb Navigation Bar (100% Match to Mobile Sidebar) */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#101116] border-t-2 border-zinc-800 px-2 py-1.5 shadow-2xl flex items-center justify-around">
                <div
                  className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-w-[64px] min-h-[48px] border-2 ${
                    currentStep.viewType === "dashboard"
                      ? "bg-red-600 text-white border-red-500 shadow-soft"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] font-black">Dashboard</span>
                </div>

                <div
                  className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-w-[64px] min-h-[48px] border-2 ${
                    currentStep.viewType === "members"
                      ? "bg-red-600 text-white border-red-500 shadow-soft"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800"
                  }`}
                >
                  <Users className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] font-black">Members</span>
                </div>

                <div
                  className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-w-[64px] min-h-[48px] border-2 ${
                    currentStep.viewType === "subscriptions"
                      ? "bg-red-600 text-white border-red-500 shadow-soft"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] font-black">Subscriptions</span>
                </div>

                <div
                  className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-w-[64px] min-h-[48px] border-2 ${
                    currentStep.viewType === "settings"
                      ? "bg-red-600 text-white border-red-500 shadow-soft"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800"
                  }`}
                >
                  <Palette className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] font-black">Customization</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* B. MEMBER PORTAL TOUR REPLICA VIEW                        */}
          {/* ========================================================= */}
          {tutorialPhase === "member_tour" && (
            <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 pb-24">
              {/* Member Portal Top Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-zinc-950 border-2 border-zinc-700 flex items-center justify-center font-black text-red-500 text-sm overflow-hidden shadow-md">
                    <span className="text-red-500 font-extrabold">JLAB</span>
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-black text-zinc-100 tracking-tight">
                      JLAB Fitness Gym
                    </h1>
                    <p className="text-xs text-zinc-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Member Portal Guided Tour
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-lg text-xs font-black border-2 bg-red-600 border-red-500 text-white shadow-md">
                  Member Portal
                </div>
              </div>

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

              {/* Target Portal 1: Member Pass Card */}
              <div
                id="tutorial-portal-card"
                className="bg-[#121318] p-5 sm:p-7 rounded-2xl border-2 border-zinc-700/80 shadow-soft space-y-6"
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

                {/* Target Portal 2: Student Discount Badge Container */}
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

              {/* Target Portal 3: Operating Schedule */}
              <div
                id="tutorial-portal-schedule"
                className="bg-[#121318] p-5 sm:p-7 rounded-2xl border-2 border-zinc-700/80 shadow-soft space-y-4"
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
        </div>
      )}

      {/* Target Element Glowing Pulse Box */}
      {targetRect && (tutorialPhase === "admin_tour" || tutorialPhase === "member_tour") && (
        <div
          className="fixed border-2 border-blue-400 rounded-2xl shadow-[0_0_35px_rgba(59,130,246,0.85)] pointer-events-none transition-all duration-150 ease-out bg-blue-500/10 animate-pulse z-[99998]"
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

      {/* Interactive Chat Bubble Box Modal */}
      {(tutorialPhase === "admin_tour" || tutorialPhase === "member_tour") && (
        <div
          className="fixed z-[100000] bg-zinc-900/98 border-2 border-blue-500/80 rounded-2xl shadow-2xl shadow-black/95 p-4 sm:p-5 text-zinc-100 backdrop-blur-xl space-y-3.5 sm:space-y-4 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[85vh]"
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
              {tutorialPhase === "admin_tour" ? "Admin" : "Member"} Step <span className="text-blue-400">{currentStepIdx + 1}</span> / {activeSteps.length}
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
                    <CheckCircle2 className="w-3.5 h-3.5" /> {tutorialPhase === "admin_tour" ? "Next: Member Tour" : "Done"}
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
      )}
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
