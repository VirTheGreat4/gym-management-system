'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';
import { throttle } from '@/lib/async-utils';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_THRESHOLD_MS = 60 * 1000; // 60 seconds before timeout

export default function AdminInactivityGuard() {
  const pathname = usePathname();
  const router = useRouter();

  // Admin routes only
  const isPublicRoute = pathname === '/' || pathname === '/portal';

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const lastActivityTimeRef = useRef<number>(0);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleLogout = useCallback(async () => {
    if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    try {
      // Purge tokens/session from storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gym_admin_session');
        sessionStorage.clear();
      }
      await logoutAdmin();
    } catch (err) {
      console.error('Error invalidating admin session:', err);
    } finally {
      router.push('/?expired=1');
    }
  }, [router]);

  const resetActivityTimer = useCallback(() => {
    lastActivityTimeRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
    }
  }, [showWarning]);

  useEffect(() => {
    if (isPublicRoute) return;

    if (lastActivityTimeRef.current === 0) {
      lastActivityTimeRef.current = Date.now();
    }

    // Throttled activity listener
    const onUserActivity = throttle(() => {
      resetActivityTimer();
    }, 1000);

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'pointermove',
      'wheel',
      'click',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, onUserActivity, { passive: true });
    });

    // Interval checker every second
    intervalIdRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityTimeRef.current;
      const remainingMs = INACTIVITY_TIMEOUT_MS - elapsed;

      if (remainingMs <= 0) {
        handleLogout();
      } else if (remainingMs <= WARNING_THRESHOLD_MS) {
        setShowWarning(true);
        setSecondsRemaining(Math.ceil(remainingMs / 1000));
      } else {
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, onUserActivity);
      });
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [isPublicRoute, resetActivityTimer, handleLogout, showWarning]);

  if (isPublicRoute || !showWarning) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-amber-950/95 border-2 border-amber-500 rounded-xl p-4 shadow-2xl backdrop-blur-md text-amber-100 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-extrabold text-sm text-amber-200 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            Session Inactivity Warning
          </h4>
          <p className="font-medium text-amber-300/90">
            You have been inactive. For security, your admin session will expire in{' '}
            <span className="font-black text-amber-100 underline">
              {secondsRemaining}s
            </span>
            .
          </p>
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={resetActivityTimer}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Stay Logged In
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-200 font-bold rounded-lg text-xs transition cursor-pointer"
            >
              Log Out Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
