'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export interface BotProtectionProps {
  onTokenChange?: (token: string) => void;
  onHoneypotChange?: (val: string) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'dark' | 'light' | 'auto';
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export function BotProtection({
  onTokenChange,
  onHoneypotChange,
}: BotProtectionProps) {
  const [honeypotVal, setHoneypotVal] = useState('');
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const handleHoneypotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHoneypotVal(val);
    if (onHoneypotChange) {
      onHoneypotChange(val);
    }
  };

  useEffect(() => {
    if (!siteKey || !widgetContainerRef.current) return;

    // Load Turnstile script dynamically if not present
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
      script.async = true;
      script.defer = true;

      window.onloadTurnstileCallback = () => {
        if (window.turnstile && widgetContainerRef.current) {
          window.turnstile.render(widgetContainerRef.current, {
            sitekey: siteKey,
            theme: 'dark',
            callback: (token: string) => {
              if (onTokenChange) onTokenChange(token);
            },
          });
        }
      };

      document.head.appendChild(script);
    } else {
      window.turnstile.render(widgetContainerRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        callback: (token: string) => {
          if (onTokenChange) onTokenChange(token);
        },
      });
    }
  }, [siteKey, onTokenChange]);

  return (
    <div className="space-y-2">
      {/* Honeypot Trap - Visually hidden from humans, targeted at bot scripts */}
      <div className="opacity-0 absolute -z-50 h-0 w-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <label htmlFor="_hp_trap_field">Do not fill this field</label>
        <input
          type="text"
          id="_hp_trap_field"
          name="_hp_trap_field"
          tabIndex={-1}
          autoComplete="off"
          value={honeypotVal}
          onChange={handleHoneypotChange}
        />
      </div>

      {/* Cloudflare Turnstile Container if site key provided */}
      {siteKey ? (
        <div ref={widgetContainerRef} className="my-2 min-h-[65px] flex justify-center" />
      ) : (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 py-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Automated Script Protection & Rate Limiting Enabled</span>
        </div>
      )}
    </div>
  );
}
