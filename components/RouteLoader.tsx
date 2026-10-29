"use client";

import React, { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";

export function RouteLoader({ children }: { children?: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(15);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return 90;
        }
        return prev + 15;
      });
    }, 80);

    const finishLoading = () => {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 180);
      return () => clearTimeout(timer);
    };

    if (document.readyState === "complete") {
      const timer = setTimeout(finishLoading, 150);
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    } else {
      const handleLoad = () => {
        finishLoading();
      };
      window.addEventListener("load", handleLoad);
      const fallbackTimer = setTimeout(finishLoading, 600);
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(fallbackTimer);
        clearInterval(interval);
      };
    }
  }, []);

  if (!isMounted || isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B] p-4 transition-opacity duration-300">
        <div className="bg-[#121214] border-2 border-zinc-800 rounded-3xl p-8 shadow-soft-lg flex flex-col items-center justify-center max-w-sm w-full space-y-5 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-red-500 shadow-soft">
            <Dumbbell className="w-9 h-9 animate-spin text-red-500" />
          </div>
          <div className="text-center space-y-1.5">
            <h2 className="text-lg font-black text-zinc-100 tracking-wide">Loading System...</h2>
            <p className="text-xs font-semibold text-zinc-400">Synchronizing state & preferences</p>
          </div>
          <div className="h-3 w-48 bg-zinc-900 rounded-full border border-zinc-700 overflow-hidden relative">
            <div
              className="h-full bg-red-600 transition-all duration-200 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

