'use client';

import React from 'react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useResilientAction, ResilientActionOptions } from '@/hooks/useResilientAction';

export interface ResilientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClickAction?: () => Promise<any>;
  options?: ResilientActionOptions;
  loadingText?: string;
  retryText?: string;
  fallbackText?: string;
  showErrorFallback?: boolean;
  children: React.ReactNode;
}

export const ResilientButton = React.forwardRef<
  HTMLButtonElement,
  ResilientButtonProps
>(
  (
    {
      onClickAction,
      options,
      loadingText = 'Processing...',
      retryText = 'Retrying...',
      showErrorFallback = true,
      children,
      className = '',
      disabled,
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const action = useResilientAction(
      async () => {
        if (onClickAction) {
          return await onClickAction();
        }
      },
      options
    );

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
      }
      if (onClickAction) {
        await action.execute();
      }
    };

    const isDisabled = disabled || action.isLoading;

    return (
      <div className="inline-flex flex-col gap-1 w-full sm:w-auto">
        <button
          ref={ref}
          type={type}
          disabled={isDisabled}
          onClick={handleClick}
          className={`relative inline-flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 select-none ${className}`}
          {...props}
        >
          {action.isLoading ? (
            <span className="flex items-center justify-center gap-2">
              {action.isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                  <span>
                    {retryText} ({action.retryCount}/3)
                  </span>
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{loadingText}</span>
                </>
              )}
            </span>
          ) : (
            children
          )}
        </button>

        {showErrorFallback && action.error && (
          <div className="p-2 rounded-lg bg-red-950/90 border border-red-700/80 text-red-200 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in duration-200">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="truncate">{action.error}</span>
            <button
              type="button"
              onClick={() => action.reset()}
              className="ml-auto text-[10px] text-red-300 underline hover:text-white font-bold"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    );
  }
);

ResilientButton.displayName = 'ResilientButton';
