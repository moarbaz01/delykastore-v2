// In-memory cache and rate limiter utility for serverless environments (Next.js)
// Note: This state persists per Vercel serverless function container. 
// It is perfectly suited for absorbing sudden bursts of traffic or debouncing.

type CacheEntry = { data: any; expiresAt: number };
type RateLimitEntry = { count: number; resetAt: number };

// Ensure we attach to the global object so hot-reloads in dev don't clear it
const getGlobalCache = () => {
  const globalAny = global as any;
  if (!globalAny.apiDataCache) {
    globalAny.apiDataCache = new Map<string, CacheEntry>();
  }
  return globalAny.apiDataCache;
};

const getGlobalRateLimit = () => {
  const globalAny = global as any;
  if (!globalAny.apiRateLimitMap) {
    globalAny.apiRateLimitMap = new Map<string, RateLimitEntry>();
  }
  return globalAny.apiRateLimitMap;
};

/**
 * Check if the current IP has exceeded the rate limit.
 * @param ip The IP address of the requester
 * @param maxRequests Maximum allowed requests in the time window
 * @param windowSeconds The time window in seconds
 * @returns boolean True if allowed, false if rate limited
 */
export const checkRateLimit = (ip: string, maxRequests: number = 10, windowSeconds: number = 60): boolean => {
  const map = getGlobalRateLimit();
  const now = Date.now();
  let entry = map.get(ip);

  if (!entry || now > entry.resetAt) {
    // New window
    entry = { count: 1, resetAt: now + windowSeconds * 1000 };
  } else {
    // Existing window
    entry.count++;
  }

  map.set(ip, entry);
  return entry.count <= maxRequests;
};

/**
 * Retrieve cached data by key.
 * @param key The unique cache key
 * @returns any The cached data, or null if missing/expired
 */
export const getCachedResult = (key: string): any | null => {
  const cache = getGlobalCache();
  const entry = cache.get(key);
  
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
};

/**
 * Save data to the cache.
 * @param key The unique cache key
 * @param data The data to cache
 * @param ttlSeconds Time-to-live in seconds
 */
export const setCachedResult = (key: string, data: any, ttlSeconds: number = 600) => {
  const cache = getGlobalCache();
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};
