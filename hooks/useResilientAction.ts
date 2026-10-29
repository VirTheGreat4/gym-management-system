'use client';

import { useState, useCallback, useRef } from 'react';
import { executeWithRetry, RetryOptions } from '@/lib/async-utils';

export interface ResilientActionOptions extends RetryOptions {
  debounceMs?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export interface ResilientActionState<T = any> {
  isLoading: boolean;
  isRetrying: boolean;
  retryCount: number;
  error: string | null;
  isSuccess: boolean;
  data: T | null;
}

export function useResilientAction<T = any>(
  actionFn: (...args: any[]) => Promise<T>,
  options: ResilientActionOptions = {}
) {
  const {
    debounceMs = 300,
    maxAttempts = 3,
    initialDelayMs = 400,
    backoffFactor = 2,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<ResilientActionState<T>>({
    isLoading: false,
    isRetrying: false,
    retryCount: 0,
    error: null,
    isSuccess: false,
    data: null,
  });

  const lastClickTimeRef = useRef<number>(0);
  const isExecutingRef = useRef<boolean>(false);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isRetrying: false,
      retryCount: 0,
      error: null,
      isSuccess: false,
      data: null,
    });
  }, []);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      const now = Date.now();

      // Debounce & prevent duplicate clicks while executing
      if (isExecutingRef.current || now - lastClickTimeRef.current < debounceMs) {
        return null;
      }

      lastClickTimeRef.current = now;
      isExecutingRef.current = true;

      setState({
        isLoading: true,
        isRetrying: false,
        retryCount: 0,
        error: null,
        isSuccess: false,
        data: null,
      });

      try {
        const result = await executeWithRetry<T>(
          async () => {
            return await actionFn(...args);
          },
          {
            maxAttempts,
            initialDelayMs,
            backoffFactor,
            onRetry: (attempt, _err) => {
              setState((prev) => ({
                ...prev,
                isRetrying: true,
                retryCount: attempt,
              }));
            },
          }
        );

        setState({
          isLoading: false,
          isRetrying: false,
          retryCount: 0,
          error: null,
          isSuccess: true,
          data: result,
        });

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err: any) {
        const errorMessage =
          err?.message || 'Action failed due to a network or server issue.';

        setState({
          isLoading: false,
          isRetrying: false,
          retryCount: maxAttempts - 1,
          error: errorMessage,
          isSuccess: false,
          data: null,
        });

        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }

        return null;
      } finally {
        isExecutingRef.current = false;
      }
    },
    [actionFn, debounceMs, maxAttempts, initialDelayMs, backoffFactor, onSuccess, onError]
  );

  return {
    ...state,
    execute,
    reset,
  };
}
