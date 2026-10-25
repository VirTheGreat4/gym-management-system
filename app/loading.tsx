import React from "react";
import { Dumbbell } from "lucide-react";

export default function Loading() {
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
          <div className="h-full bg-red-600 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
