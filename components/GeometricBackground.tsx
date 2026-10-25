'use client';

import { useState } from 'react';

export default function GeometricBackground() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft Ambient Radial Red Glow - Reacts smoothly on shape hover */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] rounded-full blur-[140px] transition-all duration-700 ease-out ${
          activeNode === 'top-left'
            ? 'bg-red-600/30 scale-125 -translate-x-3/4 -translate-y-3/4'
            : activeNode === 'top-right'
            ? 'bg-red-600/30 scale-125 translate-x-0 -translate-y-3/4'
            : activeNode === 'bottom-left'
            ? 'bg-red-600/30 scale-125 -translate-x-3/4 translate-y-0'
            : activeNode === 'bottom-right'
            ? 'bg-red-600/30 scale-125 translate-x-0 translate-y-0'
            : 'bg-red-600/15 scale-100'
        }`}
      />

      {/* Grid Pattern SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.12] text-slate-400 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="bg-grid-pattern" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeWidth="0.75" />
            <circle cx="36" cy="0" r="1.25" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-grid-pattern)" />
      </svg>

      {/* Top Left Geometry Wireframe */}
      <div
        onMouseEnter={() => setActiveNode('top-left')}
        onMouseLeave={() => setActiveNode(null)}
        className="absolute top-6 left-6 pointer-events-auto group cursor-pointer hidden sm:block z-0"
      >
        <div className="relative p-2">
          <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/25 rounded-full blur-2xl transition-all duration-500 scale-125" />
          <svg
            className="w-32 sm:w-44 h-32 sm:h-44 text-slate-400 group-hover:text-red-500 opacity-25 group-hover:opacity-100 scale-100 group-hover:scale-110 transition-all duration-500 ease-out group-hover:drop-shadow-[0_0_22px_rgba(220,38,38,0.85)]"
            viewBox="0 0 200 200"
            fill="none"
          >
            <rect
              x="20"
              y="20"
              width="160"
              height="160"
              stroke="currentColor"
              strokeWidth="1.2"
              className="animate-geo-spin group-hover:[animation-duration:8s] transition-all"
            />
            <rect
              x="40"
              y="40"
              width="120"
              height="120"
              stroke="currentColor"
              strokeWidth="1"
              className="animate-geo-spin-reverse group-hover:[animation-duration:6s] transition-all"
            />
            <circle
              cx="100"
              cy="100"
              r="70"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeDasharray="4 4"
              className="animate-geo-dash group-hover:stroke-[1.75] transition-all"
            />
            <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeWidth="0.75" className="group-hover:stroke-red-400 transition-all" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="0.75" className="group-hover:stroke-red-400 transition-all" />
          </svg>
        </div>
      </div>

      {/* Top Right Geometry Wireframe */}
      <div
        onMouseEnter={() => setActiveNode('top-right')}
        onMouseLeave={() => setActiveNode(null)}
        className="absolute top-6 right-6 pointer-events-auto group cursor-pointer hidden sm:block z-0"
      >
        <div className="relative p-2">
          <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/25 rounded-full blur-2xl transition-all duration-500 scale-125" />
          <svg
            className="w-32 sm:w-44 h-32 sm:h-44 text-slate-400 group-hover:text-red-500 opacity-25 group-hover:opacity-100 scale-100 group-hover:scale-110 transition-all duration-500 ease-out group-hover:drop-shadow-[0_0_22px_rgba(220,38,38,0.85)]"
            viewBox="0 0 200 200"
            fill="none"
          >
            <polygon
              points="100,10 178,55 178,145 100,190 22,145 22,55"
              stroke="currentColor"
              strokeWidth="1.2"
              className="animate-geo-spin-reverse group-hover:[animation-duration:10s] transition-all"
            />
            <polygon
              points="100,40 152,70 152,130 100,160 48,130 48,70"
              stroke="currentColor"
              strokeWidth="1"
              className="animate-geo-spin group-hover:[animation-duration:7s] transition-all"
            />
            <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.75" className="animate-geo-pulse group-hover:stroke-[1.5] transition-all" />
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="animate-geo-dash" />
            <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" />
            <line x1="22" y1="55" x2="178" y2="145" stroke="currentColor" strokeWidth="0.5" />
            <line x1="22" y1="145" x2="178" y2="55" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
      </div>

      {/* Bottom Left Geometry Wireframe */}
      <div
        onMouseEnter={() => setActiveNode('bottom-left')}
        onMouseLeave={() => setActiveNode(null)}
        className="absolute bottom-6 left-6 pointer-events-auto group cursor-pointer hidden sm:block z-0"
      >
        <div className="relative p-2">
          <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/25 rounded-full blur-2xl transition-all duration-500 scale-125" />
          <svg
            className="w-32 sm:w-44 h-32 sm:h-44 text-slate-400 group-hover:text-red-500 opacity-25 group-hover:opacity-100 scale-100 group-hover:scale-110 transition-all duration-500 ease-out group-hover:drop-shadow-[0_0_22px_rgba(220,38,38,0.85)]"
            viewBox="0 0 200 200"
            fill="none"
          >
            <polygon
              points="100,15 185,100 100,185 15,100"
              stroke="currentColor"
              strokeWidth="1.2"
              className="animate-geo-spin group-hover:[animation-duration:9s] transition-all"
            />
            <polygon
              points="100,45 155,100 100,155 45,100"
              stroke="currentColor"
              strokeWidth="1"
              className="animate-geo-spin-reverse group-hover:[animation-duration:6s] transition-all"
            />
            <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.75" className="animate-geo-pulse group-hover:stroke-[1.5] transition-all" />
            <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            <path d="M15 100 L185 100 M100 15 L100 185" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="animate-geo-dash" />
          </svg>
        </div>
      </div>

      {/* Bottom Right Geometry Wireframe */}
      <div
        onMouseEnter={() => setActiveNode('bottom-right')}
        onMouseLeave={() => setActiveNode(null)}
        className="absolute bottom-6 right-6 pointer-events-auto group cursor-pointer hidden sm:block z-0"
      >
        <div className="relative p-2">
          <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/25 rounded-full blur-2xl transition-all duration-500 scale-125" />
          <svg
            className="w-36 sm:w-52 h-36 sm:h-52 text-slate-400 group-hover:text-red-500 opacity-25 group-hover:opacity-100 scale-100 group-hover:scale-110 transition-all duration-500 ease-out group-hover:drop-shadow-[0_0_22px_rgba(220,38,38,0.85)]"
            viewBox="0 0 200 200"
            fill="none"
          >
            <polygon
              points="100,10 190,190 10,190"
              stroke="currentColor"
              strokeWidth="1.2"
              className="animate-geo-spin-reverse group-hover:[animation-duration:9s] transition-all"
            />
            <polygon
              points="100,50 160,170 40,170"
              stroke="currentColor"
              strokeWidth="1"
              className="animate-geo-spin group-hover:[animation-duration:7s] transition-all"
            />
            <circle cx="100" cy="130" r="30" stroke="currentColor" strokeWidth="0.75" className="animate-geo-pulse group-hover:stroke-[1.75] transition-all" />
            <path d="M100 10 L100 190 M10 190 L190 10" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="animate-geo-dash group-hover:stroke-red-400 transition-all" />
          </svg>
        </div>
      </div>

      {/* Floating Ambient Crosses */}
      <div className="absolute top-1/4 left-1/3 text-slate-500/20 pointer-events-auto hover:text-red-500 hover:opacity-100 transition-all cursor-pointer hidden md:block">
        <svg className="w-10 h-10 animate-geo-spin" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" fill="none" />
          <line x1="20" y1="4" x2="20" y2="36" stroke="currentColor" strokeWidth="0.5" />
          <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="absolute bottom-1/4 right-1/3 text-slate-500/20 pointer-events-auto hover:text-red-500 hover:opacity-100 transition-all cursor-pointer hidden md:block">
        <svg className="w-12 h-12 animate-geo-spin-reverse" viewBox="0 0 40 40">
          <polygon points="20,2 38,20 20,38 2,20" stroke="currentColor" strokeWidth="0.75" fill="none" />
          <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
      </div>
    </div>
  );
}
