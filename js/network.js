/** Network status, offline detection, retry, API health monitoring */

const listeners = new Set();
let healthStatus = 'healthy';
let retryCount = 0;
const MAX_RETRIES = 3;
let _networkInitialized = false;

export function getHealthStatus() {
  return healthStatus;
}

export function isOnline() {
  return navigator.onLine;
}

export function onNetworkChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notify() {
  listeners.forEach((cb) => cb({ online: navigator.onLine, health: healthStatus }));
}

export function initNetwork() {
  // Guard: only register listeners once to prevent accumulation
  if (_networkInitialized) return;
  _networkInitialized = true;

  window.addEventListener('online', () => {
    retryCount = 0;
    healthStatus = 'healthy';
    notify();
  });
  window.addEventListener('offline', () => {
    healthStatus = 'offline';
    notify();
  });
}

export async function withRetry(fn, options = {}) {
  const { maxRetries = MAX_RETRIES, delay = 1000 } = options;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (!navigator.onLine) {
      healthStatus = 'offline';
      // Only notify on first offline detection to avoid cascade
      if (attempt === 0) notify();
      throw new Error('You are offline. Please check your connection.');
    }

    try {
      const result = await fn();
      healthStatus = 'healthy';
      retryCount = 0;
      // Notify on success (state changed from degraded/unhealthy back to healthy)
      notify();
      return result;
    } catch (err) {
      // CRITICAL FIX: AbortErrors should never be retried
      if (err.name === 'AbortError') throw err;

      lastError = err;
      retryCount = attempt + 1;
      // Update health status silently — only notify external listeners on final state
      healthStatus = attempt < maxRetries ? 'degraded' : 'unhealthy';

      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delay * (attempt + 1)));
      }
    }
  }

  // Notify once after all retries exhausted
  notify();
  throw lastError;
}

export function getRetryCount() {
  return retryCount;
}
