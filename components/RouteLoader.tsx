"use client";

import React, { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";

export function RouteLoader({ children }: { children?: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 100);

    const handleLoad = () => {
      setProgress(100);
      setIsLoading(false);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      const fallbackTimer = setTimeout(handleLoad, 800);
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(fallbackTimer);
        clearInterval(interval);
      };
    }
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#CBD5E1] p-4">
        <div className="bg-[#E2E8F0] border-4 border-slate-700/80 rounded-3xl p-8 shadow-soft-lg flex flex-col items-center justify-center max-w-sm w-full space-y-5 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-sky-200 border-3 border-slate-700 flex items-center justify-center text-sky-800 shadow-soft">
            <Dumbbell className="w-9 h-9 animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-extrabold text-slate-900">Loading...</h2>
          </div>
          <div className="h-3 w-48 bg-slate-300 rounded-full border-2 border-slate-700/80 overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-150 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
