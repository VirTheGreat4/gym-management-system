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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B] p-4">
        <div className="bg-[#121214] border-2 border-zinc-800 rounded-3xl p-8 shadow-soft-lg flex flex-col items-center justify-center max-w-sm w-full space-y-5 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-red-500 shadow-soft">
            <Dumbbell className="w-9 h-9 animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-extrabold text-zinc-100">Loading...</h2>
          </div>
          <div className="h-3 w-48 bg-zinc-900 rounded-full border border-zinc-700 overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-150 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
