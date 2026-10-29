/**
 * Bot Detection & Verification utilities (Cloudflare Turnstile, Honeypot, User-Agent pattern blocking).
 */

export interface BotVerificationResult {
  isHuman: boolean;
  reason?: string;
}

const KNOWN_BOT_USER_AGENTS = [
  'python-requests',
  'python-urllib',
  'curl/',
  'wget/',
  'puppeteer',
  'playwright',
  'selenium',
  'phantomjs',
  'headlesschrome',
  'postmanruntime',
  'sqlmap',
  'go-http-client',
  'libwww-perl',
  'node-fetch',
  'axios/',
];

/**
 * Validates whether a User-Agent matches automated script tools.
 */
export function isAutomatedBotAgent(userAgent?: string | null): boolean {
  if (!userAgent || userAgent.trim().length === 0) {
    // Missing user agent on public API/form requests is indicative of script bots
    return true;
  }
  const lowerUA = userAgent.toLowerCase();
  return KNOWN_BOT_USER_AGENTS.some((botKeyword) => lowerUA.includes(botKeyword));
}

/**
 * Checks honeypot field. Automated bots fill out hidden fields; human users do not.
 */
export function checkHoneypotTrap(honeypotValue?: string | null): boolean {
  if (honeypotValue && honeypotValue.trim().length > 0) {
    return false; // Trap tripped! Request is from a bot.
  }
  return true; // Passed honeypot test.
}

/**
 * Verifies Cloudflare Turnstile token with Cloudflare API.
 */
export async function verifyTurnstileToken(
  token?: string | null,
  remoteIp?: string | null
): Promise<BotVerificationResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If Turnstile is not explicitly configured with a secret key in environment,
  // ensure development fallback allows normal interaction while enforcing token presence if configured.
  if (!secretKey) {
    // In environments without secret key, ensure token is passed if widget was rendered
    if (process.env.NODE_ENV === 'production' && !token) {
      return { isHuman: false, reason: 'Missing bot verification token.' };
    }
    return { isHuman: true };
  }

  if (!token) {
    return { isHuman: false, reason: 'Bot verification failed: Missing Turnstile token.' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    });

    const data = await res.json();
    if (data.success) {
      return { isHuman: true };
    } else {
      return {
        isHuman: false,
        reason: 'Bot verification failed. Cloudflare Turnstile challenge invalid.',
      };
    }
  } catch (err: any) {
    console.error('Turnstile verification request failed:', err);
    return {
      isHuman: false,
      reason: 'Unable to verify anti-bot challenge right now. Please try again.',
    };
  }
}
