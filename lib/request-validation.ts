import { headers } from 'next/headers';
import { checkRateLimit, getClientIp, RateLimitResult } from './rate-limit';
import {
  checkHoneypotTrap,
  isAutomatedBotAgent,
  verifyTurnstileToken,
} from './bot-detection';

export interface PublicValidationOptions {
  actionName?: string;
  limit?: number;
  windowMs?: number;
  turnstileToken?: string | null;
  honeypotValue?: string | null;
  minInputLength?: number;
  maxInputLength?: number;
  inputString?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  ip: string;
  rateLimit?: RateLimitResult;
}

/**
 * Sanitizes input strings to prevent XSS / script injection.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>"']/g, (match) => {
      switch (match) {
        case '<':
          return '<';
        case '>':
          return '>';
        case '"':
          return '"';
        case "'":
          return '&#x27;';
        default:
          return match;
      }
    });
}

/**
 * Enforces strict request validation against automated script traffic,
 * rate limits, bot detection, and malicious input on public server endpoints.
 */
export async function validatePublicRequest(
  options: PublicValidationOptions = {}
): Promise<ValidationResult> {
  const {
    actionName = 'public-action',
    limit = 10,
    windowMs = 60000,
    turnstileToken,
    honeypotValue,
    minInputLength = 1,
    maxInputLength = 100,
    inputString,
  } = options;

  const requestHeaders = await headers();
  const clientIp = getClientIp(requestHeaders);
  const userAgent = requestHeaders.get('user-agent');

  // 1. Check honeypot field
  if (honeypotValue !== undefined && !checkHoneypotTrap(honeypotValue)) {
    return {
      valid: false,
      error: 'Automated request detected and blocked.',
      ip: clientIp,
    };
  }

  // 2. Check for suspicious bot User-Agent
  if (isAutomatedBotAgent(userAgent)) {
    return {
      valid: false,
      error: 'Automated script tools are prohibited.',
      ip: clientIp,
    };
  }

  // 3. Enforce IP rate limiting
  const rateLimitKey = `${actionName}:${clientIp}`;
  const rateLimitRes = await checkRateLimit(rateLimitKey, limit, windowMs);

  if (!rateLimitRes.success) {
    const secondsToWait = Math.ceil(rateLimitRes.resetMs / 1000);
    return {
      valid: false,
      error: `Too many requests. Please wait ${secondsToWait} seconds before trying again.`,
      ip: clientIp,
      rateLimit: rateLimitRes,
    };
  }

  // 4. Validate input string length & content if provided
  if (inputString !== undefined) {
    const trimmed = inputString.trim();
    if (trimmed.length < minInputLength) {
      return {
        valid: false,
        error: `Input must be at least ${minInputLength} character(s).`,
        ip: clientIp,
      };
    }
    if (trimmed.length > maxInputLength) {
      return {
        valid: false,
        error: `Input exceeds maximum length of ${maxInputLength} characters.`,
        ip: clientIp,
      };
    }
  }

  // 5. Verify Turnstile token if provided or required
  if (turnstileToken !== undefined) {
    const botCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!botCheck.isHuman) {
      return {
        valid: false,
        error: botCheck.reason || 'Bot detection challenge failed.',
        ip: clientIp,
      };
    }
  }

  return {
    valid: true,
    ip: clientIp,
    rateLimit: rateLimitRes,
  };
}
