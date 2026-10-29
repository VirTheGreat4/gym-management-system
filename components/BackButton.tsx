"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick?: () => void;
  href?: string;
  label?: string;
}

export function BackButton({ onClick, href, label = "Back" }: BackButtonProps = {}) {
  const router = useRouter();

  const handleBack = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (href) {
      router.push(href);
      return;
    }
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
      className="inline-flex items-center gap-2 border-2 border-zinc-700/80 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 rounded-xl px-4 py-2.5 min-h-[44px] font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
    >
      <ArrowLeft className="w-4 h-4 text-red-500" />
      <span>{label}</span>
    </button>
  );
}
