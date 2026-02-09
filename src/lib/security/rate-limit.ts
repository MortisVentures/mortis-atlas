/**
 * Rate Limiting System
 *
 * Uses in-memory rate limiting for the application.
 * For production with multiple instances, consider adding Redis-based rate limiting.
 *
 * To enable Upstash Redis rate limiting:
 * 1. pnpm add @upstash/ratelimit @upstash/redis
 * 2. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
 * 3. Implement the Upstash integration
 */

// In-memory store for rate limiting
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  requests: number; // Number of requests allowed
  windowMs: number; // Time window in milliseconds
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Timestamp when the rate limit resets
}

// Clean up expired entries periodically
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    inMemoryStore.forEach((value, key) => {
      if (value.resetAt < now) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => inMemoryStore.delete(key));
  }, 60000); // Clean up every minute
}

/**
 * In-memory rate limiter using sliding window algorithm
 */
function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  startCleanup();

  const now = Date.now();
  const key = identifier;
  const entry = inMemoryStore.get(key);

  // If no entry or window expired, create new window
  if (!entry || entry.resetAt < now) {
    inMemoryStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests - 1,
      reset: now + config.windowMs,
    };
  }

  // Increment counter
  entry.count += 1;

  // Check if over limit
  if (entry.count > config.requests) {
    return {
      success: false,
      limit: config.requests,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

  return {
    success: true,
    limit: config.requests,
    remaining: config.requests - entry.count,
    reset: entry.resetAt,
  };
}

// ============================================
// Pre-configured rate limiters
// ============================================

/**
 * Rate limit for authentication endpoints (login, register, etc.)
 * 5 requests per minute per IP - strict to prevent brute force
 */
export async function checkAuthRateLimit(ip: string): Promise<RateLimitResult> {
  return checkRateLimitInMemory(`auth:${ip}`, { requests: 5, windowMs: 60 * 1000 });
}

/**
 * Rate limit for general API endpoints
 * 100 requests per minute per user - reasonable for normal usage
 */
export async function checkApiRateLimit(
  userId: string
): Promise<RateLimitResult> {
  return checkRateLimitInMemory(`api:${userId}`, { requests: 100, windowMs: 60 * 1000 });
}

/**
 * Rate limit for sensitive operations (password reset, 2FA setup)
 * 3 requests per 10 minutes per IP
 */
export async function checkSensitiveRateLimit(
  ip: string
): Promise<RateLimitResult> {
  return checkRateLimitInMemory(
    `sensitive:${ip}`,
    { requests: 3, windowMs: 10 * 60 * 1000 }
  );
}

/**
 * Rate limit for search/query endpoints
 * 30 requests per minute per user
 */
export async function checkSearchRateLimit(
  userId: string
): Promise<RateLimitResult> {
  return checkRateLimitInMemory(`search:${userId}`, { requests: 30, windowMs: 60 * 1000 });
}

// ============================================
// Utility functions
// ============================================

/**
 * Get client IP from request headers
 * Handles common proxy headers (X-Forwarded-For, X-Real-IP)
 */
export function getClientIp(request: Request): string {
  // Try X-Forwarded-For first (most common)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first (client)
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  // Try X-Real-IP (used by some proxies)
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  // Fallback for development
  return "127.0.0.1";
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", result.limit.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", result.reset.toString());
  return headers;
}

/**
 * Create a 429 Too Many Requests response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": result.reset.toString(),
      },
    }
  );
}
