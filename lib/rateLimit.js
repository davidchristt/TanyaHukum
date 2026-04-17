// pertahanan serangan brute-force

import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache({
  max: 500,
  ttl: 60 * 1000, // 1 menit
});

export function rateLimit(ip, maxRequests = 5) {
  const key = `rate_limit_${ip}`;
  const current = rateLimitCache.get(key) ?? 0;

  if (current >= maxRequests) {
    return false; // Ditolak
  }

  rateLimitCache.set(key, current + 1);
  return true; // Diizinkan
}