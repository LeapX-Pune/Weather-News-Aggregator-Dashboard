/** In-memory + localStorage cache with TTL expiry */

import { getItem, setItem } from './storage.js';

const CACHE_PREFIX = 'ww_cache_';
const memoryCache = new Map();

export function getCache(key) {
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);
    if (entry.expires > Date.now()) return entry.data;
    memoryCache.delete(key);
  }

  const stored = getItem(`${CACHE_PREFIX}${key}`);
  if (!stored) return null;
  if (stored.expires < Date.now()) {
    try { localStorage.removeItem(`${CACHE_PREFIX}${key}`); } catch { /* noop */ }
    return null;
  }

  memoryCache.set(key, stored);
  return stored.data;
}

export function setCache(key, data, ttlMs = 600000) {
  const entry = { data, expires: Date.now() + ttlMs };
  memoryCache.set(key, entry);
  setItem(`${CACHE_PREFIX}${key}`, entry);
}

export function clearCache(key) {
  memoryCache.delete(key);
  try { localStorage.removeItem(`${CACHE_PREFIX}${key}`); } catch { /* noop */ }
}

export const TTL = {
  WEATHER: 10 * 60 * 1000,
  NEWS: 15 * 60 * 1000,
};
