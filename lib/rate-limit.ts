/**
 * Serverless-compatible IP Rate Limiting for Vercel deployment.
 * Supports Upstash Redis REST integration when environment variables are set,
 * with a resilient in-memory sliding window fallback.
 */

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

// In-memory sliding window cache for fallback
const memoryStore = new Map<string, { timestamps: number[] }>();

// Periodic cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of memoryStore.entries()) {
      val.timestamps = val.timestamps.filter((ts) => now - ts < 60000);
      if (val.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Extracts client IP from request headers.
 */
export function getClientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
  const getHeader = (name: string): string | null => {
    if (headers instanceof Headers) {
      return headers.get(name);
    }
    const val = headers[name] || headers[name.toLowerCase()];
    if (Array.isArray(val)) return val[0];
    return val || null;
  };

  const xForwardedFor = getHeader('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  const cfConnectingIp = getHeader('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  const xRealIp = getHeader('x-real-ip');
  if (xRealIp) return xRealIp;

  return '127.0.0.1';
}

/**
 * Checks rate limit using Upstash Redis REST if configured, else in-memory sliding window.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. Try Upstash Redis if configured
  if (upstashUrl && upstashToken) {
    try {
      const key = `ratelimit:${identifier}`;
      const now = Date.now();
      const clearBefore = now - windowMs;

      // Pipeline using Upstash REST API
      const response = await fetch(`${upstashUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['ZREMRANGEBYSCORE', key, '0', clearBefore.toString()],
          ['ZADD', key, now.toString(), now.toString()],
          ['ZCARD', key],
          ['EXPIRE', key, Math.ceil(windowMs / 1000).toString()],
        ]),
        cache: 'no-store',
      });

      if (response.ok) {
        const results = await response.json();
        const currentCount = Number(results[2]?.result || 1);
        const remaining = Math.max(0, limit - currentCount);

        return {
          success: currentCount <= limit,
          limit,
          remaining,
          resetMs: windowMs,
        };
      }
    } catch (err) {
      console.warn('Upstash rate limit error, using memory fallback:', err);
    }
  }

  // 2. Fallback: In-memory sliding window rate limiter
  const now = Date.now();
  const record = memoryStore.get(identifier) || { timestamps: [] };

  // Filter timestamps within window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    memoryStore.set(identifier, { timestamps: validTimestamps });
    return {
      success: false,
      limit,
      remaining: 0,
      resetMs: windowMs - (now - validTimestamps[0]),
    };
  }

  validTimestamps.push(now);
  memoryStore.set(identifier, { timestamps: validTimestamps });

  return {
    success: true,
    limit,
    remaining: limit - validTimestamps.length,
    resetMs: windowMs,
  };
}
