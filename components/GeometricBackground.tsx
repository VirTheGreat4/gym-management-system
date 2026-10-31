'use client';

import { useState, useEffect } from 'react';

export type GlowTarget = 'card' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface GeometricBackgroundProps {
  activeGlow?: GlowTarget;
  onGlowChange?: (glow: GlowTarget) => void;
}

const NODES: GlowTarget[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export default function GeometricBackground({
  activeGlow: externalActiveGlow,
  onGlowChange,
}: GeometricBackgroundProps) {
  const [internalActiveGlow, setInternalActiveGlow] = useState<GlowTarget>('card');

  const currentGlow = externalActiveGlow ?? internalActiveGlow;

  const updateGlow = (next: GlowTarget) => {
    setInternalActiveGlow(next);
    if (onGlowChange) {
      onGlowChange(next);
    }
  };

  useEffect(() => {
    // 6.5s (6500ms) on middle card, then ~3.8s (3800ms) on a randomly chosen geometric shape
    const duration = currentGlow === 'card' ? 6500 : 3800;

    const timeout = setTimeout(() => {
      if (currentGlow === 'card') {
        const randomNode = NODES[Math.floor(Math.random() * NODES.length)];
        updateGlow(randomNode);
      } else {
        updateGlow('card');
      }
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentGlow]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft Ambient Radial Red Glow - Single traveling backlight synchronized with active node */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] md:w-[750px] h-[300px] sm:h-[500px] md:h-[750px] rounded-full blur-[80px] sm:blur-[120px] transition-all duration-1000 ease-in-out pointer-events-none ${
          currentGlow === 'top-left'
            ? 'bg-red-600/18 scale-110 -translate-x-3/4 -translate-y-3/4'
            : currentGlow === 'top-right'
            ? 'bg-red-600/18 scale-110 translate-x-0 -translate-y-3/4'
            : currentGlow === 'bottom-left'
            ? 'bg-red-600/18 scale-110 -translate-x-3/4 translate-y-0'
            : currentGlow === 'bottom-right'
            ? 'bg-red-600/18 scale-110 translate-x-0 translate-y-0'
            : 'bg-red-600/15 scale-100 -translate-x-1/2 -translate-y-1/2'
        }`}
      />

      {/* Grid Pattern SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.22] sm:opacity-[0.14] text-slate-400 pointer-events-none"
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
      <div className="absolute top-2 left-2 sm:top-6 sm:left-6 z-0">
        <div className="relative p-1 sm:p-2">
          <div
            className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
              currentGlow === 'top-left'
                ? 'bg-red-600/20 scale-125 opacity-80'
                : 'bg-red-600/0 scale-100 opacity-0'
            }`}
          />
          <svg
            className={`w-24 sm:w-44 h-24 sm:h-44 transition-all duration-700 ease-out ${
              currentGlow === 'top-left'
                ? 'text-red-500/90 opacity-90 scale-105 drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                : 'text-slate-400/50 opacity-50 sm:opacity-40 scale-100 drop-shadow-none'
            }`}
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
              className={`animate-geo-spin transition-all ${currentGlow === 'top-left' ? '[animation-duration:8s]' : ''}`}
            />
            <rect
              x="40"
              y="40"
              width="120"
              height="120"
              stroke="currentColor"
              strokeWidth="1"
              className={`animate-geo-spin-reverse transition-all ${currentGlow === 'top-left' ? '[animation-duration:6s]' : ''}`}
            />
            <circle
              cx="100"
              cy="100"
              r="70"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeDasharray="4 4"
              className={`animate-geo-dash transition-all ${currentGlow === 'top-left' ? 'stroke-[1.75]' : ''}`}
            />
            <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeWidth="0.75" className={`transition-all ${currentGlow === 'top-left' ? 'stroke-red-400' : ''}`} />
            <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="0.75" className={`transition-all ${currentGlow === 'top-left' ? 'stroke-red-400' : ''}`} />
          </svg>
        </div>
      </div>

      {/* Top Right Geometry Wireframe */}
      <div className="absolute top-2 right-2 sm:top-6 sm:right-6 z-0">
        <div className="relative p-1 sm:p-2">
          <div
            className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
              currentGlow === 'top-right'
                ? 'bg-red-600/20 scale-125 opacity-80'
                : 'bg-red-600/0 scale-100 opacity-0'
            }`}
          />
          <svg
            className={`w-24 sm:w-44 h-24 sm:h-44 transition-all duration-700 ease-out ${
              currentGlow === 'top-right'
                ? 'text-red-500/90 opacity-90 scale-105 drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                : 'text-slate-400/50 opacity-50 sm:opacity-40 scale-100 drop-shadow-none'
            }`}
            viewBox="0 0 200 200"
            fill="none"
          >
            <polygon
              points="100,10 178,55 178,145 100,190 22,145 22,55"
              stroke="currentColor"
              strokeWidth="1.2"
              className={`animate-geo-spin-reverse transition-all ${currentGlow === 'top-right' ? '[animation-duration:10s]' : ''}`}
            />
            <polygon
              points="100,40 152,70 152,130 100,160 48,130 48,70"
              stroke="currentColor"
              strokeWidth="1"
              className={`animate-geo-spin transition-all ${currentGlow === 'top-right' ? '[animation-duration:7s]' : ''}`}
            />
            <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.75" className={`animate-geo-pulse transition-all ${currentGlow === 'top-right' ? 'stroke-[1.5]' : ''}`} />
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="animate-geo-dash" />
            <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" />
            <line x1="22" y1="55" x2="178" y2="145" stroke="currentColor" strokeWidth="0.5" />
            <line x1="22" y1="145" x2="178" y2="55" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
      </div>

      {/* Bottom Left Geometry Wireframe */}
      <div className="absolute bottom-16 sm:bottom-6 left-2 sm:left-6 z-0">
        <div className="relative p-1 sm:p-2">
          <div
            className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
              currentGlow === 'bottom-left'
                ? 'bg-red-600/20 scale-125 opacity-80'
                : 'bg-red-600/0 scale-100 opacity-0'
            }`}
          />
          <svg
            className={`w-24 sm:w-44 h-24 sm:h-44 transition-all duration-700 ease-out ${
              currentGlow === 'bottom-left'
                ? 'text-red-500/90 opacity-90 scale-105 drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                : 'text-slate-400/50 opacity-50 sm:opacity-40 scale-100 drop-shadow-none'
            }`}
            viewBox="0 0 200 200"
            fill="none"
          >
            <polygon
              points="100,15 185,100 100,185 15,100"
              stroke="currentColor"
              strokeWidth="1.2"
              className={`animate-geo-spin transition-all ${currentGlow === 'bottom-left' ? '[animation-duration:9s]' : ''}`}
            />
            <polygon
              points="100,45 155,100 100,155 45,100"
              stroke="currentColor"
              strokeWidth="1"
              className={`animate-geo-spin-reverse transition-all ${currentGlow === 'bottom-left' ? '[animation-duration:6s]' : ''}`}
            />
            <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.75" className={`animate-geo-pulse transition-all ${currentGlow === 'bottom-left' ? 'stroke-[1.5]' : ''}`} />
            <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            <path d="M15 100 L185 100 M100 15 L100 185" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="animate-geo-dash" />
          </svg>
        </div>
      </div>

      {/* Bottom Right Geometry Wireframe */}
      <div className="absolute bottom-16 sm:bottom-6 right-2 sm:right-6 z-0">
        <div className="relative p-1 sm:p-2">
          <div
            className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
              currentGlow === 'bottom-right'
                ? 'bg-red-600/20 scale-125 opacity-80'
                : 'bg-red-600/0 scale-100 opacity-0'
            }`}
          />
          <svg
            className={`w-24 sm:w-52 h-24 sm:h-52 transition-all duration-700 ease-out ${
              currentGlow === 'bottom-right'
                ? 'text-red-500/90 opacity-90 scale-105 drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                : 'text-slate-400/50 opacity-50 sm:opacity-40 scale-100 drop-shadow-none'
            }`}
            viewBox="0 0 200 200"
            fill="none"
          >
            <polygon
              points="100,10 190,190 10,190"
              stroke="currentColor"
              strokeWidth="1.2"
              className={`animate-geo-spin-reverse transition-all ${currentGlow === 'bottom-right' ? '[animation-duration:9s]' : ''}`}
            />
            <polygon
              points="100,50 160,170 40,170"
              stroke="currentColor"
              strokeWidth="1"
              className={`animate-geo-spin transition-all ${currentGlow === 'bottom-right' ? '[animation-duration:7s]' : ''}`}
            />
            <circle cx="100" cy="130" r="30" stroke="currentColor" strokeWidth="0.75" className={`animate-geo-pulse transition-all ${currentGlow === 'bottom-right' ? 'stroke-[1.75]' : ''}`} />
            <path d="M100 10 L100 190 M10 190 L190 10" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className={`animate-geo-dash transition-all ${currentGlow === 'bottom-right' ? 'stroke-red-400' : ''}`} />
          </svg>
        </div>
      </div>

      {/* Floating Ambient Crosses */}
      <div className="absolute top-1/4 left-1/3 text-slate-400/40 pointer-events-none">
        <svg className="w-8 sm:w-10 h-8 sm:h-10 animate-geo-spin" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" fill="none" />
          <line x1="20" y1="4" x2="20" y2="36" stroke="currentColor" strokeWidth="0.5" />
          <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="absolute bottom-1/4 right-1/3 text-slate-400/40 pointer-events-none">
        <svg className="w-9 sm:w-12 h-9 sm:h-12 animate-geo-spin-reverse" viewBox="0 0 40 40">
          <polygon points="20,2 38,20 20,38 2,20" stroke="currentColor" strokeWidth="0.75" fill="none" />
          <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="0.5" fill="none" />
        </svg>
      </div>
    </div>
  );
}
