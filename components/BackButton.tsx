"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 px-5 py-2 h-12 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-sm rounded-2xl border-4 border-slate-700/80 shadow-soft transition-all active:translate-y-0.5"
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>← Back</span>
    </button>
  );
}
