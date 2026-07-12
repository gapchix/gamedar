/**
 * Fixed-window in-memory rate limiter.
 *
 * Dependency-free so it can be bundled into both the proxy (middleware)
 * and server actions. Each bundle gets its own instance — counters are
 * per-process, which is fine for a single-container deployment.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

// Cap the map so an attacker rotating spoofed IPs can't grow it unbounded.
const MAX_TRACKED_KEYS = 10_000;

export function createRateLimiter(maxRequests: number, windowMs = 60_000) {
  const entries = new Map<string, WindowEntry>();

  function sweep(now: number): void {
    for (const [key, entry] of entries) {
      if (now > entry.resetAt) {
        entries.delete(key);
      }
    }
  }

  return {
    /** Returns true when the request is allowed. */
    check(key: string): boolean {
      const now = Date.now();

      if (entries.size >= MAX_TRACKED_KEYS) {
        sweep(now);
      }

      const entry = entries.get(key);

      if (!entry || now > entry.resetAt) {
        entries.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }

      entry.count++;
      return entry.count <= maxRequests;
    },
  };
}

/**
 * Client IP from proxied request headers.
 *
 * Uses the LAST x-forwarded-for entry: the reverse proxy (nginx with
 * proxy_add_x_forwarded_for) appends the address it saw, so the rightmost
 * value is the only one the client can't spoof.
 */
export function clientIpFromHeaders(headers: {
  get(name: string): string | null;
}): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const hops = forwardedFor.split(",");
    const ip = hops[hops.length - 1].trim();
    if (ip) return ip;
  }
  return headers.get("x-real-ip") ?? "unknown";
}
