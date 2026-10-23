"use client";

import React from "react";
import { useRouter } from "next/navigation";

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
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 border-4 border-slate-700/80 bg-slate-200 text-slate-800 rounded-2xl px-5 py-2 min-h-[48px] font-comic font-bold shadow-sm hover:bg-slate-300 active:translate-y-0.5 transition-all"
    >
      ← Back
    </button>
  );
}
