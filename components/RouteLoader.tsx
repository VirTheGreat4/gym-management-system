"use client";

import React, { useEffect, useState } from "react";
import { Dumbbell, Loader2 } from "lucide-react";

export function RouteLoader({ children }: { children?: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#CBD5E1] p-4">
        <div className="bg-[#E2E8F0] border-4 border-slate-700/80 rounded-3xl p-8 shadow-soft-lg flex flex-col items-center justify-center max-w-sm w-full space-y-5 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-sky-200 border-3 border-slate-700 flex items-center justify-center text-sky-800 shadow-soft">
            <Dumbbell className="w-9 h-9 animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-extrabold text-slate-900">Loading gym system... please wait</h2>
            <p className="text-xs font-bold text-slate-600">Preparing front-desk portal and active sync</p>
          </div>
          <div className="w-48 h-3 bg-slate-300 rounded-full overflow-hidden border-2 border-slate-700">
            <div className="h-full bg-sky-500 animate-[pulse_0.8s_infinite] w-3/4 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
